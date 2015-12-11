importScripts("https://rawgit.com/docmbg/SPOneAccess2/1.2.2/js/models.js");
importScripts("https://rawgit.com/docmbg/SPOneAccess2/1.2.0/js/spgrind.js");

 self.onmessage = function(e) {
       console.log('Generating empty folders worker');

       var sites = SPGrind.fn.getSPSites(e.data[0], e.data[1], false); //gotovi siteove!!! 
        
        for(var i = 0; i < sites.length; i++){
        	for(var j = 0; j < sites[i].getLists().length; j++){
        		sites[i].getLists()[j].setItems();
        		//sites[i].getLists()[j].setEmptyFolders();
        	}
        }
        for(var i = 0; i < sites.length; i++){
        	for(var j = 0; j < sites[i].getLists().length; j++){
        		 sites[i].getLists()[j].setEmptyFolders();
        	}
        }
        
        self.postMessage([sites]);
    };
   
