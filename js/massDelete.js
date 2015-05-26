var ep = new ExcelPlus();
var SITEENV;
var userEmails = [];
var usersInfo = [];
var html = "";
var unIdentifiedUsers = [];
var patt1 = /\s/g;
var formattedStr = "";
var formattedArr = [];


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

        //excluding any additional letters/ signs in the excel cell 



        // iterate and push emails to userEmails array
        for (var i = 0; i < arr.length; i++) {
            html += '<tr>';
            for (var j = 0; j < arr[i].length; j++) {

                html += '<td>' + arr[i][j] + '</td>';
                if (arr[i][j] !== null) {
                    userEmails.push(arr[i][j]);
                }
            }

        }

        // for (var i = 0; i < userEmails.length; i++) {
        //     var formattedStr = userEmails[i].trim();
        //     formattedArr.push(formattedStr); //trimming the white spaces before/after the email string
        // }

        iterateUsers();


    }


});

function iterateUsers() {
    for (var x = 0; x < formattedArr.length; x++) {
        var aName = getUserLogIn(formattedArr[x]);
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
        user.setName(p.FirstName + " " + p.LastName);
        user.setLogin(p.AccountName);
        user.setEmail(p.WorkEmail);

        if (user.getEmail() === "undefined") {
            unIdentifiedUsers.push(user);
            console.log("Unidentified " + user);
        }
        usersInfo.push(user);
        generateUsersTable(user);

    });
};

//A Method for Displaying the Identified Users
function generateUsersTable(user) {
    var html = "<table>";
    // 
    html += '<tr>' + '<td><b>' + user.getName() + '</b> (<em>' + user.getEmail() + '</em>)</td>' + '</tr>';

    html += "</table>";
    $("#result").after(html);

}
