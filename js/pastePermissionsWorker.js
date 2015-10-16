importScripts("https://raw.githubusercontent.com/docmbg/SPOneAccess2/production/js/models.js");

self.onmessage = function(e) {
    var user = e.data[0],
        groups = e.data[1];

    reattachMethods(user, User);
    postMessage("working");
    for (var i = 0; i < groups.length; i++) {
        reattachMethods(groups[i], Group);
        groups[i].addUser(user);
    }
    postMessage("done");
};

function reattachMethods(serialized, originalclass) {
    serialized.__proto__ = originalclass.prototype;
}
