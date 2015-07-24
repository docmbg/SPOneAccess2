var Site = (function(){

    var privateStore = {};
    var uid = 0;

    function Site(){
        privateStore[this.id = uid++] = {};
        privateStore[this.id]._name = 'No Name';
        privateStore[this.id]._url = 'No Url';
        privateStore[this.id]._groups = [];
    }

    Site.prototype.setName = function(name){
        privateStore[this.id]._name = name; 
    };

    Site.prototype.getName = function(){
        return privateStore[this.id]._name;
    };

    Site.prototype.setUrl = function(url){
        privateStore[this.id]._url = url;
    };

    Site.prototype.getUrl = function(){
        return privateStore[this.id]._url;
    }

    Site.prototype.setGroups = function(){
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetGroupCollectionFromWeb xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "";
        SOAPEnvelope.opfooter =  "</GetGroupCollectionFromWeb>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";

        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();

        req.addEventListener('load', function(){
            return req.responseText
        }, false)
         // req.onreadystatechange = function(){
         //    if (req.status == 200 && req.readyState == 4){
         //        if (!req.responseXML){
         //            var result = req.responseText.split('<Group');
         //            for (var i = 2; i < result.length; i++){
         //                var name = result[i].match('Name="(.*)Description');
         //                name = name[1].substring(0, name[1].length - 2);
         //                var group = new Group();
         //                group.setName(name);
         //                group.setUrl(privateStore[_this.id]._url);
         //                //group.setPermissions();
         //                //group.setUsers();
         //                privateStore[_this.id]._groups.push(group);
         //            }
         //        } else {
         //            var result = req.responseXML.getElementsByTagName('Group');
         //            for(var i = 0; i < result.length; i++){
         //                var group = new Group();
         //                group.setName(escapeHtml(result[i].getAttribute('Name')));
         //                group.setUrl(privateStore[_this.id]._url);
         //                group.setPermissions();
         //                group.setUsers();
         //                privateStore[_this.id]._groups.push(group);
         //            }
         //        }
         //    }
        //}
        req.open('POST', privateStore[this.id]._url + '/_vti_bin/usergroup.asmx', false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromWeb");
        req.setRequestHeader("Content-Type","text/xml;", "charset=utf-8");
        req.send(msg);
        
        // $().SPServices({
        //     operation: 'GetGroupCollectionFromWeb',
        //     webURL: privateStore[_this.id]._url,
        //     async: false,
        //     completefunc: function(xData, Status) {
        //         $(xData.responseXML).find("Group").each(function() {
        //             var $node = $(this);
        //             var groupN = escapeHtml($node.attr('Name'));
        //             var group = new Group;
        //             group.setName(groupN);
        //             group.setUrl(privateStore[_this.id]._url);
        //             group.setPermissions();
        //             group.setUsers();
        //             privateStore[_this.id]._groups.push(group);
        //         }) 
        //     }
        // });
    };

    Site.prototype.getGroups = function(){
        return privateStore[this.id]._groups;
    };

    Site.prototype.toString = function siteToString(){
        var result = 'Name: ' + privateStore[this.id]._name + ' ,URL: ' + privateStore[this.id]._url + ', Groups: ' + privateStore[this.id]._groups;
        return result; 
    };

    return Site;
}());

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function(s) {
        return entityMap[s];
    });
};

// function Site(name, url) {

//     this.name = name;
//     this.url = url;
//     this.groups = [];

//     this.getGroups();
// }

// Site.prototype.getGroups = function() {
//     var _this = this;

//     $().SPServices({
//         operation: 'GetGroupCollectionFromWeb',
//         webURL: _this.url,
//         async: false,
//         completefunc: function(xData, Status) {
//             $(xData.responseXML).find("Group").each(function() {
//                 var $node = $(this);
//                 var groupN = escapeHtml($node.attr('Name'));
//                 var group = new Group(groupN, _this.url);
//                 _this.groups.push(group);
//             }) 
//         }
//     });
// };