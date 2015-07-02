
    function generateExelFile(sites, groups){
        
      
        var cell = '';            
        for (var i = 0; i < sites.length; i++){
            cell = convertNumber(i+1);
            cell += 1;
            ep.write({
                "cell" :  cell,
                "content" : sites[i].name
            });
        }
        for (var i = 0; i < groups.length; i++){
            ep.write({
                'cell' : 'A' + (i + 2),
                'content' : groups[i].name
            });
            for (var j = 0; j < sites.length; j++){
                for(var k = 0; k < groups[i].url.length; k++){
                    if (sites[j].url == groups[i].url[k]){
                        var cell = '';
                        cell = convertNumber(j+1);
                        cell += (i + 2);
                        for (var p = 0; p < groups[i].permissions[k].length; p++){
                            ep.write({
                                'cell' : cell,
                                'content' : groups[i].permissions[k][p]
                            })
                        }
                    }
                }
            }
        }
        ep.saveAs("test.xlsx");
    };
    
    function saveExcelFile(data, fileName) {
        //set the file name
        var filename = fileName + ".xlsx";

        //put the file stream together
        var s2ab = function(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        };
        //invoke the saveAs method from FileSaver.js
        saveAs(new Blob([s2ab(data)], {
            type: "application/octet-stream"
        }), filename);
    };

     function convertNumber(n) {
        var ordA = 'A'.charCodeAt(0);
        var ordZ = 'Z'.charCodeAt(0);
        var len = ordZ - ordA + 1;
      
        var s = "";
        while(n >= 0) {
            s = String.fromCharCode(n % len + ordA) + s;
            n = Math.floor(n / len) - 1;
        }
        return s;
    };



       