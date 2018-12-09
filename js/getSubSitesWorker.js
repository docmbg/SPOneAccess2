importScripts("https://cdn.jsdelivr.net/gh/docmbg/SPOneAccess2@1.2.2/js/models.js");
importScripts("https://cdn.jsdelivr.net/gh/docmbg/SPOneAccess2@1.2.0/js/spgrind.js");

    // because its type is javascript/worker.
    self.onmessage = function(e) {
        console.log('Gathering Subsites');
        var sites = SPGrind.fn.getSPSites(e.data[0], e.data[1], false); //gotovi siteove!!!
        self.postMessage([sites]);
    };