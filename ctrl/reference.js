var stateAbbrevToFIPS = { 
  "AL":"1",  "AK":"2",  "AZ":"4",  "AR":"5",  "CA":"6", 
  "CO":"8",  "CT":"9",  "DE":"10", "FL":"12", "GA":"13", 
  "HI":"15", "ID":"16", "IL":"17", "IN":"18", "IA":"19", 
  "KS":"20", "KY":"21", "LA":"22", "ME":"23", "MD":"24", 
  "MA":"25", "MI":"26", "MN":"27", "MS":"28", "MO":"29", 
  "MT":"30", "NE":"31", "NV":"32", "NH":"33", "NJ":"34", 
  "NM":"35", "NY":"36", "NC":"37", "ND":"38", "OH":"39", 
  "OK":"40", "OR":"41", "PA":"42", "RI":"44", "SC":"45", 
  "SD":"46", "TN":"47", "TX":"48", "UT":"49", "VT":"50", 
  "VA":"51", "WA":"53", "WV":"54", "WI":"55", "WY":"56"
}

var codes; /* county ID -> name */
var topo; /* US topojson data */
var birthData; 
var incomeData;
var unempData;

d3.json('ctrl/dat/fixed_ugc.json', function(err, data) {
  if(err) console.log(err);
  codes = data;
});


d3.json("ctrl/dat/us.json", function(err, data) {
  if(err) console.log(err);
  topo = data;
});

function deferAll(files, callback) {
  var q = queue();
  for(var i = 0; i < files.length; i++) {
    q.defer(d3.json, 'ctrl/dat/' + files[i]);
  }
  q.awaitAll(callback);
}

queue().defer(d3.json, 'ctrl/dat/birthList.json')
  .await(function(error, fileList) {
    if(error) console.log(error);
    deferAll(fileList.countyFiles, function(error, data) {
      if(error) console.log(error);
      birthData = data;
    });
  });
queue().defer(d3.json, 'ctrl/dat/incomeList.json')
  .await(function(error, fileList) {
    if(error) console.log(error);
    deferAll(fileList.countyFiles, function(error, data) {
      if(error) console.log(error);
      incomeData = data;
    });
  });
queue().defer(d3.json, 'ctrl/dat/unempList.json')
  .await(function(error, fileList) {
    if(error) console.log(error);
    deferAll(fileList.countyFiles, function(error, data) {
      if(error) console.log(error);
      unempData = data;
    });
  });

function dataIsLoaded() {
  return codes && topo && birthData && incomeData && unempData;
}
  
