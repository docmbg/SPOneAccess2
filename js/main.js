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
    spData = _SPGrind.getSPSites(_CTX, false);
    //currentUser = allocateUserDetails(thisUserEmail);
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

    showCurrentUserGroups();

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
            event.context.setGroups(false);
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
    showCurrentUserGroups();
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
        var pastePermissions = new Worker("js/pastePermissionsWorker.js");
        pastePermissions.onmessage = function(e) {
            if (e.data === "working") {
                Materialize.toast("Began pasting user permissions.", 5000);
                fabTemplate.set("busy", true);
            } else if (e.data === "done") {
                Materialize.toast("Done pasting user permissions.", 5000);
                fabTemplate.set("busy", false);
                showCurrentUserGroups();
            } else {
                Materialize.toast("Sorry, can't paste user permissions.", 5000);
            }
        };
        pastePermissions.postMessage([currentUser, tempGroups]);
    }
    siteTemplate.update();
}

function allocateUserDetails(userData) {
    var user = new User();
    if (!!userData.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)){
        user.setEmail(userData);
        user.setInfoByEmail(_CTX);
    }else{
        user.setLogin(userData);
        user.setInfoByLogin(_CTX);
        thisUserEmail = user.getEmail();
    }
    user.setGroups();
    return user;
};

$('#user_form').submit(function(e) {
    e.preventDefault();
    thisUserEmail = $('#user_email').val();
    currentUser = allocateUserDetails(thisUserEmail);
    //thisUserEmail = currentUser.email;
    if (currentUser.getName() !== '' && currentUser.getName() !== undefined) {
        $("#user_email").val(currentUser.getName());
        for (var i = 0; i < spData.length; i++) {
            if (spData[i].groups) {
                console.log("Updating view on user change!");
                compareUser(spData[i], currentUser, siteTemplate);
            }
        }
        showCurrentUserGroups();
    } else {
        $('#user_email').val('Invalid Email/Login').addClass('invalid');
        $('#current-groups-container').children().remove();
    }
});


//for the matrix
function saveExcelFile(data, fileName) {
    //set the file name
    var filename = fileName + '.xlsx';

    //put the file stream together
    var s2ab = function(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    };
    //invoke the saveAs method from FileSaver.js
    saveAs(new Blob([s2ab(data)], {
        type: 'application/octet-stream'
    }), filename);
};

function convertNumber(n) {
    var ordA = 'A'.charCodeAt(0);
    var ordZ = 'Z'.charCodeAt(0);
    var len = ordZ - ordA + 1;
  
    var s = "";
    while(n >= 0) {
        s = String.fromCharCode(n % len + ordA) + s;
        n = Math.floor(n / len) - 1;
    }
    return s;
};
function generateMatrixExcel(sites, groups, lists){
    var ep = new ExcelPlus();
    ep.createFile('Permission Matrix');
    ep.createSheet('Users');
    ep.createSheet('Restricted Lists');
    var cellNumber = '';            
    for (var i = 0; i < sites.length; i++){
        cellNumber = convertNumber(i + 1);
        cellNumber += 1;
        ep.write({
            'sheet' : 'Permission Matrix',
            'cell' :  cellNumber,
            'content' : sites[i].name
        });
    }
    for (var i = 0; i < groups.length; i++){
        ep.write({
            'sheet' : 'Permission Matrix',
            'cell' : 'A' + (i + 2),
            'content' : groups[i].name
        });
        for (var j = 0; j < sites.length; j++){
            for(var k = 0; k < groups[i].url.length; k++){
                if (sites[j].url == groups[i].url[k]){
                    cellNumber = '';
                    cellNumber = convertNumber(j + 1);
                    cellNumber += (i + 2);
                    var groupPermissions = '';
                    for (var p = 0; p < groups[i].permissions[k].length; p++){
                        var comma = ', '
                        if (p == groups[i].permissions[k].length - 1){
                            comma = ''
                        }
                        groupPermissions += groups[i].permissions[k][p] + comma;
                    }
                    ep.write({
                        'sheet' : 'Permission Matrix',
                        'cell' : cellNumber,
                        'content' : groupPermissions
                    })
                }
            }
        }
        cellNumber = convertNumber(i); 
        ep.write({
            'sheet' : 'Users',
            'cell' : cellNumber + 1,
            'content' : groups[i].name
        })
        for(var u = 0; u < groups[i].users.length; u++){
            var userInfo = groups[i].users[u].email || groups[i].users[u].login;
            ep.write({
                'sheet' : 'Users',
                'cell' : cellNumber + (u + 2),
                'content' : userInfo
            })
        } 
    };
    for(var i = 0; i < restrictedLists.length; i++){
        var cellNumber = convertNumber(i);
        //cellNumber += 1;
        ep.write({
            'sheet': 'Restricted Lists',
            'cell' : cellNumber + 1,
            'content' : restrictedLists[i].name
        })
         ep.write({
            'sheet': 'Restricted Lists',
            'cell' : cellNumber + 2,
            'content' : restrictedLists[i].url
        })
        for(var j = 0; j < restrictedLists[i].groups.length; j++){
            var cellN = cellNumber + (j + 3);
            var groupPermission;
            switch(restrictedLists[i].groups[j].mask){
                case '138612833': groupPermission = 'Read'; 
                    break;
                case '1011028719': groupPermission = 'Contribute'; 
                    break;
                case '2082937855': groupPermission = 'Owners Full Control';
                    break;
                case '2134318079': groupPermission = 'Owners Full Control';
                    break;
                case '-1': groupPermission = 'Owner';
                    break;
                default: groupPermission = restrictedLists[i].groups[j].mask;
                    break;
            }
            ep.write({
                'sheet': 'Restricted Lists',
                'cell' : cellN,
                'content' : restrictedLists[i].groups[j].name + ' - ' + groupPermission
            })
        }
    }

    // ep.write({'sheet': 'Restricted Lists', 'cell': 'A1', 'content': 'List Name'});
    // ep.write({'sheet': 'Restricted Lists', 'cell': 'B1', 'content': 'URL'});
    // for(var i = 0; i < lists.length; i++){
    //     //var name = lists[i].name;
    //     //var url = lists[i].url;
    //     ep.write({
    //         'sheet' : 'Restricted Lists',
    //         'cell' : 'A' + (i + 2),
    //         'content' : lists[i].name
    //     });
    //     ep.write({
    //         'sheet' : 'Restricted Lists',
    //         'cell' : 'B' + (i + 2),
    //         'content' : lists[i].url
    //     });
    // };
    var name = _CTX.split('/');
    name = name[name.length - 1] + ' - Permission Matrix';
    ep.saveAs(name);
};


var sites = [];
var matrixSites = [];
var groups = []; 
var restrictedLists = [];
var usersInGroup = [];
var worker;
var allUsers = [];
var pdls = [];
var emptyFolders = [];
var libraryName = location.pathname.split('/');
libraryName = libraryName[libraryName.length - 2];


$('#matrix-section').on('click', function(e){
    if (e.target.id == 'generate-matrix' || $(e.target).parent()[0].id == 'generate-matrix'){
        $('#generate-matrix').hide()
        $('#generating-matrix').show();
        if (!!window.Worker){
            worker = new Worker('js/generateMatrixWorker.js');
            worker.onmessage = function(e){
                matrixSites = e.data[0];
                groups = e.data[1];
                restrictedLists = e.data[2];
                generateMatrixExcel(matrixSites, groups, restrictedLists);
                $('#generating-matrix').hide();
                $('#ready-matrix').show();
            }
            worker.postMessage([_CTX, 'matrix']);
        }
    } else if(e.target.id == 'cancel-matrix'){
        $('#generating-matrix').hide();
        $('#generate-matrix').show();
        worker.terminate();
        worker = undefined;
    } else if(e.target.id == 'ready-matrix' || $(e.target).parent()[0].id == 'ready-matrix'){
        $('#ready-matrix').hide();
        $('#generate-matrix').show();
    }
});


//structure section
$('#structure-section').on('click', function(e){
    if (e.target.id == 'generate-structure' || $(e.target).parent()[0].id == 'generate-structure'){
        $('#generate-structure').hide()
        $('#generating-structure').show();
        if (!!window.Worker){
            worker = new Worker('js/structureCreatorWorker.js');
            worker.onmessage = function(e){
                info = e.data[0];
                window.localStorage.setItem('Info', JSON.stringify(info));
                window.open(_CTX + "/" + libraryName + "/client/visio.html", '_blank');
                window.focus();
                $('#generating-structure').hide();
                $('#generate-structure').show();
            }
            worker.postMessage([_CTX,'structure']);
        }
    } else if(e.target.id == 'cancel-structure'){
        $('#generating-structure').hide();
        $('#generate-structure').show();
        worker.terminate();
        worker = undefined;
    }/* else if(e.target.id == 'ready-struct'){
        $('#ready-matrix').hide();
        $('#generate-matrix').show();
    }*/
});

//empty-folders
$('#empty-folders-section').on('click',function(e){
    if(e.target.id == 'generate-empty-folders' || $(e.target).parent()[0].id == 'generate-empty-folders'){
        $('#generate-empty-folders').hide();
        $('#generating-empty-folders').show();
        if (!!window.Worker){
            worker = new Worker('js/getEmptyFoldersWorker.js');
            worker.onmessage = function(e){
                emptyFolders = e.data[0];
                generateEmptyFoldersExcel(emptyFolders);
                $('#generating-empty-folders').hide();
                $('#ready-empty-folders').show();
            }
            worker.postMessage([_CTX,'structure']);
        } 
    }else if(e.target.id == 'cancel-empty-folders'){
        $('#generating-empty-folders').hide();
        $('#generate-empty-folders').show();
        worker.terminate();
        worker = undefined;
    }else if(e.target.id == 'ready-empty-folders' || $(e.target).parent()[0].id == 'ready-empty-folders'){
        $('#ready-empty-folders').hide();
        $('#generate-empty-folders').show();
    }
});

//get all users
$('#all-users-section').on('click', function(e){
    if (e.target.id == 'get-all-users' || $(e.target).parent()[0].id == 'get-all-users'){
        $('#get-all-users').hide();
        getAllUsers();
        $('#ready-users').show();
        generateAllUsersExcel();
       
    } else if(e.target.id == 'ready-users' || $(e.target).parent()[0].id == 'ready-users'){
        $('#ready-users').hide();
        $('#get-all-users').show();
    }
});


//MASS DELETE
//var epDel = new ExcelPlus();
var epDel =  new ExcelPlus();
    userEmails = [],
    validUsers = [],
    invalidUsers = [],
    validUsersCounter = 0,
    invalidUsersCounter = 0;

//for the copy clipboard
// $(document).ready(function() {
//     var clip = new ZeroClipboard($("#d_clip_button"));
// });
    // $('#instr-nav').on('click', function(e){
    //     $('#instr-container').children().hide();
    //     $($('.' + e.target.className)).show();
    // });

function resetAll() {
    //epDel.reset();
    userEmails = [];
    validUsers = [];
    userEmails = [];
};

    // we call openLocal() and when the file is loaded then we want to display its content
    // openLocal() will use the FileAPI if exists, otherwise it will use a Flash object
 epDel.openLocal({
    "flashPath": "2.2/swfobject/",
    "labelButton": "Open an Excel file"
}, function() {
    resetAll();
    var arr = epDel.selectSheet('MassDelete').readAll();
    console.log(arr);

    // iterate and push emails to userEmails array
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].length; j++) {
            userEmails.push(arr[i][j]);
        }
    }
    if (!!window.Worker){
        worker = new Worker('js/identifyUsersWorker.js');
        worker.onmessage = function(e){
            validUsers = e.data[0];
            invalidUsers = e.data[1];
            console.log('worker ready');
            iterateUsers();
             $('#identifying-users').hide();
             $('#delete-button').show();
        }
        worker.postMessage([userEmails, _CTX]);
        $('#identifying-users').show()
    }

});

function iterateUsers() {
    //var max = Math.max(validUsers.length, invalidUsers.length)
    for (var x = 0; x < validUsers.length; x++) { 
        $("#valid-list").append(
            "<li class='row'><span class='col s6'>"+ validUsers[x].email + "</span><span class='col s6 del-valid' id='" + validUsersCounter +"' style='cursor:pointer;position:relative;top:1px'>remove from list</span></li>");
        validUsersCounter++;
    }  
    for(var x = 0; x < invalidUsers.length; x++){
            $("#invalid-list").append(
                "<li class='row'><span class='col s6'>"+ invalidUsers[x] +"</span></li>"); //<span class='col s6 del-invalid' id='" + invalidUsersCounter +"'  style='cursor:pointer;position:relative;top:1px'>delete</span></li>");
            invalidUsersCounter++;
    }

    $($('#valid').children()[0]).html($($('#valid').children()[0]).html() + ' - ' + validUsers.length);
    $($('#invalid').children()[0]).html($($('#invalid').children()[0]).html() + ' - ' + invalidUsers.length);
    //updating the view when user is removed from the valid user list
    $('.del-valid').click(function(e) {
        //e.preventDefault();
        $(this).closest('li').remove();
        validUsers[parseInt($(this).attr('id'))] = undefined;
        validUsersCounter--;
        updateValidUsersNumber();
    });
};

function updateValidUsersNumber(){
    $($('#valid').children()[0]).html('Valid Users - ' + validUsersCounter);
}

function deleteUser(user){
    if (validUsers[user] != undefined){
        $().SPServices({
            operation:"RemoveUserFromSite",
            userLoginName: validUsers[user].login,
            async:true,
            completefunc: function(xData, Status){
                if (Status == 'success'){
                    console.log('validUsers['+ user +'] was deleted');
                        validUsersCounter--;
                        updateValidUsersNumber();
                        $('#'+ user).closest('li').remove();                       
                } else {
                    $('#'+ user).prev().css('background','rgb(255, 141, 109)');
                    console.log('validUsers['+ user +'] was not found on the server!!!');
                }
            }
        });
    }else{
        console.log('validUsers['+ user +'] is ' + validUsers[user]);
    }
};

function showCurrentUserGroups(){
    currentUser.setGroups();
    $('#current-groups-container').html(''); 
    for (var i = 0; i < currentUser.groups.length; i++){
        $('#current-groups-container').append('<li style="border: 1px solid rgb(198, 201, 202)">' + currentUser.groups[i].name + '</li>');
    }
};

$('#delete-users').click(function(){
    for(var i = 0 ; i < validUsers.length; i++){
        deleteUser(i);
    }
    $('#delete-button').hide();
});

$(document).ready(function(){
     $('.modal-trigger').leanModal();
 });

$('#instr-nav').on('click', function(e){
    $('#instr-container').children().hide();
    $($('.' + e.target.className)).show();
});
function getAllUsers(){
    allUsers = [];
    pdls = [];
    // $().SPServices({       returns all users, including users in pdls
    //     async: false,
    //     operation: 'GetUserCollectionFromSite',
    //     completefunc: function(xData, Status){
    //         $(xData.responseXML).find('User').each(function(){
    //             var user = new User();
    //             user.setEmail($(this).attr('Email'));
    //             user.setName($(this).attr('Name'));
    //             user.setLogin($(this).attr('LoginName')); 
    //             allUsers.push(user)});
    //      }
    // });

    $().SPServices({
        async: false,
        operation: 'GetListItems',
        listName: 'User Information List',
        completefunc: function(xData, Status){
            $(xData.responseXML).find('row').each(function(){
                var user = new User();
                user.setEmail($(this).attr('ows_EMail'));
                user.setName($(this).attr('ows_Title'));
                user.setLogin($(this).attr('ows_Name'));
                if(user.getName().indexOf(',') > -1){
                    allUsers.push(user)
                }else{
                    pdls.push(user)
                }
            });
         }
    });
};

function generateAllUsersExcel(){
    var epUsers = new ExcelPlus();
    epUsers.createFile('Users');
    epUsers.createSheet('PDLs');
    if (_CTX.indexOf('external') > -1 ){
        epUsers.createSheet('External');
    }
    for (var i = 0; i < allUsers.length; i++){
        epUsers.write({
            'sheet' : 'Users',
            'cell' :  'A' + (i + 1),
            'content' : allUsers[i].getEmail() || '--- NO EMAIL ---'
        });
        epUsers.write({
            'sheet' : 'Users',
            'cell' :  'B' + (i + 1),
            'content' : allUsers[i].getName()
        }); 
        epUsers.write({
            'sheet' : 'Users',
            'cell' :  'C' + (i + 1),
            'content' : allUsers[i].getLogin()
        });  
    }   

    var rowPDLs = 0;
    var rowExtrenal = 0;
    var row;
    for(var i = 0; i < pdls.length; i++){
        if (pdls[i].login.indexOf('EXTRANET') > -1){
            epUsers.selectSheet('External');
            rowExtrenal++;
            row = rowExtrenal;
        }else{
            epUsers.selectSheet('PDLs');
            rowPDLs++;
            row = rowPDLs;
        }
        epUsers.write({
           // 'sheet' : 'PDLs',
            'cell' :  'A' + row,
            'content' : pdls[i].getEmail() || '--- NO EMAIL ---'
        });
         epUsers.write({
           // 'sheet' : 'PDLs',
            'cell' :  'B' + row,
            'content' : pdls[i].getName()
        }); 
        epUsers.write({
            //'sheet' : 'PDLs',
            'cell' :  'C' + row,
            'content' : pdls[i].getLogin()
        });  
    }
    var name = _CTX.split('/');
    name = name[name.length - 1] + ' - All users';
    epUsers.saveAs(name);
   
};

$('#central-nav').on('click', function(e){
    if (e.target.id){
        $('#main-section').children().hide();
        $($('.' + e.target.id)[0]).show();
    }
});

// get empty folders
function generateEmptyFoldersExcel(sites){
    var ep = new ExcelPlus();
    var cellsLetters = ['A','B','C','D','E','F'];

    ep.createFile("Empty Folders");
    ep.write({'cell':'A1','content': 'Folder Name'});
    ep.write({'cell':'B1','content': 'URL'});
    ep.write({'cell':'C1','content': 'Date Created'});
    ep.write({'cell':'D1','content': 'Last Modified'});
    ep.write({'cell':'E1','content': 'Editor'});
    ep.write({'cell':'F1','content': 'Author/Creator'});
    var row = 2;
    for(var i = 0; i < sites.length; i++){
        for(var j = 0; j < sites[i].lists.length; j++){
            for(var f = 0; f < sites[i].lists[j].emptyFolders.length; f++){
                var count = 0;
                for(var key in sites[i].lists[j].emptyFolders[f]) {
                    var value = sites[i].lists[j].emptyFolders[f][key].toString();
                    var cellName = (cellsLetters[count] + row).toString();
                    ep.write({'cell': cellName, 'content': value});
                    count++;
                };
                 row++;
            }
        }
    }
    var name = _CTX.split('/');
    name = name[name.length - 1] + ' - Empty Folders';
    ep.saveAs(name);
};




