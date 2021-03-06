

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
                        group.setName(result[i].getAttribute("Name"));
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
    
    // Site.prototype.getParents = function() {
    //     return this.parents;
    // };

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
                    } else{
                        console.log(text[i]);
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

    // List.prototype.setFiles = function(){
    //     this.files = [];
    //     var _this = this;

    // //root folder url
    //     // var currentFolderPath;
    //     $().SPServices({
    //         operation: "GetList",
    //         async: false,
    //         listName: 'Unsorted',
    //         completefunc: function(xData, Status) {
    //             $(xData.responseXML).find("List").each(function() {
    //                 currentFolderPath = $(this).attr("RootFolder");
    //             });
    //         }
    //     });
    //  //get files from list
    //     //var queryOptions = '<QueryOptions><Folder><![CDATA[' + currentFolderPath.substring(1) + ']]></Folder></QueryOptions>';
    //     var queryOptions = '<QueryOptions><Folder><![CDATA[]]></Folder></QueryOptions>';
    //     var query = "<Query><Where><Eq><FieldRef Name='FSObjType'></FieldRef><Value Type='Lookup'>0</Value></Eq></Where></Query>";
    //     var viewFields = "<ViewFields Properties='true'><FieldRef Name='Level' /></ViewFields>";
    //     var promFolders = [];
    //     promFolders[0] = $().SPServices({
    //         operation: "GetListItems",
    //         listName: _this.name,
    //         CAMLQuery: query,
    //         CAMLQueryOptions: queryOptions,
    //         CAMLViewFields: viewFields,
    //         completefunc: function(xData, Status){
    //             $(xData.responseXML).find('z:row').each(function(){
    //                 var file = new File();
    //                 file.setName($(this).attr('FileLeafRef').split('#')[1]);
    //                 file.setID($(this).attr('ID'));
    //                 _this.files.push(file);
    //             });
    //         }
    //     });
            
             //get folders from list
        // var query = "<Query><Where><Eq><FieldRef Name='FSObjType'></FieldRef><Value Type='Lookup'>1</Value></Eq></Where></Query>";
        // var queryOptions = '<QueryOptions><Folder><![CDATA[]]></Folder></QueryOptions>';
        // var viewFields = "<ViewFields Properties='true'><FieldRef Name='Level' /></ViewFields>";
        // var promFolders = [];

        //   $().SPServices({
        //     async: false,
        //     operation: "GetListItems",
        //     listName: _this.name,
        //     CAMLQuery: query,
        //     CAMLQueryOptions: queryOptions,
        //     CAMLViewFields: viewFields,
        //     completefunc: function(xData, Status){
        //         console.log(Status + '  |  ' + _this.url);
        //         var response = (xData.responseText).split('z:row');
        //         for(var i = 1; i < response.length; i++){
        //             var name = response[i].match("FileLeafRef='(.*)' ows_PermMask")[1];
        //             name = name.split('#')[1];
        //             var url = response[i].match("ID='(.*)' ows_U")[1];
        //             var folder = new Folder();
        //             folder.setName(name);
        //             folder.setID(url);
        //             _this.folders.push(folder);
        //         }
        //     }
        // });      


    // };
    List.prototype.setItems = function(){
        this.folders = [];
        this.files = [];
        var _this = this;
        var mainUrl = this.subUrl.split('.com')[0] + '.com/';
        var subUrl = this.subUrl;
        var libName = this.name;
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
                    // if(_this.name == '4. PPMC Administration'){
                    //       console.log(i);
                    // } 
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
                            library,
                            subsite,
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
                        folder.setID(textConvert('ows_ID="',text[i]));
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
                        folder.setInfo(dateCreated, lastModified, editor, author,libName,subUrl);
                        _this.folders.push(folder);
                    }
                }
            }
        }
        req.open("POST", this.subUrl + "/_vti_bin/lists.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/GetListItems");
        req.setRequestHeader("Content-Type", "text/xml", "charset=utf-8");
        req.send(msg);

        function textConvert(word, string){
            var start = string.indexOf(word)+word.length;
            var end = start;
            for(end; end < string.length; end++){
                if(string[end] == '"'){ // if(string[end] == '"'){
                    return string.substring(start,end);
                }
            }
        };
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
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetGroupCollectionFromSite xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "";
        SOAPEnvelope.opfooter = "</GetGroupCollectionFromSite>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";
        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        //msg = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetGroupCollectionFromWeb xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/" /></soap:Body></soap:Envelope>';
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            var result,
                group,
                i;
            console.log(req)
            if (req.status == 200 && req.readyState == 4) {
                if (!req.responseXML) {
                    result = req.responseText.split("<Group");
                    for (i = 2; i < result.length; i++) {
                        var name = result[i].match('Name="(.*)Description');
                        name = name[1].substring(0, name[1].length - 2);
                        group = new Group();
                        group.setName(name);
                        group.setUrl(_this.url);
                        group.setPermissions();
                        // if (isAllInfoNeeded){
                        //     group.setPermissions();
                        //     group.setUsers();
                        // }
                        _this.groups.push(group);
                    }
                } else {
                    result = req.responseXML.getElementsByTagName("Group");
                    for (i = 0; i < result.length; i++) {
                        group = new Group();
                        group.setName(result[i].getAttribute("Name"));
                        group.setUrl(_this.url);
                        group.setPermissions();
                        // if (isAllInfoNeeded){
                        //     group.setPermissions();
                        //     group.setUsers();
                        // }
                        _this.groups.push(group);
                    }
                }
            }
        };
        req.open("POST", this.url + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromSite");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
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

    Folder.prototype.setInfo = function(dateCreated, lastModified, editor, author,library,subsite){
        this.dateCreated = dateCreated;
        this.lastModified = lastModified;
        this.editor = editor;
        this.author = author;
        this.subsite = subsite;
        this.library = library;
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
        console.log(_this.name);
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetRoleCollectionFromGroup xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "<groupName>" + escapeHtml(_this.name) + "</groupName>";
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
            } 
            if (req.status == 500) {
                $('main').append('<div class="container error" style="background: rgb(255, 141, 109);">Ups!!!Something went wrong with group with name <b>'+ _this.name + '</b></div>');
                console.log('Unable to get permissions for group ' + _this.name);
            }
        };
        req.open("POST", _this.url + "/_vti_bin/usergroup.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/directory/GetRoleCollectionFromGroup");
        req.setRequestHeader("Content-Type", "text/xml;", "charset=utf-8");
        req.send(msg);
    };

    Group.prototype.getPermissions = function() {
        return this.permissions;
    };

    Group.prototype.setUsers = function() {
        this.users = [];
        var _this = this;
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetUserCollectionFromGroup xmlns='http://schemas.microsoft.com/sharepoint/soap/directory/'>";
        SOAPEnvelope.payload = "<groupName>" + escapeHtml(_this.name) + "</groupName>";
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
                        if (!result[i].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)){
                            console.log(result[i])
                        }
                        if (!!result[i].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0]) {
                            email = result[i].match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
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
        SOAPEnvelope.payload = "<groupName>" + escapeHtml(_this.name) + "</groupName>" + "<userName>" + user.getName() + "</userName>" + "<userLoginName>" + user.getLogin() + "</userLoginName>" + "<userEmail>" + user.getEmail() + "</userEmail>";
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
                        group.setName($(this).attr('Name'));
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
        // $().SPServices({
        //     async: false,
        //     operation: "GetUserLoginFromEmail",
        //     emailXml: '<Users><User Email="' + _this.email + '" /></Users>',
        //     completefunc: function(xData, Status) {
        //         if (Status == 'error') {
        //             console.log('Invalid email');
        //         } else {
        //             $(xData.responseXML).find('User').each(function() {
        //                 var login = $(this).attr('Login');
        //                 //login = login.substring(login.indexOf("|") + 1);
        //                 _this.setLogin(login);
        //                 _this.setName($(this).attr('DisplayName'));
        //             });
        //         }
        //     }
        // });
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
    "&amp;":"&#38;",
    "™":"&#8482;",
    "!":"&#33;",
    '"':"&#34;",
    "#":"&#35;",
    "$":"&#36;",
    "%":"&#37;",
    "&":"&#38;",
    "'":"&#39;",
    "(":"&#40;",
    ")":"&#41;",
    "*":"&#42;",
    "+":"&#43;",
    ",":"&#44;",
    "-":"&#45;",
    ".":"&#46;",
    "/":"&#47;",
    "0":"&#48;",
    "1":"&#49;",
    "2":"&#50;",
    "3":"&#51;",
    "4":"&#52;",
    "5":"&#53;",
    "6":"&#54;",
    "7":"&#55;",
    "8":"&#56;",
    "9":"&#57;",
    ":":"&#58;",
    "<":"&#60;",
    "=":"&#61;",
    ">":"&#62;",
    "?":"&#63;",
    "@":"&#64;",
    "A":"&#65;",
    "B":"&#66;",
    "C":"&#67;",
    "D":"&#68;",
    "E":"&#69;",
    "F":"&#70;",
    "G":"&#71;",
    "H":"&#72;",
    "I":"&#73;",
    "J":"&#74;",
    "K":"&#75;",
    "L":"&#76;",
    "M":"&#77;",
    "N":"&#78;",
    "O":"&#79;",
    "P":"&#80;",
    "Q":"&#81;",
    "R":"&#82;",
    "S":"&#83;",
    "T":"&#84;",
    "U":"&#85;",
    "V":"&#86;",
    "W":"&#87;",
    "X":"&#88;",
    "Y":"&#89;",
    "Z":"&#90;",
    "[":"&#91;",
    "":"&#92;",
    "]":"&#93;",
    "^":"&#94;",
    "_":"&#95;",
    "`":"&#96;",
    "a":"&#97;",
    "b":"&#98;",
    "c":"&#99;",
    "d":"&#100;",
    "e":"&#101;",
    "f":"&#102;",
    "g":"&#103;",
    "h":"&#104;",
    "i":"&#105;",
    "j":"&#106;",
    "k":"&#107;",
    "l":"&#108;",
    "m":"&#109;",
    "n":"&#110;",
    "o":"&#111;",
    "p":"&#112;",
    "q":"&#113;",
    "r":"&#114;",
    "s":"&#115;",
    "t":"&#116;",
    "u":"&#117;",
    "v":"&#118;",
    "w":"&#119;",
    "x":"&#120;",
    "y":"&#121;",
    "z":"&#122;",
    "{":"&#123;",
    "|":"&#124;",
    "}":"&#125;",
    "~":"&#126;",
    "¡":"&#161;",
    "¢":"&#162;",
    "£":"&#163;",
    "¤":"&#164;",
    "¥":"&#165;",
    "¦":"&#166;",
    "§":"&#167;",
    "¨":"&#168;",
    "©":"&#169;",
    "ª":"&#170;",
    "«":"&#171;",
    "¬":"&#172;",
    "®":"&#174;",
    "¯":"&#175;",
    "°":"&#176;",
    "±":"&#177;",
    "²":"&#178;",
    "³":"&#179;",
    "´":"&#180;",
    "µ":"&#181;",
    "¶":"&#182;",
    "·":"&#183;",
    "¸":"&#184;",
    "¹":"&#185;",
    "º":"&#186;",
    "»":"&#187;",
    "¼":"&#188;",
    "½":"&#189;",
    "¾":"&#190;",
    "¿":"&#191;",
    "À":"&#192;",
    "Á":"&#193;",
    "Â":"&#194;",
    "Ã":"&#195;",
    "Ä":"&#196;",
    "Å":"&#197",
    "Æ":"&#198;",
    "Ç":"&#199;",
    "È":"&#200;",
    "É":"&#201;",
    "Ê":"&#202;",
    "Ë":"&#203;",
    "Ì":"&#204;",
    "Í":"&#205;",
    "Î":"&#206;",
    "Ï":"&#207;",
    "Ð":"&#208;",
    "Ñ":"&#209;",
    "Ò":"&#210;",
    "Ó":"&#211;",
    "Ô":"&#212;",
    "Õ":"&#213;",
    "Ö":"&#214;",
    "×":"&#215;",
    "Ø":"&#216;",
    "Ù":"&#217;",
    "Ú":"&#218;",
    "Û":"&#219;",
    "Ü":"&#220;",
    "Ý":"&#221;",
    "Þ":"&#222;",
    "ß":"&#223;",
    "à":"&#224;",
    "á":"&#225;",
    "â":"&#226;",
    "ã":"&#227;",
    "ä":"&#228;",
    "å":"&#229;",
    "æ":"&#230;",
    "ç":"&#231;",
    "è":"&#232;",
    "é":"&#233;",
    "ê":"&#234;",
    "ë":"&#235;",
    "ì":"&#236;",
    "í":"&#237;",
    "î":"&#238;",
    "ï":"&#239;",
    "ð":"&#240;",
    "ñ":"&#241;",
    "ò":"&#242;",
    "ó":"&#243;",
    "ô":"&#244;",
    "õ":"&#245;",
    "ö":"&#246;",
    "÷":"&#247;",
    "ø":"&#248;",
    "ù":"&#249;",
    "ú":"&#250;",
    "û":"&#251;",
    "ü":"&#252;",
    "ý":"&#253;",
    "þ":"&#254;",
    "ÿ":"&#255;",
    "Ā":"&#256;",
    "ā":"&#257;",
    "Ă":"&#258;",
    "ă":"&#259;",
    "Ą":"&#260;",
    "ą":"&#261;",
    "Ć":"&#262;",
    "ć":"&#263;",
    "Ĉ":"&#264;",
    "ĉ":"&#265;",
    "Ċ":"&#266;",
    "ċ":"&#267;",
    "Č":"&#268;",
    "č":"&#269;",
    "Ď":"&#270;",
    "ď":"&#271;",
    "Đ":"&#272;",
    "đ":"&#273;",
    "Ē":"&#274;",
    "ē":"&#275;",
    "Ĕ":"&#276;",
    "ĕ":"&#277;",
    "Ė":"&#278;",
    "ė":"&#279;",
    "Ę":"&#280;",
    "ę":"&#281;",
    "Ě":"&#282;",
    "ě":"&#283;",
    "Ĝ":"&#284;",
    "ĝ":"&#285;",
    "Ğ":"&#286;",
    "ğ":"&#287;",
    "Ġ":"&#288;",
    "ġ":"&#289;",
    "Ģ":"&#290;",
    "ģ":"&#291;",
    "Ĥ":"&#292;",
    "ĥ":"&#293;",
    "Ħ":"&#294;",
    "ħ":"&#295;",
    "Ĩ":"&#296;",
    "ĩ":"&#297;",
    "Ī":"&#298;",
    "ī":"&#299;",
    "Ĭ":"&#300;",
    "ĭ":"&#301;",
    "Į":"&#302;",
    "į":"&#303;",
    "İ":"&#304;",
    "ı":"&#305;",
    "Ĳ":"&#306;",
    "ĳ":"&#307;",
    "Ĵ":"&#308;",
    "ĵ":"&#309;",
    "Ķ":"&#310;",
    "ķ":"&#311;",
    "ĸ":"&#312;",
    "Ĺ":"&#313;",
    "ĺ":"&#314;",
    "Ļ":"&#315;",
    "ļ":"&#316;",
    "Ľ":"&#317;",
    "ľ":"&#318;",
    "Ŀ":"&#319;",
    "ŀ":"&#320;",
    "Ł":"&#321;",
    "ł":"&#322;",
    "Ń":"&#323;",
    "ń":"&#324;",
    "Ņ":"&#325;",
    "ņ":"&#326;",
    "Ň":"&#327;",
    "ň":"&#328;",
    "ŉ":"&#329;",
    "Ŋ":"&#330;",
    "ŋ":"&#331;",
    "Ō":"&#332;",
    "ō":"&#333;",
    "Ŏ":"&#334;",
    "ŏ":"&#335;",
    "Ő":"&#336;",
    "ő":"&#337;",
    "Œ":"&#338;",
    "œ":"&#339;",
    "Ŕ":"&#340;",
    "ŕ":"&#341;",
    "Ŗ":"&#342;",
    "ŗ":"&#343;",
    "Ř":"&#344;",
    "ř":"&#345;",
    "Ś":"&#346;",
    "ś":"&#347;",
    "Ŝ":"&#348;",
    "ŝ":"&#349;",
    "Ş":"&#350;",
    "ş":"&#351;",
    "Š":"&#352;",
    "š":"&#353;",
    "Ţ":"&#354;",
    "ţ":"&#355;",
    "Ť":"&#356;",
    "ť":"&#357;",
    "Ŧ":"&#358;",
    "ŧ":"&#359;",
    "Ũ":"&#360;",
    "ũ":"&#361;",
    "Ū":"&#362;",
    "ū":"&#363;",
    "Ŭ":"&#364;",
    "ŭ":"&#365;",
    "Ů":"&#366;",
    "ů":"&#367;",
    "Ű":"&#368;",
    "ű":"&#369;",
    "Ų":"&#370;",
    "ų":"&#371;",
    "Ŵ":"&#372;",
    "ŵ":"&#373;",
    "Ŷ":"&#374;",
    "ŷ":"&#375;",
    "Ÿ":"&#376;",
    "Ź":"&#377;",
    "ź":"&#378;",
    "Ż":"&#379;",
    "ż":"&#380;",
    "Ž":"&#381;",
    "ž":"&#382;",
    "ſ":"&#383;",
    "Ŕ":"&#340;",
    "ŕ":"&#341;",
    "Ŗ":"&#342;",
    "ŗ":"&#343;",
    "Ř":"&#344;",
    "ř":"&#345;",
    "Ś":"&#346;",
    "ś":"&#347;",
    "Ŝ":"&#348;",
    "ŝ":"&#349;",
    "Ş":"&#350;",
    "ş":"&#351;",
    "Š":"&#352;",
    "š":"&#353;",
    "Ţ":"&#354;",
    "ţ":"&#355;",
    "Ť":"&#356;",
    "ť":"&#577;",
    "Ŧ":"&#358;",
    "ŧ":"&#359;",
    "Ũ":"&#360;",
    "ũ":"&#361;",
    "Ū":"&#362;",
    "ū":"&#363;",
    "Ŭ":"&#364;",
    "ŭ":"&#365;",
    "Ů":"&#366;",
    "ů":"&#367;",
    "Ű":"&#368;",
    "ű":"&#369;",
    "Ų":"&#370;",
    "ų":"&#371;",
    "Ŵ":"&#372;",
    "ŵ":"&#373;",
    "Ŷ":"&#374;",
    "ŷ":"&#375;",
    "Ÿ":"&#376;",
    "Ź":"&#377;",
    "ź":"&#378;",
    "Ż":"&#379;",
    "ż":"&#380;",
    "Ž":"&#381;",
    "ž":"&#382;",
    "ſ":"&#383;"
};

function escapeHtml(string) {

    return String(string.replace(/&amp;/g, '&')).replace(/[&amp;€Space!"#$%&()*+-.\/0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſ]/g, function(s) {
        return entityMap[s];
    });
};

// var sites = {
//     "site": []
// };

// sites.site.push(site1, site2);

// console.log(JSON.stringify(sites));
// console.log(site1.name);
