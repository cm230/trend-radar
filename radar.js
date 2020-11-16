// The MIT License (MIT)

// Copyright (c) 2017 Zalando SE

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


function radar_visualization(config) {

  var CSV_entries = [];  

  d3.csv('/20201014_Trend Database_v2.csv', function(d) {
    //CSV_entries = d;
     //console.log(d);
  
    for (var i = 0; i < d.length; i++) {
     
      var ring_value;
      switch (d[i].TimeHorizon) {
        case "Act Now":
          ring_value = 0;
          break;
        case "Inform":
          ring_value = 1;
          break;  
        case "Watch":
          ring_value = 2;
          break; 
        default:
          ring_value = 2;
      }

      var quadrant_value;
      switch (d[i].Category) {
        case "Cloud":
          quadrant_value = 0;
          break;
        case "Data":
          quadrant_value = 1;
          break;  
        case "AI":
          quadrant_value = 2;
          break; 
        case "Others":
          quadrant_value = 3;
          break; 
        default:
          quadrant_value = 3;
      }

      var CSV_entry = {
        ring: ring_value,
        quadrant: quadrant_value,
        label: d[i].Trend,
        descript: d[i].Description,
        active: "false"
      };

      CSV_entries.push(CSV_entry);
 /*     CSV_entries.ring.push(d[i].TimeHorizon);
      CSV_entries.quadrant.push(d[i].Category);
      CSV_entries.label.push(d[i].Trend);
      CSV_entries.descript.push(d[i].Description);*/
/*      console.log(d[i].Category);
      console.log(d[i].Trend);
      console.log(d[i].TimeHorizon);
      console.log(d[i].Description);*/
   //   CSV_entries.push(d.);
    }
  //});

  console.log(CSV_entries);
  console.log(config.entries);
   console.log(Object.keys(CSV_entries).length);
  config.entries = CSV_entries;
 // config.entries = CSV_entries;
  console.log(config.entries.length);

  //});

  // custom random number generator, to make random sequence reproducible
  // source: https://stackoverflow.com/questions/521295
  var seed = 42;
  function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function random_between(min, max) {
    return min + random() * (max - min);
  }

  function normal_between(min, max) {
    return min + (random() + random()) * 0.5 * (max - min);
  }

  // radial_min / radial_max are multiples of PI
  const quadrants = [
    { radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1 },
    { radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1 },
    { radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1 },
    { radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1 }
  ];

  const rings = [
    { radius: 130 },
    { radius: 260 },
    { radius: 390 }
  ];

  const title_offset =
    { x: -675, y: -420 };

  const footer_offset =
    { x: -675, y: 420 };

  const legend_offset = [
    { x: 450, y: 90 },
    { x: -675, y: 90 },
    { x: -675, y: -310 },
    { x: 450, y: -310 }
  ];

  function polar(cartesian) {
    var x = cartesian.x;
    var y = cartesian.y;
    return {
      t: Math.atan2(y, x),
      r: Math.sqrt(x * x + y * y)
    }
  }

  function cartesian(polar) {
    return {
      x: polar.r * Math.cos(polar.t),
      y: polar.r * Math.sin(polar.t)
    }
  }

  function bounded_interval(value, min, max) {
    var low = Math.min(min, max);
    var high = Math.max(min, max);
    return Math.min(Math.max(value, low), high);
  }

  function bounded_ring(polar, r_min, r_max) {
    return {
      t: polar.t,
      r: bounded_interval(polar.r, r_min, r_max)
    }
  }

  function bounded_box(point, min, max) {
    return {
      x: bounded_interval(point.x, min.x, max.x),
      y: bounded_interval(point.y, min.y, max.y)
    }
  }

  function segment(quadrant, ring) {
    var polar_min = {
      t: quadrants[quadrant].radial_min * Math.PI,
      r: ring === 0 ? 30 : rings[ring - 1].radius
    };
    var polar_max = {
      t: quadrants[quadrant].radial_max * Math.PI,
      r: rings[ring].radius
    };
    var cartesian_min = {
      x: 15 * quadrants[quadrant].factor_x,
      y: 15 * quadrants[quadrant].factor_y
    };
    var cartesian_max = {
      x: rings[2].radius * quadrants[quadrant].factor_x,
      y: rings[2].radius * quadrants[quadrant].factor_y
    };
    return {
      clipx: function(d) {
        var c = bounded_box(d, cartesian_min, cartesian_max);
        var p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
        d.x = cartesian(p).x; // adjust data too!
        return d.x;
      },
      clipy: function(d) {
        var c = bounded_box(d, cartesian_min, cartesian_max);
        var p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
        d.y = cartesian(p).y; // adjust data too!
        return d.y;
      },
      random: function() {
        return cartesian({
          t: random_between(polar_min.t, polar_max.t),
          r: normal_between(polar_min.r, polar_max.r)
        });
      }
    }
  }

  // position each entry randomly in its segment
  for (var i = 0; i < config.entries.length; i++) {
    var entry = config.entries[i];
    console.log(entry)
    entry.segment = segment(entry.quadrant, entry.ring);
    var point = entry.segment.random();
    entry.x = point.x;
    entry.y = point.y;
    entry.color = entry.active || config.print_layout ?
      config.rings[entry.ring].color : config.colors.inactive;
  }

  // partition entries according to segments
  var segmented = new Array(4);
  for (var quadrant = 0; quadrant < 4; quadrant++) {
    segmented[quadrant] = new Array(4);
    for (var ring = 0; ring < 3; ring++) {
      segmented[quadrant][ring] = [];
    }
  }
  for (var i=0; i<config.entries.length; i++) {
    var entry = config.entries[i];
    segmented[entry.quadrant][entry.ring].push(entry);
  }

  // assign unique sequential id to each entry
  var id = 1;
  for (var quadrant of [2,3,1,0]) {
    for (var ring = 0; ring < 3; ring++) {
      var entries = segmented[quadrant][ring];
      entries.sort(function(a,b) { return a.label.localeCompare(b.label); })
      for (var i=0; i<entries.length; i++) {
        entries[i].id = "" + id++;
      }
    }
  }

  function translate(x, y) {
    return "translate(" + x + "," + y + ")";
  }

  function viewbox(quadrant) {
    return [
      Math.max(0, quadrants[quadrant].factor_x * 400) - 420,
      Math.max(0, quadrants[quadrant].factor_y * 400) - 420,
      440,
      440
    ].join(" ");
  }


  var svg = d3.select("svg#" + config.svg_id)
   // .style("background-color", config.colors.background)
   // .style("background-color", "rgb(0, 0, 255, 0.05)")
    .style("background-image", "url('TuD_Data_Store_HG_Website_1920x1080.jpg')")
   // .style("background-image", "url('TechAndDataTransparentBackground.jpg')")
    .attr("width", config.width)
    .attr("height", config.height);

  var opaquebox = svg.append()

  var radar = svg.append("g");
  if ("zoomed_quadrant" in config) {
    svg.attr("viewBox", viewbox(config.zoomed_quadrant));
  } else {
    radar.attr("transform", translate(config.width / 2, config.height / 2));
  }

  var grid = radar.append("g");

  // draw grid lines
  grid.append("line")
    .attr("x1", 0).attr("y1", -400)
    .attr("x2", 0).attr("y2", 400)
    .style("stroke", config.colors.grid)
    .style("stroke-width", 5);
  grid.append("line")
    .attr("x1", -400).attr("y1", 0)
    .attr("x2", 400).attr("y2", 0)
    .style("stroke", config.colors.grid)
    .style("stroke-width", 5);

  // background color. Usage `.attr("filter", "url(#solid)")`
  // SOURCE: https://stackoverflow.com/a/31013492/2609980
  var defs = grid.append("defs");
  var filter = defs.append("filter")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 1)
    .attr("height", 1)
    .attr("id", "solid");
  filter.append("feFlood")
    .attr("flood-color", "rgb(0, 0, 0, 0.8)");
  filter.append("feComposite")
    .attr("in", "SourceGraphic");

  // draw rings
  for (var i = 0; i < rings.length; i++) {
    grid.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", rings[i].radius)
      .style("fill", "none")
      .style("stroke", config.colors.grid)
      .style("stroke-width", 5);
    if (config.print_layout) {
      grid.append("text")
        .text(config.rings[i].name)
        .attr("y", -rings[i].radius + 62)
        .attr("text-anchor", "middle")
        .style("fill", "#e5e5e5")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", 42)
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  }

  function legend_transform(quadrant, ring, index=null) {
    //var dx = ring < 2 ? 0 : 120;
    var dx = 0
    var dy = (index == null ? -16 : index * 12);
    //console.log (quadrant + " " + ring + " " + index) 
   // if (ring % 2 === 1) {
   // dy = dy + 36 + segmented[quadrant][ring-1].length * 12;
   // }
    if (ring == 1 || ring == 2) {
	dy = dy + 48*ring + segmented[quadrant][ring-1].length * 12;
       // hardcoding fix for demo, this will have to be fixed eventually
       if (ring == 2 && quadrant == 3) {
           dy = dy + 40;
       }	
       if (ring == 2 && quadrant == 2) {
           dy = dy + 68;
       }  
       if (ring == 2 && quadrant == 1) {
           dy = dy + 74;
       } 
       if (ring == 2 && quadrant == 0) {
           dy = dy + 50;
       } 
    }
    //console.log ("quadrant is = " + quadrant + " and ring is = " + ring)
    //console.log ("legend_offset[quadrant].x = " + legend_offset[quadrant].x)
    //console.log ("legend_offset[quadrant].y = " + legend_offset[quadrant].y)
    //console.log ("index = " + index + " and dx = " + dx + " and dy = " + dy)
    //console.log ("-------------------------------------------------------")
    return translate(
      legend_offset[quadrant].x + dx,
      legend_offset[quadrant].y + dy
    );
  }

  // draw title and legend (only in print layout)
  if (config.print_layout) {

    // title
    radar.append("text")
      .attr("transform", translate(title_offset.x, title_offset.y))
      .text(config.title)
      .style("font-family", "Arial, Helvetica")
      .style("font-size", "34");

    // footer
    radar.append("text")
      .attr("transform", translate(footer_offset.x, footer_offset.y))
      .text("▲ moved up     ▼ moved down")
      .attr("xml:space", "preserve")
      .style("font-family", "Arial, Helvetica")
      .style("font-size", "14")
      .style("fill", "#002d64");

    // legend
    var legend = radar.append("g");
    for (var quadrant = 0; quadrant < 4; quadrant++) {
      legend.append("text")
        .attr("transform", translate(
          legend_offset[quadrant].x,
          legend_offset[quadrant].y - 45
        ))
        .text(config.quadrants[quadrant].name)
        .style("font-family", "Arial, Helvetica")
        .style("font-size", "36")
        .style("font-weight", "bold")
        //.style("background-color", "white")
        .style("fill", "#002d64");
      for (var ring = 0; ring < 3; ring++) {
        legend.append("text")
          .attr("transform", legend_transform(quadrant, ring))
          .text(config.rings[ring].name)
          .style("font-family", "Arial, Helvetica")
          .style("font-size", "16")
          .style("font-weight", "bold")
          .style("fill", "white");
        legend.selectAll(".legend" + quadrant + ring)
          .data(segmented[quadrant][ring])
          .enter()
            .append("text")
              .attr("transform", function(d, i) { return legend_transform(quadrant, ring, i); })
              .attr("class", "legend" + quadrant + ring)
              .attr("id", function(d, i) { return "legendItem" + d.id; })
              .text(function(d, i) { return d.id + ". " + d.label; })
              .style("font-family", "Arial, Helvetica")
              .style("font-size", "14")
              .style("fill", "white")
              .on("mouseover", function(d) { showBubble(d); highlightLegendItem(d); })
              .on("mouseout", function(d) { hideBubble(d); unhighlightLegendItem(d); });
      }
    }
  }

  // layer for entries
  var rink = radar.append("g")
    .attr("id", "rink");

  // rollover bubble (on top of everything else)
  var bubble = radar.append("g")
    .attr("id", "bubble")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("user-select", "none");
  bubble.append("rect")
    .attr("rx", 4)
    .attr("ry", 4)
    .style("fill", "#333");
  bubble.append("text")
    .style("font-family", "sans-serif")
    .style("font-size", "13px")
    .style("fill", "#fff");
  bubble.append("path")
    .attr("d", "M 0,0 10,0 5,8 z")
    .style("fill", "#333");

  function showBubble(d) {
    if (d.active || config.print_layout) {
      var tooltip = d3.select("#bubble text")
       // .attr("dy", "0em").text("Trend Description").attr("dy", "1em").text(d.descript);
       //.text(d.descript);
       .text(d.descript)
      // .html("Trend Description2:" + "<br\/>" + "<br\/>" + d.descript)
      .call(wrap, 600)

    
      var bbox = tooltip.node().getBBox();
      d3.select("#bubble")
       // .attr("transform", translate(d.x - responsive_width / 2, d.y - 16))
        .attr("transform", translate(d.x - bbox.width / 2, d.y - 16))
        .style("opacity", 0.8);
      d3.select("#bubble rect")
        .attr("x", -5)
        //.attr("y", -bbox.height)
        .attr("y", -10)
       // .attr("width", responsive_width + 10)
        .attr("width", bbox.width + 10)
        .attr("height", bbox.height + 4);
      d3.select("#bubble path")
        .attr("transform", translate(bbox.width / 2 - 5, 3));
          
    }
  }

  function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1, // ems
        y = text.attr("y"),
        //dy = parseFloat(text.attr("dy")),
        dy = 0,
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        console.log("dy = " + dy)
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        console.log("BEFORE ++lineNumber * lineHeight = " + lineNumber * lineHeight);
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
        //tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        console.log("AFTER ++lineNumber * lineHeight = " + lineNumber * lineHeight);
      }
    }
  })}


  function hideBubble(d) {
    var bubble = d3.select("#bubble")
      .attr("transform", translate(0,0))
      .style("opacity", 0);
  }

  function highlightLegendItem(d) {
    var legendItem = document.getElementById("legendItem" + d.id);
    legendItem.setAttribute("filter", "url(#solid)");
    legendItem.setAttribute("fill", "white");
  }

  function unhighlightLegendItem(d) {
    var legendItem = document.getElementById("legendItem" + d.id);
    legendItem.removeAttribute("filter");
    legendItem.removeAttribute("fill");
  }

  // draw blips on radar
  var blips = rink.selectAll(".blip")
    .data(config.entries)
    .enter()
      .append("g")
        .attr("class", "blip")
        .attr("transform", function(d, i) { return legend_transform(d.quadrant, d.ring, i); })
        .on("mouseover", function(d) { showBubble(d); highlightLegendItem(d); })
        .on("mouseout", function(d) { hideBubble(d); unhighlightLegendItem(d); });

  // configure each blip
  blips.each(function(d) {
    var blip = d3.select(this);

    // blip link
    if (!config.print_layout && d.active && d.hasOwnProperty("link")) {
      blip = blip.append("a")
        .attr("xlink:href", d.link);
    }

    // blip shape
    if (d.moved > 0) {
      blip.append("path")
        .attr("d", "M -11,5 11,5 0,-13 z") // triangle pointing up
        .style("fill", d.color);
    } else if (d.moved < 0) {
      blip.append("path")
        .attr("d", "M -11,-5 11,-5 0,13 z") // triangle pointing down
        .style("fill", d.color);
    } else {
      blip.append("circle")
        .attr("r", 9)
        .attr("fill", d.color);
    }

    // blip text
    if (d.active || config.print_layout) {
      var blip_text = config.print_layout ? d.id : d.label.match(/[a-z]/i);
      blip.append("text")
        .text(blip_text)
        .attr("y", 3)
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-family", "Arial, Helvetica")
        .style("font-size", function(d) { return blip_text.length > 2 ? "8" : "9"; })
        .style("pointer-events", "none")
        .style("user-select", "none");
    }
  });

  // make sure that blips stay inside their segment
  function ticked() {
    blips.attr("transform", function(d) {
      return translate(d.segment.clipx(d), d.segment.clipy(d));
    })
  }

  // distribute blips, while avoiding collisions
  d3.forceSimulation()
    .nodes(config.entries)
    .velocityDecay(0.19) // magic number (found by experimentation)
    .force("collision", d3.forceCollide().radius(12).strength(0.85))
    .on("tick", ticked);

 });
}