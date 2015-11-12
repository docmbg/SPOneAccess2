"use strict";

var List = (function(){
    function List(){};

    List.prototype.setUrl = function(url){
        this.ulr = url;
    };

    List.prototype.getName = function(){
        return this.url;
    };

    List.prototype.setName = function(name){
        this.name = name;
    };

    List.prototype.getName = function(){
        return this.name;
    }

    // List.prototype.setPermissions = function(){
    //     this.permissions = [];
    // };

    // List.prototype.getPermissions = function(){
    //     return this.permissions;
    // };

    List.prototype.setGroups = function(){
        this.groups = [];
        var _this = this;
        $().SPServices({
            async: false,
            operation: "GetGroupCollectionFromWeb",
            url: this.getUrl(),
            completefunc: function(xData, Status) {
               $(xData.responseXML).find('Grouups > Group').each(function(){
                  

                    group = new Group();
                    group.setName(escapeHtml(this.getAttribute("Name")));
                    group.setUrl(_this.url);
                  
                    group.setPermissions();
                    group.setUsers();
                  
                    _this.groups.push(group);
               


               })
            }
        });
    };

    List.prototype.getGroups = function(){
        return this.groups;
    }

    return List;
})();





var Site = (function() {

    function Site() {}

    Site.prototype.setName = function(name) {
        this.name = name;
    };

    Site.prototype.getName = function() {
        return this.name;
    };

    Site.prototype.setUrl = function(url) {
        this.url = url;
    };

    Site.prototype.getUrl = function() {
        return this.url;
    };

    Site.prototype.setGroups = function(isAllInfoNeeded) {
        this.groups = [];
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetGroupCollectionFromWeb xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "";
        SOAPEnvelope.opfooter = "</GetGroupCollectionFromWeb>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";

        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            var result,
                group,
                i;
            if (req.status == 200 && req.readyState == 4) {
                if (!req.responseXML) {
                    result = req.responseText.split("<Group");
                    for (i = 2; i < result.length; i++) {
                        var name = result[i].match('Name="(.*)Description');
                        name = name[1].substring(0, name[1].length - 2);
                        group = new Group();
                        group.setName(name);
                        group.setUrl(_this.url);
                        if (isAllInfoNeeded){
                            group.setPermissions();
                            group.setUsers();
                        }
                        _this.groups.push(group);
                    }
                } else {
                    result = req.responseXML.getElementsByTagName("Group");
                    for (i = 0; i < result.length; i++) {
                        group = new Group();
                        //group.setName(result[i].getAttribute("Name"));
                        //console.log(group.getName())
                        group.setName(escapeHtml(result[i].getAttribute("Name")));
                        group.setUrl(_this.url);
                        if (isAllInfoNeeded){
                            group.setPermissions();
                            group.setUsers();
                        }
                        _this.groups.push(group);
                    }
                }
            }
        };
        req.open("POST", this.url + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromWeb");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
        req.send(msg);
    };

    Site.prototype.getGroups = function() {
        return this.groups;
    };
    return Site;
}());

// Beginning of group class description
var Group = (function() {

    function Group() {}

    Group.prototype.setName = function(name) {
        this.name = name;
    };

    Group.prototype.getName = function() {
        return this.name;
    };

    Group.prototype.setUrl = function(url) {
        this.url = url;
    };

    Group.prototype.getUrl = function() {
        return this.url;
    };

    Group.prototype.setPermissions = function() {
        this.permissions = [];
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetRoleCollectionFromGroup xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "<groupName>" + _this.name + "</groupName>";
        SOAPEnvelope.opfooter = "</GetRoleCollectionFromGroup>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";

        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            var result,
                i;
            if (req.status == 200 && req.readyState == 4) {
                if (!req.responseXML) {
                    result = req.responseText.split("<Role");
                    for (i = 2; i < result.length; i++) {
                        var role = result[i].match('Name="(.*)Description');
                        role = role[1].substring(0, role[1].length - 2);
                        _this.permissions.push(role);
                    }
                } else {
                    result = req.responseXML.getElementsByTagName("Role");
                    for (i = 0; i < result.length; i++) {
                        _this.permissions.push(result[i].getAttribute("Name"));
                    }
                }
            } 
            if (req.status == 500) {
                $('main').append('<div class="container error" style="background: rgb(255, 141, 109);">Ups!!!Something went wrong with group with name <b>'+ _this.name + '</b></div>');
                console.log('Unable to get permissions for group ' + _this.name);
            }
        };

        req.open("POST", _this.url + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetRoleCollectionFromGroup");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
        req.send(msg);
    };

    Group.prototype.getPermissions = function() {
        return this.permissions;
    };

    Group.prototype.setUsers = function() {
        this.users = [];
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetUserCollectionFromGroup xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "<groupName>" + _this.name + "</groupName>";
        SOAPEnvelope.opfooter = "</GetUserCollectionFromGroup>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";

        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            var result,
                i,
                user;
            if (req.status == 200 && req.readyState == 4) {
                if (!req.responseXML) {
                    result = req.responseText.split("<User");
                    for (i = 2; i < result.length; i++) {
                        user = new User();
                        var name = result[i].match('Name="(.*)LoginName');
                        name = name[1].substring(0, name[1].length - 2);
                        var userName = result[i].match('LoginName="(.*)Email');
                        userName = userName[1].substring(0, userName[1].length - 2);
                        var email = null;
                        if (!result[i].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)){
                            console.log(result[i])
                        }
                        if (!!result[i].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0]) {
                            email = result[i].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
                        }
                        user.setName(name);
                        user.setLogin(userName);
                        user.setEmail(email);
                        _this.users.push(user);
                    }
                } else {
                    result = req.responseXML.getElementsByTagName("User");
                    for (i = 0; i < result.length; i++) {
                        user = new User();
                        user.setName(result[i].getAttribute("Name"));
                        user.setLogin(result[i].getAttribute("LoginName"));
                        user.setEmail(result[i].getAttribute("Email"));
                        _this.users.push(user);
                    }
                }
            }
        };

        req.open("POST", this.url + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetUserCollectionFromGroup");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
        req.send(msg);
    };

    Group.prototype.getUsers = function() {
        return this.users;
    };

    Group.prototype.addUser = function(user) {
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<AddUserToGroup xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "<groupName>" + _this.name + "</groupName>" + "<userName>" + user.getName() + "</userName>" + "<userLoginName>" + user.getLogin() + "</userLoginName>" + "<userEmail>" + user.getEmail() + "</userEmail>";
        SOAPEnvelope.opfooter = "</AddUserToGroup>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";

        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            var result,
                group,
                i;
            if (req.status == 200 && req.readyState == 4) {
                if (!req.responseXML) {
                    console.log("From within worker: " + req.responseText);
                    // result = req.responseText.split("<Group");
                    // for (i = 2; i < result.length; i++) {
                    //     var name = result[i].match('Name="(.*)Description');
                    //     name = name[1].substring(0, name[1].length - 2);
                    //     group = new Group();
                    //     group.setName(name);
                    //     group.setUrl(_this.url);
                    //     //group.setPermissions();
                    //     //group.setUsers();
                    //     _this.groups.push(group);

                } else {
                	console.log("From within main thread: " + req.responseXML);
                    // result = req.responseXML.getElementsByTagName("Group");
                    // for (i = 0; i < result.length; i++) {
                    //     group = new Group();
                    //     group.setName(escapeHtml(result[i].getAttribute("Name")));
                    //     group.setUrl(_this.url);
                    //     //group.setPermissions();
                    //     //group.setUsers();
                    //     _this.groups.push(group);

                }
            } 
        };
        req.open("POST", this.url + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/AddUserToGroup");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
        req.send(msg);

    };

    Group.prototype.removeUser = function(user) {
        var _this = this;
        $().SPServices({
            operation: "RemoveUserFromGroup",
            groupName: this.name,
            userLoginName: user.getLogin(),
            completefunc: function(xData, Status) {
                if (Status == "error") {
                    console.log("Error!!! User cannot be deleted");
                } else {
                    console.log("Success!!! User was deleted");
                }
            }
        });
    };

    Group.prototype.toString = function groupToString() {
        var result = "Name: " + this.name + " ,URL: " + this.url + " ,Pemissions: " + this.permissions;
        return result;
    };
    return Group;
}());


// Beginning of user class description
var User = (function() {

    function User() {}

    User.prototype.setName = function(name) {
        this.name = name;
    };

    User.prototype.getName = function() {
        return this.name;
    };

    User.prototype.setLogin = function(login) {
        this.login = login;
    };

    User.prototype.getLogin = function() {
        return this.login;
    };

    User.prototype.setEmail = function(email) {
        this.email = email;
    };

    User.prototype.getEmail = function() {
        return this.email;
    };

    User.prototype.setPicture = function(picture) {
        this.picture = picture;
    };

    User.prototype.getPicture = function() {
        return this.picture;
    };

    User.prototype.setGroups = function() {
        this.groups = [];
        var _this = this;
        $().SPServices({
            operation: "GetGroupCollectionFromUser",
            userLoginName: this.login,
            async: false,
            completefunc: function(xData, Status) {
                if (Status == "error") {
                    console.log("Cannot get user groups");
                } else {
                    $(xData.responseXML).find("Group").each(function() {
                        var group = new Group();
                        group.setName(escapeHtml($(this).attr('Name')));
                        //group.setName($(this).attr("Name"));
                        group.setUrl($().SPServices.SPGetCurrentSite());
                        _this.groups.push(group);
                    });
                    return _this.groups;
                }
            }
        });
    };

    User.prototype.getGroups = function() {
        return this.groups;
    };

    User.prototype.addToGroup = function(groupName) {
        var _this = this;
        $().SPServices({
            operation: "AddUserToGroup",
            groupName: groupName,
            userName: _this.name,
            userLoginName: _this.login,
            userEmail: _this.email,
            async: false,
            completefunc: function(xData, Status) {
                if (Status == "error") {
                    console.log("Error!!! Cannot Add user to group - " + groupName);
                } else {
                    if ($(xData.responseXML).find("Group[Name='GroupName']").length == 1) {
                        $("#zz9_ID_PersonalizePage").remove();
                    }
                    console.log("Success!!! User was added to group");
                }

            }
        });
    };

    User.prototype.setInfoByEmail = function() {
        var _this = this;
        $().SPServices({
            async: false,
            operation: "GetUserLoginFromEmail",
            emailXml: '<Users><User Email="' + _this.email + '" /></Users>',
            completefunc: function(xData, Status) {
                if (Status == 'error') {
                    console.log('Invalid email');
                } else {
                    $(xData.responseXML).find('User').each(function() {
                        var login = $(this).attr('Login');
                        //login = login.substring(login.indexOf("|") + 1);
                        _this.setLogin(login);
                        _this.setName($(this).attr('DisplayName'));
                    });
                }
            }
        });
    };

    User.prototype.toString = function userToString() {
        var ret = "Name: " + this.name + "\n" +
            "Email: " + this.email + "\n" +
            "Login Name: " + this.login;
        return ret;
    };

    return User;
}());

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function(s) {
        return entityMap[s];
    });
}

// var sites = {
//     "site": []
// };

// sites.site.push(site1, site2);

// console.log(JSON.stringify(sites));
// console.log(site1.name);
