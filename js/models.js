"use strict";

var Site = (function() {

    function Site() {}

    Site.prototype.setName = function(name) {
        this.name = name;
    };
    Site.prototype.getName = function() {
        return this.name;
    };
    Site.prototype.setUrl = function(url) {
        this.url = url;
    };
    Site.prototype.getUrl = function() {
        return this.url;
    };
    Site.prototype.setGroups = function(isAllInfoNeeded) {
        this.groups = [];
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetGroupCollectionFromWeb xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "";
        SOAPEnvelope.opfooter = "</GetGroupCollectionFromWeb>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";
        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            var result,
                group,
                i;
            if (req.status == 200 && req.readyState == 4) {
                if (!req.responseXML) {
                    result = req.responseText.split("<Group");
                    for (i = 2; i < result.length; i++) {
                        var name = result[i].match('Name="(.*)Description');
                        name = name[1].substring(0, name[1].length - 2);
                        group = new Group();
                        group.setName(name);
                        group.setUrl(_this.url);
                        if (isAllInfoNeeded){
                            group.setPermissions();
                            group.setUsers();
                        }
                        _this.groups.push(group);
                    }
                } else {
                    result = req.responseXML.getElementsByTagName("Group");
                    for (i = 0; i < result.length; i++) {
                        group = new Group();
                        //group.setName(result[i].getAttribute("Name"));
                        //console.log(group.getName())
                        group.setName(escapeHtml(result[i].getAttribute("Name")));
                        group.setUrl(_this.url);
                        if (isAllInfoNeeded){
                            group.setPermissions();
                            group.setUsers();
                        }
                        _this.groups.push(group);
                    }
                }
            }
        };
        req.open("POST", this.url + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromWeb");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
        req.send(msg);
    };
    Site.prototype.getGroups = function() {
        return this.groups;
    };
    Site.prototype.setInfo = function(url, main){
        this.parents = [];
        this.parentsURL = [];
        this.children = [];
        this.head = '';
        this.realName = this.name;
        var cutURL = url.split(main)[1];
        var header;
        var counter = 0;
        var start = 0;
        var dash = main.replace(/[^/]/g, "").length;
        for(var i = 0; i < main.length; i++){
            if(main[i] == '/'){
                counter++;
                if(counter == dash-1){
                    header = main.substring(i+1,main.length-1);
                }
            }
        }
        if (cutURL){
            for(var i = 0; i < cutURL.length; i++){
                if(cutURL[i].indexOf('/') > -1){
                    var flag = i;
                    if(start != 0){
                        this.parents.push(cutURL.substring(start+1,flag))
                        this.parentsURL.push(cutURL.substring(0,flag))
                    }else {
                        this.parents.push(cutURL.substring(start,flag))
                        this.parentsURL.push(cutURL.substring(0,flag))
                    }
                    start = flag;
                }
            }
            if(cutURL[start] == '/'){
                this.title = cutURL.substring(start+1,cutURL.length);
            }else {
                this.title = cutURL.substring(start,cutURL.length);
            }
            this.children = cutURL.replace(/[^/]/g, "").length;
            this.head = header; 

        } else{
            this.parents = [];
            this.parentsURL = [];
            this.head = header;
        }
    };
    Site.prototype.setLists = function(){
        this.lists = [];
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>';
        SOAPEnvelope.opheader = '<GetListCollection xmlns="http://schemas.microsoft.com/sharepoint/soap/" />';
        SOAPEnvelope.payload = '';
        SOAPEnvelope.opfooter = ''; // must be empty. return error when == '</GetListCollection>';
        SOAPEnvelope.footer = '</soap:Body></soap:Envelope>';
        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.status == 200 && req.readyState == 4) {
                var text = req.responseText.split('<_sList');
                for(var i = 1; i < text.length; i++){
                    var name = text[i].match('Title>(.*)</T')[1];
                    var url = 'no url found';
                    if(!!text[i].match('DefaultViewUrl>(.*)</D')){
                        url = _this.url.split('.com')[0] + '.com' + text[i].match('DefaultViewUrl>(.*)</D')[1];
                    }
                    var isRestricted = text[i].match('Security>(.*)</Inh')[1]; // returns true if the list has same permissions as the subsite
                    switch(isRestricted){
                        case 'true': isRestricted = false;
                            break;
                        case 'false': isRestricted = true;
                            break;
                        default: console.log('OOOOPS');
                    }
                    var list = new List();
                    list.setName(name);
                    list.setUrl(url);
                    list.setSubUrl(_this.url);
                    list.setIsRestricted(isRestricted);
                    _this.lists.push(list);
                }
            }
        }
        req.open("POST", this.url + "/_vti_bin/sitedata.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/GetListCollection");
        req.setRequestHeader("Content-Type", "text/xml", "charset=utf-8");
        req.send(msg);
    };
    Site.prototype.getLists = function(){
        return this.lists;
    }

    return Site;
}());

var List = (function(){

    function List(){};
    
    List.prototype.setSubUrl = function(subUrl){
        this.subUrl = subUrl;
    };
    List.prototype.getSubUrl = function(){
        return this.subUrl;
    };
    List.prototype.setUrl = function(url){
        this.url = url;
    };
    List.prototype.getUrl = function(){
        return this.url;
    };
    List.prototype.setName = function(name){
        this.name = name;
    };
    List.prototype.getName = function(){
        return this.name;
    };
    List.prototype.setItems = function(){
        this.folders = [];
        this.files = [];
        var _this = this;
        var mainUrl = this.subUrl.split('.com')[0] + '.com/';
        var text;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>';
        SOAPEnvelope.opheader = '<GetListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">'+'<listName>'+ this.name +'</listName>'+'<queryOptions><QueryOptions><ViewAttributes Scope="RecursiveAll" IncludeRootFolder="True"/></QueryOptions></queryOptions><rowLimit>1000000</rowLimit>';
        SOAPEnvelope.payload = "";
        SOAPEnvelope.opfooter = '</GetListItems>';
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";
        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.status == 200 && req.readyState == 4) {
                text += req.responseText;
                text = text.replace(/'/g, '"');
                text = text.split('z:row');
                // if(_this.name == '4. PPMC Administration'){
                //     console.log(text.length);
                // }
                var i;
                for(i = 0; i < text.length; i++){
                    var objType = textConvert('ows_FSObjType="',text[i]).split('#')[1]; //"FSObjType" is 0 for a file and 1 for a folder
                    if(objType == 0){
                        var url = 'none',
                            id = 'none',
                            name = '',
                            file = new File();
                        //url = mainUrl + text[i].match('ows_FileRef="(.*)" />')[1].split('#')[1];
                        name = textConvert('ows_FileRef="',text[i]).replace(/&#39;/g, "'");
                        name = mainUrl + name.split('#')[1];
                        file.setName(name);
                        file.setUrl(url);
                        //id = text[i].split('_ID="')[1].match('(.*)" ows_U')[1];
                        //file.setID(id);
                        _this.files.push(file);
                    }else if(objType == 1){
                        var dateCreated,
                            lastModified,
                            editor,
                            author,
                            name,
                            urlName,
                            folder = new Folder();
                        name = textConvert('ows_FileRef="',text[i]).replace(/&#39;/g, "'");
                        urlName = name;
                        name = name.split('/');
                        name = name[name.length - 1];
                        folder.setName(name);
                        url = urlName.split('#')[1];
                        if(_this.subUrl.indexOf('/external/') > -1){
                            var newString = '/external/';
                            var newUrl = urlName.split('/');
                            for(var j = 1; j < newUrl.length; j++){
                                newString += newUrl[j] + '/';
                            }
                            url = _this.subUrl.split('/external/')[0] + newString;
                        }else{
                            //url = _this.subUrl.split('teams')[0] + urlName.split('#')[1];
                            url = mainUrl + urlName.split('#')[1];
                        }
                        folder.setUrl(url);
                        dateCreated = textConvert('ows_Created_x0020_Date="',text[i]).split('#')[1].split(' ')[0];
                        if(textConvert('ows_Last_x0020_Modified="',text[i]).split('#') == '' 
                        || textConvert('ows_Last_x0020_Modified="',text[i]).split('#') == undefined
                        || textConvert('ows_Last_x0020_Modified="',text[i]).split('#')[1] == undefined){
                            lastModified = 'Unknown';
                        }else {
                            lastModified = textConvert('ows_Last_x0020_Modified="',text[i]).split('#')[1].split(' ')[0];
                        }
                        if(textConvert('ows_Editor="',text[i]).split('#') == ''
                        || textConvert('ows_Editor="',text[i]).split('#') == undefined
                        || textConvert('ows_Editor="',text[i]).split('#')[1] == undefined){
                            editor = 'Unknown';
                        }else {
                            editor = textConvert('ows_Editor="',text[i]).split('#')[1];
                        }
                        if(textConvert('ows_Author="',text[i]).split('#') == ''
                        || textConvert('ows_Author="',text[i]).split('#') == undefined
                        || textConvert('ows_Author="',text[i]).split('#')[1] == undefined){
                            author = 'Unknown';
                        }else {
                            author = textConvert('ows_Author="',text[i]).split('#')[1];
                        }
                        folder.setInfo(dateCreated, lastModified, editor, author);
                        _this.folders.push(folder);
                    }
                }
            }
        }
        req.open("POST", this.subUrl + "/_vti_bin/lists.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/GetListItems");
        req.setRequestHeader("Content-Type", "text/xml", "charset=utf-8");
        req.send(msg);
    };
    List.prototype.setEmptyFolders = function(){
        this.emptyFolders = [];
        for(var i = 0; i < this.folders.length; i++){
            var isEmpty = true;
            for(var  j = 0; j < this.files.length; j++){
                if(this.files[j].name.indexOf(this.folders[i].url) > - 1){
                    isEmpty = false;
                    break;
                }
            }
            if(isEmpty){
                this.emptyFolders.push(this.folders[i]);
            }
        }
    };
    List.prototype.getFolders = function(){
        return this.folders;
    };
    List.prototype.getFiles = function(){
        return this.files;
    };
    List.prototype.getEmptyFolders = function(){
        return this.emptyFolders;
    };
    List.prototype.setIsRestricted = function(isRestricted){
        this.isRestricted = isRestricted;
    };
    List.prototype.getIsRestricted = function(){
        return this.isRestricted;
    };
    List.prototype.setPermissions = function(){
        this.permissions = [];
    };

    List.prototype.getPermissions = function(){
        return this.permissions;
    };
    List.prototype.setGroups = function(){
        this.groups = [];
        var type = 'list';
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>';
        SOAPEnvelope.opheader = '<GetPermissionCollection xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">';
        SOAPEnvelope.payload = '<objectName>' + this.name + '</objectName><objectType>' + type + '</objectType>';
        SOAPEnvelope.opfooter = '</GetPermissionCollection>';
        SOAPEnvelope.footer = '</soap:Body></soap:Envelope>';
        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.status == 200 && req.readyState == 4) {
                if(!req.responseXML){
                    var text = req.responseText.split('<Permission');
                    for(var i = 2; i < text.length; i++){
                        var group = new Group();
                        var name;
                        if (!!text[i].match('GroupName="(.*)" ')){
                            name = text[i].match('GroupName="(.*)" ')[1];
                        }else{
                            console.log(text[i])
                        }
                        var mask = text[i].match('Mask="(.*)" Member')[1].match('(.*)" ')[1];
                        group.setName(name);
                        group.setMask(mask);
                        _this.groups.push(group);
                    }
                }else{
                    $(req.responseXML).find('Permission').each(function(){
                        console.log($(this));
                        groups.push($(this).attr('GroupName'));
                    })
                }
            }else if(req.readyState == 4){
                console.log('Problem with setting groups for list ' + _this.name);
            }
        }
        req.open("POST", this.subUrl + "/_vti_bin/Permissions.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetPermissionCollection");
        req.setRequestHeader("Content-Type", "text/xml", "charset=utf-8");
        req.send(msg);
    };
    List.prototype.getGroups = function(){
        return this.groups;
    };

    return List;
})();

// list item
var File = (function(){

    function File(){};

    File.prototype.setName = function(name){
        this.name = name;
    };
    File.prototype.getName = function(){
        return this.name;
    };
    File.prototype.setUrl = function(url){
        this.url = url;
    };
    File.prototype.getUrl = function(){
        return this.url;
    };
    File.prototype.setID = function(id){
        this.id = id;
    };
    File.prototype.getID = function(){
        return this.id;
    };

    return File;
})();

// list folder
var Folder = (function(){

    function Folder(){};

    Folder.prototype.setListName = function(listName){
        this.listName = listName;
    };
    Folder.prototype.getListName = function(){
        return this.listName;
    };
    Folder.prototype.setID = function(id){
        this.id = id;
    };
    Folder.prototype.getID = function(){
        return this.id;
    };
    Folder.prototype.setName = function(name){
        this.name = name;
    };
    Folder.prototype.getName = function(){
        return this.name;
    };
    Folder.prototype.setUrl = function(url){
        this.url = url;
    };
    Folder.prototype.getUrl = function(){
        return this.url;
    };
    Folder.prototype.setInfo = function(dateCreated, lastModified, editor, author){
        this.dateCreated = dateCreated;
        this.lastModified = lastModified;
        this.editor = editor;
        this.author = author;
    };
    Folder.prototype.getInfo = function(){
        return [this.dateCreated, this.lastModified, this.editor, this.author];
    };
    return Folder;
})(); 

// Beginning of group class description
var Group = (function() {

    function Group() {}

    Group.prototype.setName = function(name) {
        this.name = name;
    };
    Group.prototype.getName = function() {
        return this.name;
    };
    Group.prototype.setUrl = function(url) {
        this.url = url;
    };
    Group.prototype.getUrl = function() {
        return this.url;
    };
    Group.prototype.setPermissions = function() {
        this.permissions = [];
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetRoleCollectionFromGroup xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "<groupName>" + _this.name + "</groupName>";
        SOAPEnvelope.opfooter = "</GetRoleCollectionFromGroup>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";
        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            var result,
                i;
                if (req.status == 200 && req.readyState == 4) {
                    if (!req.responseXML) {
                        result = req.responseText.split("<Role");
                        for (i = 2; i < result.length; i++) {
                            var role = result[i].match('Name="(.*)Description');
                            role = role[1].substring(0, role[1].length - 2);
                            _this.permissions.push(role);
                        }
                    } else {
                        result = req.responseXML.getElementsByTagName("Role");
                        for (i = 0; i < result.length; i++) {
                            _this.permissions.push(result[i].getAttribute("Name"));
                        }
                    }
                }else if(req.readyState == 4){
                    console.log('Unable to get permissions for group ' + _this.name);
                }
            
            // if(req.status == 500){
            //     var div = document.createElement('div');
            //     div.style.background = 'rgb(255, 141, 109)';
            //     div.innerHTML = 'Ups!!!Something went wrong with group with name <b>' + _this.name +'</b>';
            //     div.className = 'container error';
            //     document.getElementsByTagName('main')[0].appendChild(div);
            //     //$('main').append('<div class="container error" style="background: rgb(255, 141, 109);">Ups!!!Something went wrong with group with name <b>'+ _this.name + '</b></div>');
            //     console.log();
            // }
        };
        req.open("POST", _this.url + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetRoleCollectionFromGroup");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
        req.send(msg);
    };
    Group.prototype.getPermissions = function() {
        return this.permissions;
    };
    Group.prototype.setMask = function(mask){
        this.mask = mask;
    };
    Group.prototype.getMask = function(){
        return this.mask;
    };
    Group.prototype.setUsers = function() {
        this.users = [];
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetUserCollectionFromGroup xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "<groupName>" + _this.name + "</groupName>";
        SOAPEnvelope.opfooter = "</GetUserCollectionFromGroup>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";
        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            var result,
                i,
                user;
            if (req.status == 200 && req.readyState == 4) {
                if (!req.responseXML) {
                    result = req.responseText.split("<User");
                    for (i = 2; i < result.length; i++) {
                        user = new User();
                        var name = result[i].match('Name="(.*)LoginName');
                        name = name[1].substring(0, name[1].length - 2);
                        var userName = result[i].match('LoginName="(.*)Email');
                        userName = userName[1].substring(0, userName[1].length - 2);
                        var email = null;
                        if (!!result[i].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)) {
                            email = result[i].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
                        }else{
                            console.log(result[i])
                        }
                        user.setName(name);
                        user.setLogin(userName);
                        user.setEmail(email);
                        _this.users.push(user);
                    }
                } else {
                    result = req.responseXML.getElementsByTagName("User");
                    for (i = 0; i < result.length; i++) {
                        user = new User();
                        user.setName(result[i].getAttribute("Name"));
                        user.setLogin(result[i].getAttribute("LoginName"));
                        user.setEmail(result[i].getAttribute("Email"));
                        _this.users.push(user);
                    }
                }
            }
        };
        req.open("POST", this.url + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetUserCollectionFromGroup");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
        req.send(msg);
    };
    Group.prototype.getUsers = function() {
        return this.users;
    };
    Group.prototype.addUser = function(user) {
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<AddUserToGroup xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "<groupName>" + _this.name + "</groupName>" + "<userName>" + user.getName() + "</userName>" + "<userLoginName>" + user.getLogin() + "</userLoginName>" + "<userEmail>" + user.getEmail() + "</userEmail>";
        SOAPEnvelope.opfooter = "</AddUserToGroup>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";
        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            var result,
                group,
                i;
            if (req.status == 200 && req.readyState == 4) {
                if (!req.responseXML) {
                    console.log("From within worker: " + req.responseText);
                } else {
                	console.log("From within main thread: " + req.responseXML);
                }
            } 
        };
        req.open("POST", this.url + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/AddUserToGroup");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
        req.send(msg);

    };
    Group.prototype.removeUser = function(user) {
        var _this = this;
        $().SPServices({
            operation: "RemoveUserFromGroup",
            groupName: this.name,
            userLoginName: user.getLogin(),
            completefunc: function(xData, Status) {
                if (Status == "error") {
                    console.log("Error!!! User cannot be deleted");
                } else {
                    console.log("Success!!! User was deleted");
                }
            }
        });
    };
    Group.prototype.toString = function groupToString() {
        var result = "Name: " + this.name + " ,URL: " + this.url + " ,Pemissions: " + this.permissions;
        return result;
    };
    return Group;
}());


// Beginning of user class description
var User = (function() {

    function User() {}

    User.prototype.setName = function(name) {
        this.name = name;
    };
    User.prototype.getName = function() {
        return this.name;
    };
    User.prototype.setLogin = function(login) {
        this.login = login;
    };
    User.prototype.getLogin = function() {
        return this.login;
    };
    User.prototype.setEmail = function(email) {
        this.email = email;
    };
    User.prototype.getEmail = function() {
        return this.email;
    };
    User.prototype.setPicture = function(picture) {
        this.picture = picture;
    };
    User.prototype.getPicture = function() {
        return this.picture;
    };
    User.prototype.setGroups = function() {
        this.groups = [];
        var _this = this;
        $().SPServices({
            operation: "GetGroupCollectionFromUser",
            userLoginName: _this.login,
            async: false,
            completefunc: function(xData, Status) {
                if (Status == "error") {
                    console.log("Cannot get user groups");
                } else {
                    $(xData.responseXML).find("Group").each(function() {
                        var group = new Group();
                        group.setName(escapeHtml($(this).attr('Name')));
                        //group.setName($(this).attr("Name"));
                        group.setUrl($().SPServices.SPGetCurrentSite());
                        _this.groups.push(group);
                    });
                    return _this.groups;
                }
            }
        });
    };
    User.prototype.getGroups = function() {
        return this.groups;
    };
    User.prototype.addToGroup = function(groupName) {
        var _this = this;
        $().SPServices({
            operation: "AddUserToGroup",
            groupName: groupName,
            userName: _this.name,
            userLoginName: _this.login,
            userEmail: _this.email,
            async: false,
            completefunc: function(xData, Status) {
                if (Status == "error") {
                    console.log("Error!!! Cannot Add user to group - " + groupName);
                } else {
                    if ($(xData.responseXML).find("Group[Name='GroupName']").length == 1) {
                        $("#zz9_ID_PersonalizePage").remove();
                    }
                    console.log("Success!!! User was added to group");
                }
            }
        });
    };
    User.prototype.setInfoByEmail = function(siteURL) {
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetUserLoginFromEmail xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = '<emailXml><Users><User Email="' + _this.getEmail() + '" /></Users></emailXml>';
        SOAPEnvelope.opfooter = "</GetUserLoginFromEmail>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";
        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            var result;
            if (req.status == 200 && req.readyState == 4) {
                if (!req.responseXML) {
                    result = req.responseText;
                    var name = result.substring(result.lastIndexOf('DisplayName="') + 13,result.lastIndexOf('" S'));
                    var login = result.substring(result.lastIndexOf('Login="') + 7,result.lastIndexOf('" E'));
                    _this.setName(name);
                    _this.setLogin(login);
                } else {
                    result = req.responseXML.getElementsByTagName("User");
                    //var login = $(this).attr('Login');
                    //login = login.substring(login.indexOf("|") + 1);
                    _this.setLogin($(result).attr('Login'));
                    _this.setName($(result).attr('DisplayName'));
                   
                }
            } else if(req.readyState == 4){
                console.log(req.readyState + ' | User not found - ' + _this.getEmail())
            } 
        };
        req.open("POST", siteURL + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetUserLoginFromEmail");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
        req.send(msg);
    };
    User.prototype.setInfoByLogin = function(siteURL){
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetUserInfo xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = '<userLoginName>' + _this.login + '</userLoginName>';
        SOAPEnvelope.opfooter = "</GetUserInfo>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";
        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            var result;
            if (req.status == 200 && req.readyState == 4) {
                if (!req.responseXML) {
                    result = req.responseText;
                    var name = result.substring(result.lastIndexOf('Name="') + 6,result.lastIndexOf('" L'));
                    var email = result.substring(result.lastIndexOf('Email="') + 7,result.lastIndexOf('" N'));
                    _this.setName(name);
                    _this.setEmail(email);
                } else {
                    result = req.responseXML.getElementsByTagName("User");
                    _this.setName($(result).attr('Name'));
                    _this.setEmail($(result).attr('Email'));
                }
            } else{
                console.log('User not found - ' + _this.getLogin())
            } 
        };
        req.open("POST", siteURL + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetUserInfo");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
        req.send(msg);
    };
    User.prototype.toString = function userToString() {
        var ret = "Name: " + this.name + "\n" +
            "Email: " + this.email + "\n" +
            "Login Name: " + this.login;
        return ret;
    };

    return User;
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

function textConvert(word, string){
    var start = string.indexOf(word)+word.length;
    var end = start;
    for(end; end < string.length; end++){
        if(string[end] == '"'){ // if(string[end] == '"'){
            return string.substring(start,end);
        }
    }
};
