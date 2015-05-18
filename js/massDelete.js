var ep=new ExcelPlus();
// we call openLocal() and when the file is loaded then we want to display its content
// openLocal() will use the FileAPI if exists, otherwise it will use a Flash object
ep.openLocal({
  "flashPath":"2.2/swfobject/",
  "labelButton":"Open an Excel file"
},function() {
  // show the content of the first sheet
  var initialArray = ep.selectSheet('MassDelete').readAll();
  
  // extracting the users' emails and pushing them into a newly created userNames array
  var userNames = [];
  for (var i=0; i < initialArray.length; i++) {
 
    for (var j=0; j < initialArray[i].length; j++) {
     userNames.push(initialArray[i][j]);
    }
    
  }
  console.log(userNames);
})

var userObject = {
  loginNames = [],
  emails = []

};

userObject.emails = userNames;
console.log("This is a property" + userObject.emails);