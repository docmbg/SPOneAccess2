importScripts("https://rawgit.com/docmbg/SPOneAccess2/1.2.2/js/models.js");
importScripts("https://rawgit.com/docmbg/SPOneAccess2/1.2.0/js/spgrind.js");

    // because its type is javascript/worker.
    self.onmessage = function(e) {
        console.log('Structure creator is working');
        var sites = SPGrind.fn.getSPSites(e.data[0], e.data[1], false); //gotovi siteove!!!
        self.postMessage([sites]);
    };