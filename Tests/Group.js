// var Group =(function(){

//     var privateStore = {};
//     var uid = 0; 

//     function Group(){
//         privateStore[this.id = uid++] = {};
//         privateStore[this.id]._name = 'No name';
//         privateStore[this.id]._url = 'No url';
//         privateStore[this.id]._permissions = [];
//         privateStpre[this.id]._users = []; 
//     };

//     Group.prorotype.setName = function(name){
//         privateStore[this.id]._name = name;
//     };

//     Group.prototype.getName = function(){
//         return privateStore[this.id]._name;
//     };

//     Group.prototype.setUrl = function(url){
//         privateStore[this.id]._url = url;
//     };

//     Group.prototype.getUrl = function(){
//         return privateStore[this.id]._url;
//     };

//     Group.prototype.setPermissions = function(){
//         var _this = this;
//         var $node;
//         //_this.permissions = [];

//     $().SPServices({
//         operation: 'GetRoleCollectionFromGroup',
//         groupName: privateStore[_this.id]._name,
//         webURL: privateStore[_this.id]._url,
//         async: false,
//         completefunc: function(xData, Status){
//             $(xData.responseXML).find('Roles>Role').each(function(){
//                 $node = $(this)[0];
//                 privateStore[_this.id]._permissions.push($($node).attr('Name'));
//             })
//         }
//     });
//         privateStore[this.id]._permissions = permissions;
//     };

//     Group.prototype.getPermissions = function(){
//         return privateStore[this.id]._permissions;
//     };

//     Group.prototype.setUsers = function(users){
//         privateStore[this.id]._users = users;
//     };

//     Group.prototype.getUsers = function(){
//         return privateStore[this.id]._users;
//     };



// });




function Group(name, url){

	this.name = name;
	this.url = url;
	this.permissions = [];
	this.users = [];

	this.getPermissions();
	this.getMembers();
}

Group.prototype.getMembers = function(){
	var _this = this;

    $().SPServices({
        operation: 'GetUserCollectionFromGroup',
        groupName: _this.name,
        async: false,
        completefunc: function(xDataUser, Status){
            $(xDataUser.responseXML).find('User').each(function(){
                var user = new User();
                user.setName($(this).attr('Name'));
                user.setLogin($(this).attr('LoginName'));
                user.setEmail($(this).attr('Email'));
                _this.users.push(user);
            })
        }
    });   
};

Group.prototype.getPermissions = function(){
	var _this = this;
    var $node;
   	_this.permissions = [];

    $().SPServices({
        operation: 'GetRoleCollectionFromGroup',
        groupName: _this.name,
        webURL: _this.url,
        async: false,
        completefunc: function(xData, Status){
            $(xData.responseXML).find('Roles>Role').each(function(){
                $node = $(this)[0];
                _this.permissions.push($($node).attr('Name'));
            })
        }
    });
};