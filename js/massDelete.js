var ep = new ExcelPlus();
var SITEENV;
var userEmails = [];
var usersInfo = []

//Gettin the current SP site
$(document).ready(function() {
    SITEENV = $().SPServices.SPGetCurrentSite();
    console.log(SITEENV);
});


// we call openLocal() and when the file is loaded then we want to display its content
// openLocal() will use the FileAPI if exists, otherwise it will use a Flash object
ep.openLocal({
    "flashPath": "2.2/swfobject/",
    "labelButton": "Open an Excel file"
}, function() {
    var arr = ep.selectSheet('MassDelete').readAll();

    // iterate and push emails to userEmails array
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].length; j++) {
            userEmails.push(arr[i][j]);
        }
    }
    iterateUsers();
});

function iterateUsers() {
    for (var x = 0; x < userEmails.length; x++) {
        var aName = getUserLogIn(userEmails[x]);
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
        var login = p;
        console.log(login);

        var user = new User();
        user.setName = p.FirstName + " " + p.LastName;
        user.setLogin = p.AccountName;
        user.setEmail = p.WorkEmail;

        usersInfo.push(user);

    });
};
