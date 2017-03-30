function SPGetCurrentSite() {
  var deferred = jQuery.Deferred()
  var msg = "<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body><WebUrlFromPageUrl xmlns='http://schemas.microsoft.com/sharepoint/soap/' ><pageUrl>"+window.location.href.replace(/&/g,"&amp;")+"</pageUrl></WebUrlFromPageUrl></soap:Body></soap:Envelope>";
  $.ajax({
    url: "/_vti_bin/Webs.asmx",
    type: "POST",
    data: msg,
    dataType: "xml",
    contentType: 'text/xml;charset="utf-8"',
    complete: function (xData) {
      deferred.resolve($(xData.responseXML).find("WebUrlFromPageUrlResult").text());
    }
  });
  return deferred;
}

var liHtml = [];
var fieldsStatic = [];
var fieldsDisplay = [];
var sites = [];
var listName = [];

// SPGetCurrentSite().done(function(webAddress) {
//   doTheJob(webAddress);
// });

function doTheJob(webAddress) {
  $().SPServices({
    operation: "GetAllSubWebCollection",
    webURL: webAddress,
    async: true,
    completefunc: function(xData, Status) {
      var listRecords = [];
      $(xData.responseXML).SPFilterNode("Web").each(function() {

        listRecords.push($(this).attr("Url"));

        $('#outputDataDiv').append("<div class='webRecordTitle'>" + $(this).attr("Title") + " : " + $(this).attr("Url") + "</div>");
      });

      var dfd = jQuery.Deferred().resolve();
      var res = listRecords.map(function(url) {
        dfd = dfd.then(function() {
          return getListCollection(url);
        });
        return dfd
      });
      $.when.apply(this, res).done(function() {
        var finalResultForEeachSite = Array.prototype.slice.call(arguments);
        var sites = [];
        finalResultForEeachSite.forEach(function(result) {
          sites = sites.concat(result);
        })
        extractToExcel(sites);
      })
    }
  });

  function getListCollection(webAddress) {
    var g_deferred=jQuery.Deferred();

    $().SPServices({
      operation: "GetListCollection",
      webURL: webAddress,
      async: true,
      completefunc: function(xData, Status) {
        var lists = [];
        $(xData.responseXML).SPFilterNode("List").each(function() {
          if ($(this).attr("ServerTemplate") == 101 && $(this).attr("Title") !== "Style Library" && $(this).attr("Title") !== "Site Assets") {

            var listname = $(this).attr("Title");
            lists.push(listname);

            var outputListHtml = "<div class='listContainer'>" + "<span class='listTitle'>" + listname + "</span><br />";
            outputListHtml += "Total Item Count: " + $(this).attr("ItemCount") + " ";
            outputListHtml += "</div>";
            $('#outputDataDiv').append(outputListHtml);
          }
        });

        var dfd = jQuery.Deferred().resolve();
        var res = lists.map(function(listname) {
          dfd = dfd.then(function() {
            return getVersion(webAddress, listname);
          });
          return dfd
        });
        $.when.apply(this, res).done(function() { 
          var finalResult = Array.prototype.slice.call(arguments);
          g_deferred.resolve(finalResult);
        })
      }
    });

    return g_deferred;
  }
}

function getVersion(webAddress, listName) {
  var deferred=jQuery.Deferred();

  var result;
  $().SPServices({
    operation: "GetList",
    async: true,
    webURL: webAddress,
    listName: listName,
    completefunc: function(xData, Status) {
      var responseText = xData.responseText;
      if (responseText.indexOf('EnableVersioning="True"') > -1) {
        result = 'Enabled';
      } else {
        result = 'Disabled'
      }

      deferred.resolve({
        listName: listName,
        webURL: webAddress,
        result: result
      });
    }
  });

  return deferred;
}

function extractToExcel(sites) {
  var ep = new ExcelPlus();
  var cellLetters = ['A', 'B', 'C'];
  ep.createFile('Versioning');
  ep.write({
    'cell': 'A1',
    'content': 'List Name'
  });
  ep.write({
    'cell': 'B1',
    'content': 'URL'
  });
  ep.write({
    'cell': 'C1',
    'content': 'Versioning'
  });
  sites.forEach(function(row) {
    if (row) ep.writeNextRow([row.listName, row.webURL, row.result]);
  });

  ep.saveAs('Versioning.xlsx');
  $("#ready-versioning").show();
  $("#generating-versioning").hide();
};