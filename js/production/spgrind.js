// Global variables
var SPGrind = function(){};

SPGrind.fn = SPGrind.prototype = {

    getSPSites: function(context, action) {
        var sites = [];
        var SOAPEnvelope = {};
        SOAPEnvelope.header = "<?xml version='1.0' encoding='utf-8'?><soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body>";
        SOAPEnvelope.opheader = "<GetAllSubWebCollection xmlns='http://schemas.microsoft.com/sharepoint/soap/'>";
        SOAPEnvelope.payload = "";
        SOAPEnvelope.opfooter = "</GetAllSubWebCollection>";
        SOAPEnvelope.footer = "</soap:Body></soap:Envelope>";

        var msg = SOAPEnvelope.header + SOAPEnvelope.opheader + SOAPEnvelope.payload + SOAPEnvelope.opfooter + SOAPEnvelope.footer;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {

            var site,
                result,
                i;

            if (!req.responseXML) {
                result = req.responseText.split("<Web");
                for (i = 2; i < result.length; i++) {
                    var info = result[i].split('"'),
                        name = info[1],
                        url = info[3];

                    site = new Site();
                    site.setName(name);
                    site.setUrl(url);

                    if (action == "matrix") {
                        site.setGroups();
                    }

                    sites.push(site);
                }
            } else {
                result = req.responseXML.getElementsByTagName("Web");

                for (i = 0; i < result.length; i++) {
                    site = new Site();
                    site.setName(result[i].getAttribute("Title"));
                    site.setUrl(result[i].getAttribute("Url"));
                    if (action == "matrix") {
                        site.setGroups();
                    }
                    sites.push(site);
                }

            }

        };

        req.open("POST", context + "/_vti_bin/webs.asmx", false);
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/sharepoint/soap/GetAllSubWebCollection");
        req.setRequestHeader("Content-Type", "text/xml", "charset=utf-8");
        req.send(msg);

        return sites;

    },
};
