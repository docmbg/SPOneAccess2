var _CTX = $().SPServices.SPGetCurrentSite(),
    _SPGrind = new SPGrind(),
    tempGroups;

var siteTemplate,
    fabTemplate,
    spData,
    currentUser,
    thisUserEmail = $().SPServices.SPGetCurrentUser({
        fieldName: "Email",
        debug: false
    });


var accessFab = {
    "color": "hpe-turquoise",
    "copy": true,
    "busy": false
};

$(function() {
    spData = _SPGrind.getSPSites(_CTX);
    currentUser = allocateUserDetails(thisUserEmail);
    siteTemplate = new Ractive({
        el: "#sites-container",
        template: "#site-template",
        data: {
            site: spData
        }
    });

    fabTemplate = new Ractive({
        el: "#action-btn-contaier",
        template: "#fab-template",
        data: accessFab
    });

    fabTemplate.on({
        copy: function(event) {
            copyUserPermissions();
            console.log(event.node);
            fabTemplate.animate("copy", false);
            // event.context.copy = false;
            fabTemplate.update();
        },
        paste: function(event) {
            pasteUserPermissions();
        },
        clearGroups: function(event) {
            tempGroups = "";
            event.context.copy = true;
            fabTemplate.update();
        }
    });

    siteTemplate.on({
        addUser: function(event) {
            event.context.addUser(currentUser);
            notifyOnUserChanged(event.context, currentUser, siteTemplate, " added to group.", 5000);
        },
        removeUser: function(event) {
            event.context.removeUser(currentUser);
            notifyOnUserChanged(event.context, currentUser, siteTemplate, " removed from group.", 5000);
        },
        getGroups: function(event) {
            event.context.setGroups();
            currentUser = allocateUserDetails(thisUserEmail);
            compareUser(event.context, currentUser, siteTemplate);
        }
    });
});

function notifyOnUserChanged(context, user, template, message, timeout) {
    user = allocateUserDetails(thisUserEmail);
    if (user.getName() !== "") {
        compareUser(context, user, template);
        Materialize.toast(user.getName() + message, timeout);
    } else {
        Materialize.toast("Action is not valid", timeout);
    }
}

function compareUser(obj, user, template) {

    var groups = [];

    if (user !== undefined) {
        if (obj instanceof Site) {
            groups = obj.groups;
        } else {
            groups.push(obj);
        }
        for (var j = 0; j < groups.length; j++) {
            groups[j].addable = !hasGroup(groups[j].name);
        }
    }

    template.update();

    function hasGroup(group) {
        return user.groups.some(function(v) {
            return v.name == group;
        });
    }
}

function copyUserPermissions() {
    console.log("Copying user permissions");
    allocateUserDetails(thisUserEmail);
    tempGroups = currentUser.getGroups();
}

function pasteUserPermissions() {
    if (!!window.Worker) {
        var pastePermissions = new Worker("http://ent264.sharepoint.hp.com/teams/DOCMeDev/WIP/OneAccess2/js/production/pastePermissionsWorker.js");
        pastePermissions.onmessage = function(e) {
            if (e.data === "working") {
                Materialize.toast("Began pasting user permissions.", 5000);
                fabTemplate.set("busy", true);
            } else if (e.data === "done") {
                Materialize.toast("Done pasting user permissions.", 5000);
                fabTemplate.set("busy", false);
            } else {
                Materialize.toast("Sorry, can't paste user permissions.", 5000);
            }
        };
        pastePermissions.postMessage([currentUser, tempGroups]);
    }
    siteTemplate.update();
}

function allocateUserDetails(email) {
    var user = new User();
    user.setEmail(email);
    user.setInfoByEmail();
    user.setGroups();
    return user;
}

$("#user_form").submit(function(e) {
    e.preventDefault();
    thisUserEmail = $("#user_email").val();
    currentUser = allocateUserDetails(thisUserEmail);
    if (currentUser.getName() !== "") {
        $("#user_email").val(currentUser.getName());
        for (var i = 0; i < spData.length; i++) {
            if (spData[i].groups) {
                console.log("Updating view on user change!");
                compareUser(spData[i], currentUser, siteTemplate);
            }
        }
    } else {
        $("#user_email").val("Invalid email").addClass("invalid");
    }
});
