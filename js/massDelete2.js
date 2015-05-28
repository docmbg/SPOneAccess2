 var ep = new ExcelPlus();
var SITEENV;
var userEmails = [];
var usersInfo = [];
var html = "";
var unIdentifiedUsers = [];
var invalidUsers = [];

$(document).ready(function() {
   

//Gettin the current SP site

    SITEENV = $().SPServices.SPGetCurrentSite();
    var clip = new ZeroClipboard($("#d_clip_button"))
    console.log(SITEENV);


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

    //Method for Getting the user login name
    function getUserLogIn(email) {
        $SP().people(email, {url: SITEENV}, function(p) {
            if (typeof p === "string") {
               invalidUsers.push(email);
               $("#invalid-list").append('<li class="invalid-item">' + email + '</li>')
            } else{
                var login = p;
                console.log(login);

                var user = new User();
                user.setName(p.FirstName + " " + p.LastName);
                user.setLogin(p.AccountName);
                user.setEmail(p.WorkEmail);
                user.setPicture(p.PictureURL);

                usersInfo.push(user);

                $("#valid-list").append(
                    "<li style='width:200px'>"+ user.getName() +"  <span id='" + user.id +"' class='del' style='cursor:pointer;position:relative;top:1px'>delete</span></li>");

                $('.del').click(function(e) {
                    //e.preventDefault();
                    $(this).closest('li').remove();
                    usersInfo[parseInt($(this).attr('id'))] = undefined;
        
                });
            }

        });
    };
   

    $('#delete-users').click(function(){
        for(var i = 0 ; i < usersInfo.length; i++){
            if (usersInfo[i] != undefined){
                $().SPServices({
                    operation:"RemoveUserFromSite",
                    userLoginName: usersInfo[i].getLogin(),
                    async:true
                });
                console.log('usersInfo['+ i +'] is deleted');
            }else{
                console.log('usersInfo['+ i +'] is ' + usersInfo[i]);
            }
        }
    })
});
