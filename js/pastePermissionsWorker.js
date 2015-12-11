importScripts("https://rawgit.com/docmbg/SPOneAccess2/1.2.2/js/models.js");

self.onmessage = function(e) {
    console.log('copy permissions worker is runnig');
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
