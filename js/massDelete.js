var ep = new ExcelPlus();
var SITEENV;
var userEmails = [];
var usersInfo = [];
var html = "";
var aName = "";

//Gettin the current SP site
$(document).ready(function() {
    SITEENV = $().SPServices.SPGetCurrentSite();
    console.log(SITEENV);
});

function resetAll() {
    ep.reset();
    usersInfo = [];
    userEmails = [];
};

// we call openLocal() and when the file is loaded then we want to display its content
// openLocal() will use the FileAPI if exists, otherwise it will use a Flash object
ep.openLocal({
    "flashPath": "2.2/swfobject/",
    "labelButton": "Open an Excel file"
}, function() {
    if (ep.selectedSheet !== "MassDelete") {

        $("#error").html("The name of the Excel Worksheet should be MassDelete");
        resetAll();


    } else {

        var arr = ep.selectSheet('MassDelete').readAll();
        resetAll();
        $("#error").html("");

        //setting the the html table to iclude the user's emails 


        // iterate and push emails to userEmails array
        for (var i = 0; i < arr.length; i++) {
            html += '<tr>';
            for (var j = 0; j < arr[i].length; j++) {
                html += '<td>' + arr[i][j] + '</td>'
                userEmails.push(arr[i][j]);
            }

        }
        iterateUsers();

    }


});

function iterateUsers() {
    for (var x = 0; x < userEmails.length; x++) {
        var aName = getUserLogIn(userEmails[x]);
        console.log(aName);
    }
};

//User objects constructor

var User = (function() {
    // Create a store to hold the private objects.
    var privateStore = {};
    var uid = 0;

    function User() {
        privateStore[this.id = uid++] = {};
        privateStore[this.id]._name = "No name";
        privateStore[this.id]._email = "No email specified";
        privateStore[this.id]._login = "No login name";
    }

    User.prototype.setName = function(name) {
        privateStore[this.id]._name = name;
    };

    User.prototype.getName = function() {
        return privateStore[this.id]._name;
    };

    User.prototype.setLogin = function(login) {
        privateStore[this.id]._login = login;
    };

    User.prototype.getLogin = function() {
        return privateStore[this.id]._login;
    };

    User.prototype.setEmail = function(email) {
        privateStore[this.id]._email = email;
    };

    User.prototype.getEmail = function() {
        return privateStore[this.id]._email;
    };

    User.prototype.toString = function userToString() {
        var ret = 'Name: ' + privateStore[this.id]._name + "\n" +
            'Email: ' + privateStore[this.id]._email + "\n" +
            'Login Name: ' + privateStore[this.id]._login;
        return ret;
    };

    return User;
}());


//Method for Getting the user login name

function getUserLogIn(email) {
    $SP().people(email, {
        url: SITEENV
    }, function(p) {


        var user = new User();
        user.setName = p.FirstName + " " + p.LastName;
        user.setLogin = p.AccountName;
        user.setEmail = p.WorkEmail;

        usersInfo.push(user);
        var html = "<table>";
        // 
        for (user in usersInfo) {
            html += '<tr>' + '<td>' + user.setName + '' + user.setEmail + '</td>' + '</tr>';
        }
        html += "</table>";
        $("#result").after(html);

    });
};
