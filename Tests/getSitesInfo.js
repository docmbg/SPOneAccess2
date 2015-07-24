
importScripts("http://ent261.sharepoint.hp.com/teams/EricssonInt/OneAccess/MassDelete/js/User.js");
importScripts("http://ent261.sharepoint.hp.com/teams/EricssonInt/OneAccess/MassDelete/js/Group.js");
importScripts("http://ent261.sharepoint.hp.com/teams/EricssonInt/OneAccess/MassDelete/js/Site.js");
importScripts("http://ent261.sharepoint.hp.com/teams/EricssonInt/OneAccess/MassDelete/js/generateMatrix.js");

    function getSites(SITEENV){
        var sites = [];
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetAllSubWebCollection xmlns='http://schemas.microsoft.com/sharepoint/soap/'>";
        SOAPEnvelope.payload = "";
        SOAPEnvelope.opfooter =  "</GetAllSubWebCollection>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";

        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange =  function(){
             //result = req.responseXML.getElementsByTagName('Web');
            var result = req.responseText.split('<Web');
            for(var i = 2; i < result.length; i++){
                var info = result[i].split('"');
                var name = info[1];
                var url = info[3];
                var site = new Site();
                site.setName(name);
                site.setUrl(url);
                site.setGroups();
                sites.push(site);
            }
        }
        req.open('POST', SITEENV + '/_vti_bin/webs.asmx', false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/GetAllSubWebCollection");
        req.setRequestHeader("Content-Type","text/xml", "charset=utf-8");
        req.send(msg);
     
        return sites;
    }

    
    //ar sites = [];
    // because its type is javascript/worker.
    self.onmessage = function(e) {
        
       
        var result = getSites(e.data[0]);
        var sites = [];
        var groups = [];

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
               
                for (var u = 0; u < result[i].getGroups()[j].getUsers().length; u++){
                    var user = {};
                    user.name = result[i].getGroups()[j].getUsers()[u].getName();
                    user.email = result[i].getGroups()[j].getUsers()[u].getEmail();
                    user.login = result[i].getGroups()[j].getUsers()[u].getLogin();
                    console.log(user.name + ' | ' + user.email + ' | ' + user.login + ' | ' + count); count++;
                    group.users.push(user);
                }

                groups.push(group);
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

        console.log(groups);
        self.postMessage([sites, groups]);
    };
   
