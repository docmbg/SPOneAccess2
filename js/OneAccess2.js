/* jshint -W110 */
var User = (function() {
    // Create a store to hold the private objects.
    var privateStore = {};
    var uid = 0;

    function User() {
        privateStore[this.id = uid++] = {};
        privateStore[this.id]._name = "No name";
        privateStore[this.id]._email = "No email specified";
        privateStore[this.id]._manager = "No manager listed";
        privateStore[this.id]._login = "No login name";
        privateStore[this.id]._pictureUrl = "No picture specified";
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

    User.prototype.toString = function userToString(){
        var ret = 'Name: ' + privateStore[this.id]._name + "\n" +
                  'Email: ' + privateStore[this.id]._email + "\n" +
                  'Login Name: ' + privateStore[this.id]._login;
        return ret;
    };
    
    return User;
}());

var user = new User();

$SP().plugin('peopleahead', {
    selector: '#people-picker',
    limit: 10,
    noresult: 'Nothing found... Try another name.',
    onselect: function() {
        var $this = $(this);
        user.setName($this.data('name'));
        user.setEmail($this.data('email'));
        user.setLogin($this.data('login'));
        console.log(user.getName());
    }
});
