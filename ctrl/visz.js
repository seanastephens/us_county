var DETAIL_TRANSITIONS = true;

function init_birth() { 
  $(".subject_title").text("Birth Rate per 1,000 Population".toUpperCase()); 
  load_file('birthList.json'); 
}

function init_unemp() { 
  $(".subject_title").text("Unemployment Rate".toUpperCase()); 
  load_file('unempList.json'); 
}

function init_income() { 
  $(".subject_title").text("Personal Income per Capita".toUpperCase()); 
  load_file('incomeList.json'); 
}

function lineplot(data, svgId, options) {
  var svg = d3.select(svgId);

  var w = options.width || console.log('No width passed');
  var h = options.height || console.log('No height passed');

  var topMargin = 50, botMargin = 40, rightMargin = 0; leftMargin = 50;
  var wStart = leftMargin, wEnd = w - rightMargin;
  var hEnd = topMargin, hStart = h - botMargin;

  svg.selectAll('path').remove();
  svg.selectAll('.axis').remove();

  var xMin = d3.min(data, function(d) { 
    return d3.min(d.data, function(e) { return e[0] });
  });
  var xMax = d3.max(data, function(d) { 
    return d3.max(d.data, function(e) { return e[0] });
  });
  var xExtent = [xMin-.5, xMax+.5];

  var yMin = d3.min(data, function(d) { 
    return d3.min(d.data, function(e) { return e[1] });
  });
  var yMax = 2 * d3.max(data, function(d) { 
    return d3.mean(d.data, function(e) { return e[1] });
  });
  var yExtent = [yMin, yMax];

  var xscale = d3.scale.linear().domain(xExtent).range([wStart,wEnd]);
  var yscale = d3.scale.linear().domain(yExtent).range([hStart,hEnd]);
  var xaxis = d3.svg.axis().scale(xscale).orient("bottom").tickFormat(d3.format('d'));
  var yaxis = d3.svg.axis().scale(yscale).orient("left").tickFormat(d3.format('d'));

  var line = d3.svg.line()
      .x(function(d) { return xscale(d[0]) })
      .y(function(d) { return yscale(d[1]) });

  if(options.brushing) {
    var map = d3.select('#svg_map');
    var brush = d3.svg.brush()
                  .x(xscale)
                  .y(yscale)
                  .on("brush", brushmove)
                  .on("brushend", brushend);
    function brushmove(p) {
      var e = brush.extent();
      var selected = {}
      svg.selectAll(".dataPath").classed('unselectedByLine', function(d) {
          var sel = _.filter(d.data, function(x) {  
            return x[0] > e[0][0] && (x[0] < e[0][0] + 1 || x[0] < e[1][0]);
          });
          var sel2 = _.filter(sel, function(x) {  
            return x[1] > e[0][1] && x[1] < e[1][1]; 
          });
          if(sel2.length == sel.length) {
            selected[d.name] = 1;
            return false;
          } else {
            return true;
          }
      });

      map.selectAll('.mcounty').classed('unselectedByLine', function(d) {
        return !selected[codes[d.id].key];
      });
    }
    function brushend() {
      if (brush.empty()) {
        d3.selectAll(".dataPath").classed('unselectedByLine', false);
        map.selectAll(".mcounty").classed('unselectedByLine', false);
      }
    }
    svg.append("g").call(brush);
  }

  var lines = svg.selectAll("path").data(data).enter().append("path")
                 .attr("d", function(d) { return line(d.data); });

  svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0, " + String(hStart + 10) + ")")
      .call(xaxis);
  svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + String(wStart - 10) + ", 0)")
      .call(yaxis);

  return lines;
}

function countyTable(d, file, codes, data, convert) {
  var header = ['Name'];
  var name = convert ? d.name : codes[d.id].key;
  var row = [name];
  data = _.filter(data, function(A) { return A.name === name; })[0].data;

  for(var i = 0; i < data.length; i++) {
    header.push(data[i][0]);
    row.push(data[i][1]);
  }

  return [header, row];
}

var g_data;
function load_file(fname) {
  if(!dataIsLoaded()) {
    setTimeout(load_file, 200, fname);
    return;
  }
  function buildMap(svg, topo) {
    //var projection = d3.geo.mercator()
    var projection = d3.geo.conicEqualArea()
        .rotate([98, 0])
        .center([-10, 48])
        .scale(600)
        .translate([width / 2, height / 2])
        .precision(.1);
    var path = d3.geo.path().projection(projection);
    //var path = d3.geo.path();
    //var projection = path.projection();

    var brush = d3.svg.brush()
                  .x(d3.scale.linear().domain([0,width]).range([0,width]))
                  .y(d3.scale.linear().domain([0,height]).range([0, height]))
                  .on("brush", brushmove)
                  .on("brushend", brushend);
  
    function brushmove(p) {
      var e = brush.extent();
      e = [projection.invert(e[0]), projection.invert(e[1])];
      var selected = {}
      var shape = { 
          geometry: {
              coordinates:[
                [
                  [e[0][0], e[0][1]],
                  [e[1][0], e[0][1]],
                  [e[1][0], e[1][1]],
                  [e[0][0], e[1][1]],
                  [e[0][0], e[0][1]]
                ]
              ],
              type: 'Polygon'
          },
          type: 'Feature'
      }
      var poly = d3.select('#shape').attr('d', function() { 
          return path(shape); 
      });
      svg.selectAll(".mstate").classed('selectedState', function(d) {
        var coords = _.flatten(_.flatten(d.geometry.coordinates, true), true);
        var inc = _.filter(coords, function(x) {
          return x[0] > e[0][0] && x[0] < e[1][0] && x[1] < e[0][1] && x[1] > e[1][1];
        });
        if(inc.length > coords.length/2 ) {
          selected[d.id] = 1;
          return 1;
        } else {
          return 0;
        }
      });
      svg.selectAll('.mcounty').classed('unselectedByMap', function(d) {
        var n = String(d.id);
        if(n.length === 5) {
          n = n.substring(0,2);
        } else if(n.length === 4) {
          n = n.substring(0,1);
        }
        return !selected[n];
      });
      d3.selectAll('.dataPath').classed('unselectedByMap', function(x) {
        var l = x.name.length;
        x = x.name.substring(l-2, l);
        x = stateAbbrevToFIPS[x];
        return !selected[x];
      }).classed('selected', true);
    }
  
    function brushend() {
      if(brush.empty()) {
        d3.selectAll(".dataPath").classed('unselectedByMap', false);
        d3.selectAll(".mcounty").classed('unselectedByMap', false);
        d3.selectAll(".mstate").classed('selectedState', false);
      }
    }
  
    svg.append("g").call(brush);
    svg.append('path').attr('id', 'shape').attr('fill', 'red').attr('opacity', .2);

    var max = d3.max(_.map(topojson.feature(topo, topo.objects.counties).features, function(d) {
       return Number(mapData[codes[d.id].key]);
    }));
    var scale = d3.scale.linear().domain([0,max]).range([0,50]);

    svg.selectAll("path")
      .data(topojson.feature(topo, topo.objects.counties).features)
      .enter().append("path")
      .classed('mcounty', true)
      .attr('d', path)
      .on('mouseenter', function(d) { 

        var saved_h = []
        d3.selectAll('.bars').each(function(d) { saved_h.push(this.getBBox().height); });

        d3.select('#detail_table').selectAll('tr').remove();

        d3.select('#detail_table')
          .selectAll("tr")
          .data(countyTable(d, fname, codes, g_data, false))
          .enter().append("tr")
          .selectAll("td")
          .data(function(r) { return r; })
          .enter().append("td")
          .text(function(d) { return String(d); });

        var bars = d3.select('#detail_table')
          .append("tr")
          .selectAll("td")
          .data(countyTable(d, fname, codes, g_data, false)[1])
          .enter().append("td").append('svg')
          .attr('width', 30).attr('height', 50)
          .append('rect')
          .classed('bars', true)
          .attr('fill', 'steelblue')
          .attr('x', 0)
          .attr('width', 30);

        if(DETAIL_TRANSITIONS) {
          bars
            .attr('y', function(d, i) { return i > 0 && saved_h.length > 0 ? 50 - saved_h[i] : 0; })
            .attr('height', function(d, i) { return i > 0 && saved_h.length > 0 ? saved_h[i] : 0; })
            .transition().duration(250)
            .attr('y', function(d, i) { return i > 0 ? 50 - scale(d) : 0; })
            .attr('height', function(d, i) { return i > 0 ? scale(d) : 0; });
        } else {
          bars
            .attr('y', function(d, i) { return i > 0 ? 50 - scale(d) : 0; })
            .attr('height', function(d, i) { return i > 0 ? scale(d) : 0; });
        }
      });
    
    svg.append("path")
      .datum(topojson.mesh(topo, topo.objects.land))
      .classed('us', true)
      .attr('d', path);
      
    svg.selectAll(".mstate")
      .data(topojson.feature(topo, topo.objects.states).features)
      .enter()
      .append('path')
      .classed('mstate', true)
      .attr('d', path);
  }

  d3.select("#svg_map").selectAll('*').remove();
  d3.select("#svg_lp1").selectAll('*').remove();

  var svg = d3.select("#svg_map");
  svg.selectAll('*').remove();
  var width = svg.attr("width"), height = svg.attr("height");
  
  function colorMap(svg, data) {
   var keys = d3.keys(data);
   var values = _.map(data, function(d){ return Number(d); });
   var sortedValues = values.sort(function(a,b) { return a - b; });
   var max = d3.max(sortedValues);
   var most = d3.quantile(sortedValues, .9);
   var least = d3.quantile(sortedValues, .1);

   var output = ["#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"];
   var waterScale = d3.scale.quantize().domain([least, most]).range(output);
   svg.selectAll('.mcounty').style('fill', function(d) {
     return waterScale(data[codes[d.id].key]);
   });

  var boxWidth = 30;
  var legendHeight = 200;
  var numBoxes = 5;
  var boxes = d3.range(numBoxes);
  var quantiles = d3.range(numBoxes).map(function(i) { 
    return d3.quantile(sortedValues, .1 + .2 * i); 
  });
  // legendScale : boxIndex --> GPA
  var legendScale = d3.scale.linear().domain(d3.range(numBoxes).reverse()).range(quantiles);

  var legend = svg.append("g")
      .attr("id", "legendTransform")
      .attr("transform", "translate(" 
          + (width - 3 * boxWidth) + "," 
          + (height/2 - legendHeight/2) + ")")
      .selectAll("rect")
      .data(boxes)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", function(d) { return legendHeight * d / numBoxes; })
      .attr("width", boxWidth)
      .attr("height", legendHeight / numBoxes)
      // colorScale o legendScale : boxIndex --> quantile --> Color
      .attr("fill", function(d) { return waterScale(legendScale(d)); })

  var legendFormatter = (fname === 'incomeList.json') ? d3.format(',.0f') : d3.format('.1f');
  var legendLabels = d3.select('#legendTransform')
          .selectAll('text')
          .data(quantiles).enter().append('text')
          .text(function(d) {
            return legendFormatter(d);
          }).attr('transform', function(d, i) {
            return 'translate(32,' + String((numBoxes - 0.5 - i) * legendHeight / numBoxes + 5) + ')';
          });
  }
  
  var mapData;
  var curData;
  switch(fname) {
    case 'birthList.json':
      curData = birthData; break;
    case 'incomeList.json':
      curData = incomeData; break;
    case 'unempList.json':
      curData = unempData; break;
    default:
      console.log('Invalid switch value');
  }

  mapData = curData[0];
  buildMap(svg, topo);
  colorMap(svg, mapData);
 
  var v = Object.keys(curData[0]);
  
  var data = [];
  for(var i = v.length - 1; i >= 0; i--) {
    var o = [];
    var index = v[i];
    for(var j = 0; j < curData.length; j++) {
      o.push([1990 + j, Number(curData[j][index])]);
    }
    data.push({name: v[i], data:o});
  }
  g_data = data;

  var options = {
    'width':600, 
    'height':600, 
    'brushing': true
  }
  lineplot(data, '#svg_lp1', options)
      .attr('mouseenter', function(d) { 
        d3.select('#detail_table').selectAll('tr').remove();
        d3.select('#detail_table')
          .selectAll("tr")
          .data(countyTable(d, fname, codes, data, true))
          .enter().append("tr")
          .selectAll("td")
          .data(function(r) { return r; })
          .enter().append("td")
          .text(function(d) { return String(d); });
      })
      .attr('fill', 'steelblue')
      .classed('dataPath', true);
}

function init_cbox() {
  var income = filterAndStack(unempData);
  var births = filterAndStack(birthData);
  var unemp  = filterAndStack(incomeData);

  var options = {
    'width': 350, 
    'height': 300,
  };

  function postProcessing() {
    var rColors = d3.scale.category10();
    this
      .on('mouseenter', function(d) { 
        d3.select('#saved_detail_box').text(d.name);
      })
      .style('stroke', function(d, i) { return rColors(i); })
      .style('fill', 'none')
      .style('opacity', 1)
      .style('stroke-width', 3);
  }

  lineplot(unemp, '#svg_comp_1', options).call(postProcessing);
  lineplot(births, '#svg_comp_2', options).call(postProcessing);
  lineplot(income, '#svg_comp_3', options).call(postProcessing);

  function filterAndStack(datas) {
    var v = Object.keys(datas[0]);
  
    var data = [];
    for(var i = v.length - 1; i >= 0; i--) {
      var o = [];
      var index = v[i];
      for(var j = 0; j < datas.length; j++) {
        o.push([1990 + j, Number(datas[j][index])]);
      }
      data.push({name: v[i], data:o});
    }
    var valid = _.map(county_box, function(d) { return codes[d].key; });
    var t_data = _.filter(data, function(d) { return valid.indexOf(d.name) > -1; });
    return t_data;
  }

}
