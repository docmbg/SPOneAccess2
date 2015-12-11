importScripts("https://rawgit.com/docmbg/SPOneAccess2/1.2.2/js/models.js");
importScripts("https://rawgit.com/docmbg/SPOneAccess2/1.2.0/js/spgrind.js");

self.onmessage = function(e){
	console.log('identifing users in worker')
	var validUsersWorker = [];
	var invalidUsersWorker = [];
	 for (var x = 0; x < e.data[0].length; x++) {
        var user = new User();
        user.setEmail(e.data[0][x]);
        user.setInfoByEmail(e.data[1]);
        if (!!user.getLogin()){
            validUsersWorker.push(user); 
        } else {
            invalidUsersWorker.push(e.data[0][x]);
        }
    }
	self.postMessage([validUsersWorker,invalidUsersWorker]);
}

