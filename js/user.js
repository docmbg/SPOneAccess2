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

    User.prototype.setPicture = function(pic) {
        privateStore[this.id]._picture = pic;
    };

    User.prototype.getPicture = function() {
        return privateStore[this.id]._picture;
    };

    User.prototype.toString = function userToString() {
        var ret = 'Name: ' + privateStore[this.id]._name + "\n" +
            'Email: ' + privateStore[this.id]._email + "\n" +
            'Login Name: ' + privateStore[this.id]._login;
        return ret;
    };

    return User;
}());
