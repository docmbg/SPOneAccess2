var drawCount = 0;
var diagramDiv = 'myDiagramDiv0';
var shape;
var subSites = [];
subSites = JSON.parse(window.localStorage.Info);
  for(var i = 0; i < subSites.length; i++){
    var option = $('<option/>');
    var url = subSites[i].url.split('/');
    url = url[url.length - 1];
    option.attr({'value': url}).text(url);
    $('#filter').append(option);
  }
$('#draw').on('click',function(){
        //subSites = JSON.parse(window.localStorage.Info);
        var filteredSites = filterData(subSites,$('#filter').val());
        $.ajax(fillSubSites(filteredSites)).done(function(){
          shape.minSize = new go.Size(shape.Hc.width, shape.Hc.height + 10);
        })
        var div = document.getElementById(diagramDiv);
        div.style.display = 'block';
        $('#draw').hide();
      })
function openWindow( url )
{
  window.open(url, '_blank');
  window.focus();
}

function fillSubSites(sites){
  //sites.shift();
  var excluded = ["Master Page Gallery", "Calendar", "Links", "Tasks", "Workflow History", "Site Assets", "Announcements","Site Library"];
  var nodeData = [];
  var mainList
  var parent;
  var legend = []
  var maxChildren = findMaxChildren(sites);
  var levelColors = ["#2AD2C9","#00B388","#FF8D6D","#425563","#617D78","#878787","#614767",'#C6C9CA'];
  var newColors = [];
  for(var i = 0 ; i <= maxChildren+2; i++){
    legend.push(
    {
      key: i+1,
      name: 'Level' + ' ' + parseInt(i+1),
      parent: i
    })
    if(i == maxChildren+2){
      newColors.push(levelColors[levelColors.length-1])
    }else{
      newColors.push(levelColors[i]);
    }
  }
  for(var i = 0 ; i < legend.length; i++){
    nodeData.push(legend[i]);
  }
  nodeData.push({
     key: sites[0].head,
     name: sites[0].realName,
     type: 'Main'
   })
   var mainLists = {
    name: "",
    parent: sites[0].head,
    type: 'Lists'
   };
   for(var i = 0;i < sites[0].lists.length; i++){
      if(excluded.indexOf(sites[0].lists[i].name) == -1){
        mainLists.name += sites[0].lists[i].name.replace(/&amp;/g,'&')+'\n';
      }
  }
  nodeData.push(mainLists);
  for(var i = 1;i < sites.length;i++){
      if(sites[i].parents.length == 0){
       
        nodeData.push({
          key: sites[i].title,
          name: sites[i].realName.replace(/&amp;/g,'&'),
          parent: sites[0].head,
          type:'BeforeLists'
        })
      }else{

          nodeData.push(
            {
              key: sites[i].parentsURL[sites[i].parentsURL.length-1]+'/'+sites[i].title,
              name: sites[i].realName.replace(/&amp;/g,'&'),
              parent : sites[i].parentsURL[sites[i].parentsURL.length-1],
              type: 'BeforeLists'
            }
          )}
          if(sites[i].lists.length > 0){
            var obj = {
                key: '',
                name:'\n',
                type:'Lists'
            }
            var name = '';
            for(var j = 0;j < sites[i].lists.length; j++){
              if(excluded.indexOf(sites[i].lists[j].name) == -1){
                name += sites[i].lists[j].name.replace(/&amp;/g,'&')+'\n';
              }
            }
            obj.name = name;
            if(sites[i].parents.length == 0){
              obj.parent = sites[i].title || sites[i].head;
            }else{
                if (sites[i].parentsURL.length > 0){ 
                  obj.parent = sites[i].parentsURL[sites[i].parentsURL.length-1]+'/'+sites[i].title;
                } else{
                  obj.parent = sites[i].head || sites[i].title; 
                }
              }
            
          
            nodeData.push(obj);
           // }
          }
      }
    
 // console.log(nodeData);
  draw(nodeData,newColors);
  //shape.minSize = new go.Size(shape.Hc.width+2,shape.Hc.height+1);
}

function draw(data,setColors){
var host;
var sizes  = [];
var sizesSecond = [];
var altAlign;
if(document.getElementById('alternateAlignment').value == 'Compact'){
  altAlign = go.TreeLayout.AlignmentBus;
}else{
  altAlign = go.TreeLayout.AlignmentCenterChildren
}
  //console.log(data);
var $ = go.GraphObject.make;
myDiagram =
  $(go.Diagram, diagramDiv,
    {
      initialContentAlignment: go.Spot.Center, // center Diagram contents
      "undoManager.isEnabled": true,
      "draggingTool.dragsTree": true,
      "commandHandler.deletesTree": true,
      maxSelectionCount: 1000,
        layout:
          $(go.TreeLayout,
            {
              treeStyle: go.TreeLayout.StyleRootOnly,
              arrangement: go.TreeLayout.ArrangementHorizontal,
              // properties for most of the tree:
              angle: 90,
             // layerSpacing: 60,
              alignment: go.TreeLayout.AlignmentCenterChildren,
              // properties for the "last parents":
              alternateAngle: 90,
              alternateLayerSpacing: 20,
              //alternateNodeSpacing: 5,
             // alternateBreadthLimit: 5,
              alternateRowSpacing: 2,
              //alternateLayerSpacing: 20,
              alternateAlignment: altAlign,//Bus
              breadthLimit: document.getElementById('spread').value*500,
            }
          )

    });

  myDiagram.nodeTemplate =
  $(go.Node, "Auto",{resizable:true,},
    
    $(go.Shape, "RoundedRectangle",
          {
            name: "SHAPE", fill: "white", stroke: null, 
            // set the port properties:
            portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer",
            fromSpot: go.Spot.Left
          }),
    $(go.TextBlock, 
      { margin: 5, stroke: "white", font: "bold 12px Arial",
      editable:true,textAlign:'left' },
      new go.Binding("text", "name"))
  );

myDiagram.linkTemplate =
  $(go.Link,
    { routing: go.Link.AvoidsNodes, corner: 5,curve: go.Link.JumpOver,reshapable: true,resegmentable: true,relinkableFrom: true,relinkableTo: true},
    $(go.Shape, {strokeWidth: 2, stroke: "#555", fill:'white', name:'SHAPE' }));
myDiagram.layout.commitNodes = function() {
  go.TreeLayout.prototype.commitNodes.call(myDiagram.layout);  // do the standard behavior
  // then go through all of the vertexes and set their corresponding node's Shape.fill
  // to a brush dependent on the TreeVertex.level value
  console.log(myDiagram.layout.network.vertexes);
  myDiagram.layout.network.vertexes.each(function(v) {
    if(v.node.rh.type == 'Lists' && v.node.rh.name !== ""){
      host = v.node.Hc
     // console.log(v.node.Hc);
     sizes.push(
      {
        parent: v.node.rh.parent,
        width: host.width,
        height: host.height,
        centerX: host.centerX,
        centerY: host.centerY
      })
     }
    else if(v.node.rh.type == 'BeforeLists'){
      host = v.node.Hc
     // console.log(v.node.Hc);
     sizesSecond.push(
      {
        key: v.node.rh.key,
        width: host.width,
        height: host.height,
        centerX: host.centerX,
        centerY: host.centerY
      })
     }
  })
  myDiagram.layout.network.vertexes.each(function(v) {
    var colors;
      if (v.node) {
        
        var level = v.level % (setColors.length);
        colors = setColors[level];
        if(v.node.rh.type == 'Lists'){
          colors = "#C6C9CA";
           for(var i = 0; i < sizesSecond.length; i++){
            shape = v.node.findObject("SHAPE");
            if(sizesSecond[i].key == v.node.rh.parent){
                shape.minSize = new go.Size(sizesSecond[i].width,v.node.Hc.height);
              //console.log(v.node.Hc);
            }
          }
        }
        else if(v.node.rh.type == 'BeforeLists'){

          for(var i = 0; i < sizes.length; i++){
            shape = v.node.findObject("SHAPE");
            if(sizes[i].parent == v.node.rh.key){
                shape.minSize = new go.Size(sizes[i].width,50);
              
              //console.log(v.node.Hc);
            }
          }

        }
       // console.log(v.node.rh)
        shape = v.node.findObject("SHAPE");

        if (shape) shape.fill = $(go.Brush, "Linear", { 0: colors, 1: colors, start: go.Spot.Left, end: go.Spot.Right });
            //console.log(counter);
      }

    });
  }
// define a Link template that routes orthogonally, with no arrowhead
 // the link shape
  
  var model = $(go.TreeModel);
  model.nodeDataArray = data;
  myDiagram.model = model;
}

function OpenInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

$('#buttonPNG').on('click',function(){
  var imgBlob = myDiagram.makeImageData({
  background:'white',
  scale: 1,
  type: "image/png",
  maxSize: new go.Size(10000, 10000)
  });
  //console.log(imgBlob);
  OpenInNewTab(imgBlob);
  //var blob = new Blob([imgBlob], {type: "data:image/png;base64"});
  //saveAs(blob,'test.png',false);
});
$('#redraw').on('click',function(){
  drawCount++;
  var div = '#'+diagramDiv;
  $(div).remove();
  diagramDiv = diagramDiv.slice(0,diagramDiv.length-1);
  diagramDiv += drawCount;
  var newDiv  = $('<div></div>');
  newDiv.attr('id',diagramDiv);
  newDiv.css({
    width:"80%",
    height:"80%",
    position:"fixed",
    top:"15%",
    left:"10%",
    backgroundColor: "#FFF",
    display:"block"
  })
  $('body').append(newDiv);
   $.ajax(fillSubSites(filterData(subSites,$('#filter').val()))).done(function(){
      shape.minSize = new go.Size(shape.Hc.width,shape.Hc.height + 10);
    })
})
function findMaxChildren(subSites){
  var flag = 0;
  for(var i = 0; i < subSites.length; i++){
    if(subSites[i].children > flag){
      flag = subSites[i].children
    }
  }
  return flag;
}

function filterData(data,filter){
  var filtered = [];
  for(var i = 0; i < data.length; i++){
    if(data[i].url.indexOf(filter)>-1 || filter == ''){
      filtered.push(data[i]);
    }
  }
  return filtered;
};

