function Group(name, url){

	this.name = name;
	this.url = url;
	this.permissions = [];
	this.users = [];

	this.getPermissions();
	//this.getMembers();
}

Group.prototype.getMembers = function(){
	var _this = this;

    $().SPServices({
        operation: 'GetUserCollectionFromGroup',
        groupName: _this.name,
        async: true,
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
    })
};