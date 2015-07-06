// var Site = (function(){

//     var privateStore = {};
//     var uid = 0;

//     function Site(){
//         privateStore[this.id = uid++] = {};
//         privateStore[this.id]._name = 'No Name';
//         privateStore[this.id]._url = 'No Url';
//         privateStore[this.id]._groups = [];
//     }

//     Site.prototype.setName = function(name){
//         privateStore[this.id]._name = name; 
//     };

//     Site.prototype.getName = function(){
//         return privateStore[this.id]._name;
//     };

//     Site.prototype.setUrl = function(url){
//         privateStore[this.id]._url = url;
//     };

//     Site.prototype.setGroups = function(){
//          var _this = this;

//         $().SPServices({
//             operation: 'GetGroupCollectionFromWeb',
//             webURL: privateStore[_this.id]._url,
//             async: false,
//             completefunc: function(xData, Status) {
//                 $(xData.responseXML).find("Group").each(function() {
//                     var $node = $(this);
//                     var groupN = escapeHtml($node.attr('Name'));
//                     var group = new Group;
//                     group.setName(groupN);
//                     group.setUrl(_this.url);
//                     privateStore[_this.id]._groups.push(group);
//                 }) 
//             }
//         });
//     };

//     Site.prototype.getGroups = function(){
//         return privateStore[this.id]._groups;
//     };

// });



function Site(name, url) {

    this.name = name;
    this.url = url;
    this.groups = [];

    this.getGroups();
}

Site.prototype.getGroups = function() {
    var _this = this;

    $().SPServices({
        operation: 'GetGroupCollectionFromWeb',
        webURL: _this.url,
        async: false,
        completefunc: function(xData, Status) {
            $(xData.responseXML).find("Group").each(function() {
                var $node = $(this);
                var groupN = escapeHtml($node.attr('Name'));
                var group = new Group(groupN, _this.url);
                _this.groups.push(group);
            }) 
        }
    });
};

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
}
