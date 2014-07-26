var width = 1280,
height = 720,
fill = d3.scale.category20();
darkest_color = 64;
transition_time = 400;
time_font_size = 4;
name_font_size = 1;
MAX_NUM = 10000;
time_scale = 2;

var default_line = ["1", "2", "4", "5", "6", "8", "9", "10", "13", "14", "15", "BT", "FS", "YZ", "CP", "JC"];

var circle_num = 15;
circle_data = generate_circle_array(circle_num);


// init svg
var outer = d3.select("#chart")
  .append("svg:svg")
  .attr("width", width)
  .attr("height", height)
  .attr("pointer-events", "all");
// Circle
vis_zoom=d3.behavior.zoom()
  .on("zoom", rescale)
  .scaleExtent([0.5,30]);
var vis = outer
  .append('svg:g')
  .call(vis_zoom)
  .on("dblclick.zoom", null)
  .append('svg:g');

vis.append('svg:rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', 'white');

var bg_layer = vis.append("svg:g");
var data_layer = vis.append("svg:g");

bg_layer.selectAll("path")
  .data(circle_data)
  .enter()
  .append("path")
  .attr('id', function(d) {
    return "cir" + d
  })
  .attr("d", function(d) {
    return draw_circle(d)
  })
  .attr('fill', 'none')
  .attr('stroke', function(d) {
    return draw_circle_color(d, darkest_color)
  })
  .on("mouseover", function(d) {
    d3.select(this)
      .transition()
      .duration(transition_time)
      .attr('stroke', "green");
    d3.select("#tex" + d)
      .transition()
      .duration(transition_time)
      .attr("opacity", "1");
  })
  .on("mouseout", function(d) {
    d3.select(this)
      .transition()
      .duration(transition_time)
      .attr('stroke', function(d) {
        return draw_circle_color(d, darkest_color)
      });
    d3.select("#tex" + d)
      .transition()
      .duration(transition_time)
      .attr("opacity", "0");
  });

bg_layer.selectAll("text")
  .data(circle_data)
  .enter()
  .append("text")
  .text(function(d) {
    return (d + 1) * 10 + " min"
  })
  .attr('id', function(d) {
    return "tex" + d
  })
  .attr("x", function(d) {
    return width / 2 + 20 * (d + 1) + 2
  })
  .attr("y", height / 2 + time_font_size / 2)
  .attr("font-size", time_font_size + "px")
  .attr("fill", "green")
  .attr("opacity", 0);

//Circle End ####################
var rawdata = {
  edges: [],
  nodes: []
};
var mapdata = {
  edges: [],
  nodes: []
};
var dijdata = {
  edges: [],
  nodes: []
};
var line_set = d3.set(default_line);
var drag_function = d3.behavior.drag()
  .origin(function(d) {
    return d;
  })
  .on("dragstart", dragstarted)
  .on("drag", dragged)
  .on("dragend", dragended);
var force = d3.layout.force();


d3.tsv("station.txt?v=4.0", function(data) {
  rawdata.nodes = data;
  //  dataset.nodes=data;
  d3.tsv("link.txt?v=4.0", function(data) {
    rawdata.edges = data;
    for (i = 0; i < rawdata.edges.length; i++) {
      // console.log(rawdata.edges[i]);
      rawdata.edges[i].line_number = rawdata.edges[i].line_number.split(',');
    }

    renew_data();

    force_data();
  });
});

//Data End########################

function force_data() {
  force.links(mapdata.edges)
    .nodes(mapdata.nodes)
    .size([width, height])
    .charge(-80)
    .gravity(0.05)
    .theta(1)
  //  .friction(0.5)
  //  .alpha()
    .start()
    .on("tick", function() {
      nodes
        .attr("cx", function(d) {
          return change_location_x(d.x, d.y, d.value);
        })
        .attr("cy", function(d) {
          return change_location_y(d.x, d.y, d.value);
        })
      edges
        .attr("x1", function(d) {
          return change_location_x(d.source.x, d.source.y, d.source.value);
        })
        .attr("y1", function(d) {
          return change_location_y(d.source.x, d.source.y, d.source.value);
        })
        .attr("x2", function(d) {
          return change_location_x(d.target.x, d.target.y, d.target.value);
        })
        .attr("y2", function(d) {
          return change_location_y(d.target.x, d.target.y, d.target.value);
        });
      node_name
        .attr("x", function(d) {
          return change_location_x(d.x, d.y, d.value) + 1.2
        })
        .attr("y", function(d) {
          return change_location_y(d.x, d.y, d.value) + name_font_size / 2 -0.1
        });
    });
  var edges = data_layer.selectAll("line")
    .data(mapdata.edges)
    .enter()
    .append("line")
    .style("stroke", function(d){return draw_line_color(d.line_number)})
    .style("stroke-width", 1);
  var nodes = data_layer.selectAll("circle")
    .data(mapdata.nodes)
    .enter()
    .append("circle")
    .attr("id", function(d) {
      return "data_cir" + d.index
    })
    .attr("r", 0.8)
    .style("fill", "#eee")
    .style("stroke","#aaa")
    .style("stroke-width",0.4)
    .call(drag_function) //From http://bl.ocks.org/mbostock/6123708
    .on("mouseover", function(d) {
      d3.select(this)
        .transition()
        .duration(transition_time)
        .style("fill","#333")
      d3.select("#name_text" + d.index)
        .transition()
        .duration(transition_time)
        .attr("opacity", "1");
      data_layer.selectAll("line")
        .transition()
        .duration(transition_time)
        .attr("opacity", "0.1");
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .transition()
        .duration(transition_time)
        .style("fill","#eee")
      d3.select("#name_text" + d.index)
        .transition()
        .duration(transition_time)
        .attr("opacity", function(){if(vis_zoom.scale()<0.9){return 0;}else{return "0.1"}});
      data_layer.selectAll("line")
        .transition()
        .duration(transition_time)
        .attr("opacity", "1");
    })
    .on("click", function(d) {
      // console.log(d.index);
      if(d.dij_index.length==0){
        dist=calculate_length(d.dij_index[0]);
      }
      else{
        temp_dist=[];
        dist=[];
        for(m=0;m<d.dij_index.length;m++){
          temp_dist[m] = calculate_length(d.dij_index[m]);
        }
        trans_dist=d3.transpose(temp_dist);
        for(m=0;m<trans_dist.length;m++){
          dist[m]=d3.min(trans_dist[m])
        } 
      }
      for (ii = 0; ii < mapdata.nodes.length; ii++) {
        this_dist=MAX_NUM;
        for(jj=0;jj<mapdata.nodes[ii].dij_index.length;jj++){
          if(this_dist>dist[mapdata.nodes[ii].dij_index[jj]]){
            this_dist=dist[mapdata.nodes[ii].dij_index[jj]]
          }
        }
        d3.select("#data_cir" + ii).data()[0].value = this_dist;
      }
      console.log(dist);
  //    renew_data();
      force.start();
    });
  var node_name = data_layer.selectAll("text")
    .data(mapdata.nodes)
    .enter()
    .append("text")
    .attr('id', function(d) {
      return "name_text" + d.index
    })
    .text(function(d) {
      return d.name
    })
    .attr("font-size", name_font_size + "px")
    .attr("fill", "#111")
    .attr("opacity", function(){if(vis_zoom.scale()<0.9){return 0;}else{return "0.1"}})
    .style("pointer-events", "none");
}

//--------------------

function generate_circle_array(circle_num) {
  var circle_data = new Array();
  for (var i = 0; i < circle_num; i++) {
    circle_data[i] = circle_num - i - 1
  };
  return circle_data;
}

function draw_circle(d) {
  var vcx = width / 2;
  var vy = height / 2;
  var vr = 20 * (d + 1);
  return 'M ' + (vcx + vr) + ' ' + vy + ' A ' + vr + ' ' + vr + ' 0 1 1 ' + (vcx - vr) + ' ' + vy +
    ' A ' + vr + ' ' + vr + ' 0 1 1 ' + (vcx + vr) + ' ' + vy
}

function draw_circle_color(d, darkestcolor) {
  clr = 255 - darkestcolor / (circle_num + 1) * (circle_num - d);
  return d3.rgb(clr, clr, clr)
}

function rescale() {
  //  console.log("a");
  trans = d3.event.translate;
  scale = d3.event.scale;

  vis.attr("transform",
    "translate(" + trans + ")" + " scale(" + scale + ")");
  data_layer.selectAll("text")
    .transition()
    .duration(transition_time/2)
    .attr("opacity", function(){if(vis_zoom.scale()<0.99){return 0;}else{return "0.1"}})
}

function change_location_x(x, y, value) {
  return width / 2 + (x - width / 2) * value * time_scale / Math.sqrt((x - width / 2) * (x - width / 2) + (y - height / 2) * (y - height / 2));
}

function change_location_y(x, y, value) {
  return height / 2 + (y - height / 2) * value * time_scale / Math.sqrt((x - width / 2) * (x - width / 2) + (y - height / 2) * (y - height / 2));
}

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
  force.start();
}

function dragged(d) {

  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);

}

function dragended(d) {

  d3.select(this).classed("dragging", false);
}

// Dijkistra ############################
function calculate_length(start_station) {
  dist = matrix[start_station];
  dist_length = dist.length;
  S = new Array();

  S.push(start_station);
  min_dis = 0;
  dist[start_station] = -1;
  while (S.length != num_station) {
    min_location = -1;
    this_min_dis = MAX_NUM;
    for (jj = 0; jj < dist_length; jj++) {
      if (dist[jj] >= min_dis && dist[jj] < this_min_dis) {
        this_min_dis = dist[jj];
        min_location = jj;
      }
    }
    S.push(min_location);
    min_dis = this_min_dis;
    dist[min_location] = dist[min_location] - 1;
    for (jj = 0; jj < dist_length; jj++) {
      if (dist[jj] >= min_dis) {
        if ((min_dis + matrix[min_location][jj]) < dist[jj]) {
          dist[jj] = min_dis + matrix[min_location][jj]
        }
      }
    }
  }
  for (ii = 0; ii < dist_length; ii++) {
    dist[ii] = dist[ii] + 1;
  }
  return dist;
}

function renew_data() {
  mapdata = {
    edges: [],
    nodes: []
  };
  dijdata = {
    edges: [],
    nodes: []
  };
  for (i = 0; i < rawdata.edges.length; i++) {
    in_set = 0;
    for (j = 0; j < rawdata.edges[i].line_number.length; j++) {
      if (line_set.has(rawdata.edges[i].line_number[j])) {
        in_set = 1;
        break;
      }
    }
    if (in_set) {
      source_index = -1;
      target_index = -1;
      for (j = 0; j < dijdata.nodes.length; j++) {
        if (rawdata.edges[i].source_number == dijdata.nodes[j].number) {
          source_index = dijdata.nodes[j].index;
          //  break;
        }
        if (rawdata.edges[i].target_number == dijdata.nodes[j].number) {
          target_index = dijdata.nodes[j].index;
          //  break;
        }
        if (source_index != -1 && target_index != -1) {
          break;
        }
      }
      if (source_index == -1) {
        source_index = j;
        dijdata.nodes.push({
          index: source_index,
          name: rawdata.edges[i].source_name,
          number: rawdata.edges[i].source_number,
          value: 0
        });
        j++;
      }
      if (target_index == -1) {
        target_index = j;
        dijdata.nodes.push({
          index: target_index,
          name: rawdata.edges[i].target_name,
          number: rawdata.edges[i].target_number
        });
      }
      dijdata.edges.push({
        source: source_index,
        source_name:rawdata.edges[i].source_name,
        target: target_index,
        target_name:rawdata.edges[i].target_name,
        distance: parseInt(rawdata.edges[i].distance),
        line_number:rawdata.edges[i].line_number
      });

    }
  }

  //Prepare data for calculate length
  num_station = dijdata.nodes.length;
  matrix = new Array(num_station);
  for (var ii = 0; ii < num_station; ii++) {
    matrix[ii] = new Array(num_station);
    for (var jj = 0; jj < num_station; jj++) {
      matrix[ii][jj] = MAX_NUM;
    }
    matrix[ii][ii] = 0;
  }
  for (ii = 0; ii < dijdata.edges.length; ii++) {
    matrix[dijdata.edges[ii].source][dijdata.edges[ii].target] = dijdata.edges[ii].distance;
  }

  dist = calculate_length(0);
  for (var i = 0; i < dijdata.nodes.length; i++) {
    dijdata.nodes[i].value = dist[i];
  };

//  calculate_length();
  renew_map_data();
}

function renew_map_data(){
    //Update Map Data
  for(i=0;i<dijdata.nodes.length;i++){
    existed=0;
    for(j=0;j<mapdata.nodes.length;j++){
      if(dijdata.nodes[i].name==mapdata.nodes[j].name){
        mapdata.nodes[j].dij_index.push(dijdata.nodes[i].index);
        mapdata.nodes[j].number.push(dijdata.nodes[i].number);
        if(mapdata.nodes[j].value>dijdata.nodes[i].value){
          mapdata.nodes[j].value=dijdata.nodes[i].value 
        }
        existed=1;
        break;
      }
    }
    if(!existed){
      mapdata.nodes.push({
        name:dijdata.nodes[i].name,
        number:[dijdata.nodes[i].number],
        dij_index:[dijdata.nodes[i].index],
        value:dijdata.nodes[i].value
      })
    }
  }
  // Corrrect Airport Express Line
  DZM_number=0;
  SYQ_number=0;
  T2_number=0;
  T3_number=0;
  for(j=0;j<mapdata.nodes.length;j++){
    if(mapdata.nodes[j].name=="东直门"){
      DZM_number=j;
    }
    if(mapdata.nodes[j].name=="三元桥"){
      SYQ_number=j;
    }
    if(mapdata.nodes[j].name=="T2航站楼"){
      T2_number=j;
    }
    if(mapdata.nodes[j].name=="T3航站楼"){
      T3_number=j;
    }
  }
  for(i=0;i<dijdata.edges.length;i++){
  //  mapdata.edges.push
    temp_source=0;
    temp_target=0;
    for(j=0;j<mapdata.nodes.length;j++){
      if(dijdata.edges[i].source_name==mapdata.nodes[j].name){
        temp_source=j;
      }
      if(dijdata.edges[i].target_name==mapdata.nodes[j].name){
        temp_target=j;
      }
      if(temp_target!=0&&temp_source!=0){
        break;
      }
    }
    if(temp_source!=temp_target){
      if(temp_source!=T2_number && temp_source!=T3_number && temp_target!=T2_number && temp_target!=T3_number){
      mapdata.edges.push({
        source:temp_source,
        target:temp_target,
        distance:dijdata.edges[i].distance,
        line_number:dijdata.edges[i].line_number[0]
      })
    }
    }
  }
  mapdata.edges.push({source:DZM_number,target:SYQ_number,line_number:"JC"});
  mapdata.edges.push({source:SYQ_number,target:T3_number,line_number:"JC"});
  mapdata.edges.push({source:T3_number,target:T2_number,line_number:"JC"});
  mapdata.edges.push({source:T2_number,target:SYQ_number,line_number:"JC"});

}

function draw_line_color(line_number){
  switch (line_number){
    case "1":
      return "#a12830";
    case "2":
      return "#00529b";
    case "4":
      return "#008193";
    case "5":
      return "#ae005f";
    case "6":
      return "#bb8900";
    case "7":
      return "#ca4e00";
    case "8":
      return "#00997a";
    case "9":
      return "#87d300";
    case "10":
      return "#0092c7";
    case "13":
      return "#f5d312";
    case "14":
      return "#d2a69b";
    case "15":
      return "#6a1d44";
    case "JC":
      return "#9b91b1";
    case "FS":
      return "#d85f26";
    case "YZ":
      return "#f20084";
    case "CP":
      return "#d47daa";
    case "BT":
      return "#a12830";
    //Doing
    case "XJ":
      return "#0092c7";
    case "16":
      return "#00f";
    case "7":
      return d3.rgb(200,71,0).toString();
    case "6-2":
      return "#bb8900";
    case "14-E":
      return "#d2a69b";
    case "15-1W":
      return "#6a1d44";
    case "16":
      return d3.rgb(0,0,139).toString();
    //To do
    case "MTG":
      return "#bb8900";
    case "8-3":
      return "#00997a";
    case "6-3":
      return "#bb8900";
    case "14-M":
      return "#d2a69b";
    case "15-2":
      return "#6a1d44";
    case "JC-W":
      return "#9b91b1";
    //Further
    case "3":
      return "#FF5497";
    case "9-W":
      return "#87d300";
    case "12":
      return d3.rgb(255,177,0).toString();
    case "17":
      return d3.rgb(95,49,0).toString(); 
    case "18"://R1
      return d3.rgb(255,38,46).toString();
    case "19"://R1
      return d3.rgb(91,151,15).toString(); 
    case "XJC"://R1
      return d3.rgb(130,130,130).toString();
    case "YF":
      return "#d85f26";
    case "FS-N":
      return "#d85f26";
    case "YQL":
      return d3.rgb(0,172,167).toString();
    case "DSH":
      return d3.rgb(106,0,255).toString(); 
    case "PG"://R1
      return d3.rgb(4,251,50).toString();
    case "CBD"://R1
      return d3.rgb(0,124,124).toString(); 
    case "21"://S6
      return d3.rgb(85,85,85).toString();

    /*case "":
      return "#009974";*/
    default:
      return "#f00"


  }
}
