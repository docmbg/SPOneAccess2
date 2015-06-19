// var Group = (function() {
	
// 	privateStore = {};

// 	function Group(){
// 		privateStore.name = 'no name';
// 		privateStore.site = 'no site';
// 		privateStore.permissions = [];
// 	};
	

// 	Group.prototype.setName = function(name){
// 		privateStore.name = name;
// 	};

// 	Group.prototype.getName = function(){
// 		return privateStore.name;
// 	};

// 	Group.prototype.setSite = function(site){
// 		privateStore.site = site;
// 	};

// 	Group.prototype.getSite = function(){
// 		return privateStore.site;
// 	};

// 	Group.prototype.setPermissions = function(permission){
// 		privateStore.permissions.push(permission);
// 	};

// 	Group.prototype.getPermissions = function(){
// 		return privateStore.permissions;
// 	};


// }());

function Group(name, site){

	this.name = name;
	this.site = site;
	this.permissions =  [];
	this.users = [];

	this.getPermissions();
	//this.getMembers();
}

Group.prototype.getMembers = function(){
	var _this = this;
    var dfd = $.Deferred();

    $().SPServices({
        operation: 'GetUserCollectionFromGroup',
        groupName: _this.name,
        async: true,
        completefunc: function(xDataUser, Status){
            dfd.resolve(
                $(xDataUser.responseXML).find('User').each(function(){
                 
                    var user = new User();
                    user.setName($(this).attr('Name'));
                    user.setLogin($(this).attr('LoginName'));
                    user.setEmail($(this).attr('Email'));
                    _this.users.push(user);
                })
            )
        }
    });   
    return dfd.promise();
};

Group.prototype.getPermissions = function(){
	var _this = this;
    var dfd = $.Deferred();
    var $node;
   	_this.permissions = [];

    $().SPServices({
        operation: 'GetRoleCollectionFromGroup',
        groupName: _this.name,
        completefunc: function(xData, Status){
            dfd.resolve(
                $(xData.responseXML).find('Roles>Role').each(function(){
                    $node = $(this)[0];
                    _this.permissions.push($($node).attr('Name'));
                })
            )
        }
    })
    return dfd.promise();
};