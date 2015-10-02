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

    function generateExelFile(sites, groups){
        
        console.log('generating excel file');
        
        ep.createFile('Permission Matrix');
        ep.createSheet('Users');

        //html matrix
        //var permissionMatrix = document.createElement('table');
        //permissionMatrix.style.width = (sites.length + 1) * 200 + 'px';
        //var row1 = document.createElement('tr');
        //permissionMatrix.appendChild(row1);
        //var cell1 = document.createElement('th');
        //row1.appendChild(cell1);

        var cellNumber = '';            
        for (var i = 0; i < sites.length; i++){
            cellNumber = convertNumber(i + 1);
            cellNumber += 1;
            ep.write({
                'sheet' : 'Permission Matrix',
                'cell' :  cellNumber,
                'content' : sites[i].name
            });
            //html matrix
            //var site = document.createElement('th');
           // site.innerHTML = sites[i].name;
            //row1.appendChild(site);
           
        }

        for (var i = 0; i < groups.length; i++){
            ep.write({
                'sheet' : 'Permission Matrix',
                'cell' : 'A' + (i + 2),
                'content' : groups[i].name
            });
            //html matrix
            // var row = document.createElement('tr');
            // var groupName = document.createElement('th');
            // groupName.innerHTML = groups[i].name;
            // row.appendChild(groupName);

            for (var j = 0; j < sites.length; j++){
                //html
                //var cell = document.createElement('td');
                //cell.innerHTML = '';

                for(var k = 0; k < groups[i].url.length; k++){
                    if (sites[j].url == groups[i].url[k]){
                        //var text = '';
                        cellNumber = '';
                        cellNumber = convertNumber(j + 1);
                        cellNumber += (i + 2);
                        for (var p = 0; p < groups[i].permissions[k].length; p++){
                            ep.write({
                                'sheet' : 'Permission Matrix',
                                'cell' : cellNumber,
                                'content' : groups[i].permissions[k][p]
                            })
                            //html
                            // switch (groups[i].permissions[k][p]){
                            //     case 'Read':
                            //         cell.style.background = 'purple';
                            //         cell.style.color = 'white';
                            //         break;
                            //     case 'Contribute':
                            //         cell.style.background = 'green';
                            //         cell.style.color = 'white';
                            //         break;
                            //     case 'Owners Full Control':
                            //         cell.style.background = 'maroon';
                            //         cell.style.color = 'white';
                            //         break;
                            // }
                            // text += groups[i].permissions[k][p] + '<br/>'
                        }
                        //cell.innerHTML = text;
                        // if (cell.innerHTML == 'Limited Access<br>'){
                        //     cell.style.background = 'yellow';
                        // }
                    }
                }
                //row.appendChild(cell);
            }
            //permissionMatrix.appendChild(row);

            cellNumber = convertNumber(i); 
            ep.write({
                'sheet' : 'Users',
                'cell' : cellNumber + 1,
                'content' : groups[i].name
            })
            for(var u = 0; u < groups[i].users.length; u++){
                var userInfo = groups[i].users[u].email || groups[i].users[u].login;
                ep.write({
                    'sheet' : 'Users',
                    'cell' : cellNumber + (u + 2),
                    'content' : userInfo
                })
            } 
        }
        //document.body.appendChild(permissionMatrix);
        //$('tr').css('height','7em');
        //$('th').css('width','200px');
        //$('td').css('border','1px solid black');
        //$('td').css('text-align','center');

        var name = SITEENV.split('/');
        name = name[name.length - 1] + ' - Permission Matrix';
        ep.saveAs(name);


    };

    

  

  



       