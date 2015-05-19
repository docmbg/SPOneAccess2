var ep=new ExcelPlus();
var uploadedUsers = [];
var userAccountNames = []

// we call openLocal() and when the file is loaded then we want to display its content
// openLocal() will use the FileAPI if exists, otherwise it will use a Flash object
ep.openLocal({
  "flashPath":"2.2/swfobject/",
  "labelButton":"Open an Excel file"
},function() {
  // show the content of the first sheet
  var uploadedUsers = ep.selectSheet('MassDelete').readAll();
  
  // extracting the users' emails and pushing them into a newly created usersEmails array
  //var usersEmails = [];
  for (var i=0; i < uploadedUsers.length; i++) {
 
    for (var j=0; j < uploadedUsers[i].length; j++) {
      var userMail = uploadedUsers[i][j];
      console.log(userMail);
      getUserLogIn(userMail);
    }
    
  }

})


//Method for Getting the user login name

function getUserLogIn(email){
      var login = "No login name yet";
      var dfd = $.Deferred();
      $SP().people(email, function(p) {
        dfd.resolve(p);
    });
      dfd.done(function(p){
          login = p.AccountName;
          userAccountNames.push(login);
          console.log(userAccountNames);
      });
}
 //Getting the login usename 
