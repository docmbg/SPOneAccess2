function Site(name, url){

	this.name = name;
	this.url = url;
	this.groups = [];

	this.getGroups();
}

Site.prototype.getGroups = function(){

	var _this = this;
    var dfd = $.Deferred();
    $().SPServices({
        operation: 'GetGroupCollectionFromWeb',
        webURL: _this.url,
        completefunc: function(xData, Status){
            dfd.resolve(
                $(xData.responseXML).find("Group").each(function(){
                    var $node = $(this);
                    var group = new Group($node.attr('Name'), _this.url);
                  	_this.groups.push(group);
                    //subjectGroups.push(group);
                })
            )
        }
    });
    return dfd.promise();
      	
};