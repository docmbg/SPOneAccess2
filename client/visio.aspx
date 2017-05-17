<!DOCTYPE html>
<html lang="en" xmlns:mso="urn:schemas-microsoft-com:office:office" xmlns:msdt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882">

<head>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge;" />
  <title>HPE OneAccess 2</title>
  <link href="https://rawgit.com/docmbg/SPOneAccess2/1.2.0/css/style.css" rel="stylesheet" type="text/css" />

<!--[if gte mso 9]><xml>
<mso:CustomDocumentProperties>
<mso:TRIM msdt:dt="string"></mso:TRIM>
<mso:Document_x0020_Description msdt:dt="string"></mso:Document_x0020_Description>
<mso:FY msdt:dt="string">FY16</mso:FY>
<mso:Document_x0020_Type msdt:dt="string">Unspecified</mso:Document_x0020_Type>
</mso:CustomDocumentProperties>
</xml><![endif]-->
</head>

<body style='margin:0;'>
  <div class="" id="controls">
    <div>
        HPE DOCM
    </div>
    <span>
      <label for="spread">Structure width: </label>
      <input type="number" min="0" max="50" id='spread' value="5" style="width: 3em;"/>
    </span>
    <span>
      <label for="filter">Filter by subsite: </label>
      <select id='filter'>
        <option></option>
      </select>
    </span>
    <span>
      <label for="alternateAlignment">Alignmnet: </label>
      <select id='alternateAlignment'>
        <option value='Compact'>Compact</option>
        <option value='Wide'>Wide</option>
      </select>
    </span>
    <span>
      <button id='draw'>Draw</button>
      <button id='buttonPNG'>Get PNG</button>
      <button id='redraw'>Redraw</button>
    </span>
    
  </div>

  <div id="myDiagramDiv0"
     style="width:80%; height:80%;position:fixed;top:15%;left:10%; background-color: #FFF;display:none">
   </div>
   <div id='spinner' style='position:fixed;top:50%;left:50%;display:none'></div>


  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery.min.js"></script>
  <script type="text/javascript" src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0-alpha1/jquery.min.js'></script>
  <script type=text/javascript src="https://cdnjs.cloudflare.com/ajax/libs/jquery.SPServices/2014.02/jquery.SPServices.min.js"></script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/sharepointplus/3.0.10/sharepointplus.js"></script>
  <script type="text/javascript" src="https://rawgit.com/docmbg/SPOneAccess2/1.2.0/libraries/gojs.js"></script>
  <script type="text/javascript" src="https://rawgit.com/docmbg/SPOneAccess2/2.5.5/js/structure.js"></script>
</body>
</html>
