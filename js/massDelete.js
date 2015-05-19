var ep=new ExcelPlus();
var usersEmails = [];
// we call openLocal() and when the file is loaded then we want to display its content
// openLocal() will use the FileAPI if exists, otherwise it will use a Flash object
ep.openLocal({
  "flashPath":"2.2/swfobject/",
  "labelButton":"Open an Excel file"
},function() {
  // show the content of the first sheet
  var initialArray = ep.selectSheet('MassDelete').readAll();
  
  // extracting the users' emails and pushing them into a newly created usersEmails array
  //var usersEmails = [];
  for (var i=0; i < initialArray.length; i++) {
 
    for (var j=0; j < initialArray[i].length; j++) {
     usersEmails.push(initialArray[i][j]);
    }
    
  }
 
  console.log(usersEmails);
})

  //Class for user


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

    User.prototype.toString = function userToString(){
        var ret = 'Name: ' + privateStore[this.id]._name + "\n" +
                  'Email: ' + privateStore[this.id]._email + "\n" +
                  'Login Name: ' + privateStore[this.id]._login;
        return ret;
    };

    return User;
}());



 //Getting the login usename 

  for (var i = 0; i < usersEmails.length; i++) {
      $SP().people(usersEmails[i], function(people) {
        if (typeof people === "string") {
          alert(people); // there was a problem so we prompt it
        } else
        for (var i=0; i < people.length; i++) console.log(people[i]+" = "+people[people[i]]);
    });
  };
