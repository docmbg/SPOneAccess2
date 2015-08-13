 
var Group =(function(){

    var privateStore = {};
    var uid = 0; 

    function Group(){
        privateStore[this.id = uid++] = {};
        privateStore[this.id]._name = 'No name';
        privateStore[this.id]._url = 'No url';
        privateStore[this.id]._permissions = [];
        privateStore[this.id]._users = []; 
    };

    Group.prototype.setName = function(name){
        privateStore[this.id]._name = name;
    };

    Group.prototype.getName = function(){
        return privateStore[this.id]._name;
    };

    Group.prototype.setUrl = function(url){
        privateStore[this.id]._url = url;
    };

    Group.prototype.getUrl = function(){
        return privateStore[this.id]._url;
    };

    Group.prototype.setPermissions = function(){
        privateStore[this.id]._permissions = [];
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetRoleCollectionFromGroup xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "<groupName>" + privateStore[this.id]._name + "</groupName>";
        SOAPEnvelope.opfooter =  "</GetRoleCollectionFromGroup>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";

        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest(); 

        req.onreadystatechange = function(){
            if (req.status == 200 && req.readyState == 4){
                if (!req.responseXML){
                    var result = req.responseText.split('<Role');
                    for (var i = 2; i < result.length; i++){
                        var role = result[i].match('Name="(.*)Description');
                        role = role[1].substring(0, role[1].length - 2);
                        privateStore[_this.id]._permissions.push(role);
                    }
                } else {
                    var result = req.responseXML.getElementsByTagName('Role');
                    for(var i = 0; i < result.length; i++){
                        privateStore[_this.id]._permissions.push(result[i].getAttribute('Name'));
                    }
                }
            }
        }
        req.open('POST', privateStore[this.id]._url + '/_vti_bin/usergroup.asmx', false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetRoleCollectionFromGroup");
        req.setRequestHeader("Content-Type","text/xml;", "charset=utf-8");
        req.send(msg);
    };

    Group.prototype.getPermissions = function(){
        return privateStore[this.id]._permissions;
    };

    Group.prototype.setUsers = function(){
        privateStore[this.id]._users = [];
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetUserCollectionFromGroup xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "<groupName>" + privateStore[this.id]._name + "</groupName>";
        SOAPEnvelope.opfooter =  "</GetUserCollectionFromGroup>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";

        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest(); 
        req.onreadystatechange = function(){
            if (req.status == 200 && req.readyState == 4){
                if (!req.responseXML){
                    var result = req.responseText.split('<User');
                    for (var i = 2; i < result.length; i++){
                        var user = new User();
                        var name = result[i].match('Name="(.*)LoginName');
                        name = name[1].substring(0, name[1].length - 2);
                        var userName = result[i].match('LoginName="(.*)Email');
                        userName = userName[1].substring(0, userName[1].length - 2);
                        var email = null;
                        if (!!result[i].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0]){
                            email = result[i].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
                        }
                        user.setName(name);
                        user.setLogin(userName);
                        user.setEmail(email);
                        privateStore[_this.id]._users.push(user);
                    }
                } else{
                    var result = req.responseXML.getElementsByTagName('User');
                    for(var i = 0; i < result.length; i++){
                        var user = new User();
                        user.setName(result[i].getAttribute('Name'));
                        user.setLogin(result[i].getAttribute('LoginName'));
                        user.setEmail(result[i].getAttribute('Email'));
                        privateStore[_this.id]._users.push(user);
                    }
                }
            }
        }
        req.open('POST', privateStore[this.id]._url + '/_vti_bin/usergroup.asmx', false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetUserCollectionFromGroup");
        req.setRequestHeader("Content-Type","text/xml;", "charset=utf-8");
        req.send(msg);  
    };

    Group.prototype.getUsers = function(){
        return privateStore[this.id]._users;
    };

    Group.prototype.addUser = function(user){
        var _this = this;
        $().SPServices({
            operation: "AddUserToGroup",
            groupName: privateStore[_this.id]._name,
            userName: user.getName(),
            userLoginName: user.getLogin(),
            userEmail: user.getEmail(),
            async: false,
            completefunc: function(xData, Status) {
                if (Status == 'error'){
                    console.log('Error!!! Cannot Add user to group - ' + groupName);
                } else {
                    if($(xData.responseXML).find("Group[Name='GroupName']").length == 1) {
                        $("#zz9_ID_PersonalizePage").remove();
                    }
                    console.log('Success!!! User was added to group');
                }
                
            }
        });  
    };

    Group.prototype.removeUser = function(user){
        var _this = this;
        $().SPServices({
            operation: "RemoveUserFromGroup",
            groupName: privateStore[_this.id]._name, 
            userLoginName: user.getLogin(),
            completefunc: function(xData, Status) {
                if (Status == 'error'){
                    console.log('Error!!! User cannot be deleted');
                } else{
                    console.log('Success!!! User was deleted');
                }
            }
        }); 
    };
    
    Group.prototype.toString = function groupToString(){
        var result = 'Name: ' + privateStore[this.id]._name + ' ,URL: ' + privateStore[this.id]._url + ' ,Pemissions: ' + privateStore[this.id]._permissions;
        return result;
    };


    return Group;
}());




// function Group(name, url){

// 	this.name = name;
// 	this.url = url;
// 	this.permissions = [];
// 	this.users = [];

// 	this.getPermissions();
// 	this.getMembers();
// }

// Group.prototype.getMembers = function(){
// 	var _this = this;

//     $().SPServices({
//         operation: 'GetUserCollectionFromGroup',
//         groupName: _this.name,
//         async: false,
//         completefunc: function(xDataUser, Status){
//             $(xDataUser.responseXML).find('User').each(function(){
//                 var user = new User();
//                 user.setName($(this).attr('Name'));
//                 user.setLogin($(this).attr('LoginName'));
//                 user.setEmail($(this).attr('Email'));
//                 _this.users.push(user);
//             })
//         }
//     });   
// };

// Group.prototype.getPermissions = function(){
// 	var _this = this;
//     var $node;
//    	_this.permissions = [];

//     $().SPServices({
//         operation: 'GetRoleCollectionFromGroup',
//         groupName: _this.name,
//         webURL: _this.url,
//         async: false,
//         completefunc: function(xData, Status){
//             $(xData.responseXML).find('Roles>Role').each(function(){
//                 $node = $(this)[0];
//                 _this.permissions.push($($node).attr('Name'));
//             })
//         }
//     });
// };