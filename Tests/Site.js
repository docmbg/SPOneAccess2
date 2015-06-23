function Site(name, url) {

    this.name = name;
    this.url = url;
    this.groups = [];

    this.getGroups();
}

Site.prototype.getGroups = function() {

    var _this = this;
    var dfd = $.Deferred();
    $().SPServices({
        operation: 'GetGroupCollectionFromWeb',
        webURL: _this.url,
        completefunc: function(xData, Status) {
            dfd.resolve(
                $(xData.responseXML).find("Group").each(function() {
                    var $node = $(this);
                    var groupN = escapeHtml($node.attr('Name'));
                    console.log(groupN);
                    var group = new Group(groupN, _this.url);
                    _this.groups.push(group);
                    //subjectGroups.push(group);
                })
            )
        }
    });
    return dfd.promise();

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
