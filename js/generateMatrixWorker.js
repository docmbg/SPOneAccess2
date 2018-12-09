importScripts("models.js");
importScripts("https://cdn.jsdelivr.net/gh/docmbg/SPOneAccess2@1.2.0/js/spgrind.js");


    // because its type is javascript/worker.
    self.onmessage = function(e) {
        console.log('Generating matrix worker');

        //var result = getSites(e.data[0], e.data[1]);
        var result = SPGrind.fn.getSPSites(e.data[0], e.data[1], true);
        var sites = [];
        var groups = [];
        var lists = [];

        var count = 1;
        for (var i = 0; i < result.length; i++){
            var site = {};
            site.name = result[i].getName();
            site.url = result[i].getUrl();
            sites.push(site);
            
            for(var j = 0; j < result[i].getGroups().length; j++){
                var group = {};
                group.name = result[i].getGroups()[j].getName();
                group.url = result[i].getGroups()[j].getUrl();
                group.permissions = result[i].getGroups()[j].getPermissions();
                group.users = [];
                //console.log(group);
                for (var u = 0; u < result[i].getGroups()[j].getUsers().length; u++){
                    var user = {};
                    user.name = result[i].getGroups()[j].getUsers()[u].getName();
                    user.email = result[i].getGroups()[j].getUsers()[u].getEmail();
                    user.login = result[i].getGroups()[j].getUsers()[u].getLogin();
                    //console.log(user.name + ' | ' + user.email + ' | ' + user.login + ' | ' + count); count++;
                    group.users.push(user);
                }
                groups.push(group);
            }

            for(var l = 0; l < result[i].lists.length; l++){
                if(result[i].lists[l].getIsRestricted()){
                    result[i].lists[l].setGroups();
                    lists.push(result[i].lists[l])
                }
            }
        }
        for (var i = 0; i < groups.length; i++){
            groups[i].url = [groups[i].url];
            groups[i].permissions = [groups[i].permissions];

            for (var j = i + 1; j < groups.length; j++){
                if (groups[i].name == groups[j].name){
                    groups[i].url.push(groups[j].url);
                    groups[i].permissions.push(groups[j].permissions);
                    groups.splice(j, 1);
                    j--;
                } 
            }
        }
        self.postMessage([sites, groups, lists]);
    };
   
