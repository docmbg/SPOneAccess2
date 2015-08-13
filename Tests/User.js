var User = (function() {
    // Create a store to hold the private objects.
    var privateStore = {};
    var uid = 0;

    function User() {
        privateStore[this.id = uid++] = {};
        privateStore[this.id]._name = "No name";
        privateStore[this.id]._email = "No email specified";
        privateStore[this.id]._login = "No login name";
        privateStore[this.id]._picture = "No value";
        privateStore[this.id]._groups = [];
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

    User.prototype.setPicture = function(pic){
        privateStore[this.id]._picture = pic;
    };

    User.prototype.getPicture = function(){
        return privateStore[this.id]._picture;
    };

   User.prototype.setGroups = function(){
        var _this = this;
        privateStore[_this.id]._groups = [];
        $().SPServices({
            operation: 'GetGroupCollectionFromUser',
            userLoginName: privateStore[_this.id]._login,
            async: false,
            completefunc: function(xData, Status){
                if (Status == 'error'){
                    console.log('Cannot get user groups')
                } else {
                    $(xData.responseXML).find('Group').each(function(){
                        privateStore[_this.id]._groups.push($(this).attr('Name'));
                    });
                    return privateStore[_this.id]._groups;
                }
            }
        });
    };

    User.prototype.getGroups = function(){
        return privateStore[this.id]._groups;
    };

    User.prototype.addToGroup = function(groupName){
        var _this = this;
        $().SPServices({
            operation: "AddUserToGroup",
            groupName: groupName,
            userName: privateStore[_this.id]._name,
            userLoginName: privateStore[_this.id]._login,
            userEmail: privateStore[_this.id]._email,
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

    User.prototype.setInfoByEmail = function(){
        var _this = this;
        $().SPServices({
            async: false,
            operation: "GetUserLoginFromEmail",
            emailXml: '<Users><User Email="' + privateStore[_this.id]._email + '" /></Users>',
            completefunc: function(xData, Status) {
                if (Status == 'error'){
                    console.log('Invalid mail')
                } else {
                    $(xData.responseXML).find("User").each(function() {
                        _this.setLogin($(this).attr('Login'));
                        _this.setName($(this).attr('DisplayName'));
                    }); 
                }
            }
        });
    };

    User.prototype.toString = function userToString() {
        var ret = 'Name: ' + privateStore[this.id]._name + "\n" +
            'Email: ' + privateStore[this.id]._email + "\n" +
            'Login Name: ' + privateStore[this.id]._login;
        return ret;
    };

    return User;
}());