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
