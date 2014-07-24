var width = 1280,
    height = 720,
    fill = d3.scale.category20();
    darkest_color=64;
    transition_time=400;
    time_font_size=4;
    name_font_size=4;
    MAX_NUM=10000;
    time_scale=2;

var circle_num=15;
circle_data=generate_circle_array(circle_num);


// init svg
var outer = d3.select("#chart")
  .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .attr("pointer-events", "all");
// Circle
var vis = outer
  .append('svg:g')
    .call(d3.behavior.zoom().on("zoom", rescale))
    .on("dblclick.zoom", null)
  .append('svg:g');

vis.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'white');

var bg_layer=vis.append("svg:g");
var data_layer=vis.append("svg:g");

bg_layer.selectAll("path")
	.data(circle_data)
	.enter()
	.append("path")
		.attr('id',function(d){return "cir"+d})
    .attr("d",function(d){return draw_circle(d)})
    .attr('fill','none')
    .attr('stroke',function(d){return draw_circle_color(d,darkest_color)})
    .on("mouseover",function(d){
    	d3.select(this)
        .transition()
        .duration(transition_time)
        .attr('stroke',"green");
    	d3.select("#tex"+d)
        .transition()
        .duration(transition_time)
        .attr("opacity","1");
    })
    .on("mouseout",function(d){
    	d3.select(this)
        .transition()
        .duration(transition_time)
        .attr('stroke',function(d){return draw_circle_color(d,darkest_color)});
    	d3.select("#tex"+d)
        .transition()
        .duration(transition_time)
        .attr("opacity","0");
    });

bg_layer.selectAll("text")
  .data(circle_data)
  .enter()
  .append("text")
      .text(function(d){return (d+1)*10+" min"})
      .attr('id',function(d){return "tex"+d})
      .attr("x",function(d){return width/2+20*(d+1)+2})
      .attr("y",height/2+time_font_size/2)
      .attr("font-size",time_font_size+"px")
      .attr("fill","green")
      .attr("opacity",0);

//Circle End ####################

var dataset={edges:[],nodes:[]};
d3.tsv("station_index.txt",function(data){
  dataset.nodes=data;
  d3.tsv("link_index.txt",function(data){
    dataset.edges=data;
    for (var i = 0; i<dataset.edges.length;i++) {
      dataset.edges[i].source=parseInt(dataset.edges[i].source);
      dataset.edges[i].target=parseInt(dataset.edges[i].target);
      dataset.edges[i].distance=parseFloat(dataset.edges[i].distance);
    };
    num_station=dataset.nodes.length;
  matrix=new Array(num_station);
  for(var ii=0;ii<num_station;ii++){
    matrix[ii]=new Array(num_station);
    for(var jj=0;jj<num_station;jj++){
      matrix[ii][jj]=MAX_NUM;
    }
    matrix[ii][ii]=0;
  }
//  console.log(matrix);
  for(ii=0;ii<dataset.edges.length;ii++){
    console.log(ii);
    matrix[dataset.edges[ii].source][dataset.edges[ii].target]=dataset.edges[ii].distance;
  }


    dist=calculate_length(0);
    for (var i=0;i<dataset.nodes.length;i++){
      dataset.nodes[i].value=dist[i];
    };
//    console.log(dist);
    force_data();
  });
});

//Data End########################

function force_data(){
var force=d3.layout.force()
  .links(dataset.edges)
  .nodes(dataset.nodes)
  .size([width,height])
  .start()
  .on("tick",function(){
    nodes
      .attr("cx",function(d){return change_location_x(d.x,d.y,d.value);})
      .attr("cy",function(d){return change_location_y(d.x,d.y,d.value);})
    edges
      .attr("x1",function(d){return change_location_x(d.source.x,d.source.y,d.source.value);})
      .attr("y1",function(d){return change_location_y(d.source.x,d.source.y,d.source.value);})
      .attr("x2",function(d){return change_location_x(d.target.x,d.target.y,d.target.value);})
      .attr("y2",function(d){return change_location_y(d.target.x,d.target.y,d.target.value);});
    node_name
      .attr("x",function(d){return change_location_x(d.x,d.y,d.value)+3})
      .attr("y",function(d){return change_location_y(d.x,d.y,d.value)+name_font_size/2-1});
  });
var edges=data_layer.selectAll("line")
  .data(dataset.edges)
  .enter()
  .append("line")
  .style("stroke","#00f")
  .style("stroke-width",1);
var nodes=data_layer.selectAll("circle")
  .data(dataset.nodes)
  .enter()
  .append("circle")
  .attr("id",function(d){return "data_cir"+d.index})
  .attr("r",2)
  .style("fill","#f00")
  .call(force.drag)
  .on("mouseover",function(d){
      d3.select("#name_text"+d.index)
        .transition()
        .duration(transition_time)
        .attr("opacity","1");
      data_layer.selectAll("line")
        .transition()
        .duration(transition_time)
        .attr("opacity","0.1");
    })
    .on("mouseout",function(d){
      d3.select("#name_text"+d.index)
        .transition()
        .duration(transition_time)
        .attr("opacity","0.1");
      data_layer.selectAll("line")
        .transition()
        .duration(transition_time)
        .attr("opacity","1");
    })
    .on("click",function(d){
     // console.log(d.index);
      dist=calculate_length(d.index);
      for(ii=0;ii<dist.length;ii++){
        d3.select("#data_cir"+ii).data()[0].value=dist[ii];  
      }
      console.log(dist);
      force.start();
      //vis.rect.attr("visibility","inherit");
      //vis.rect.attr("visibility","visible");
    //  vis.call(d3.behavior.zoom().on("zoom"), rescale);
    //    d.value=d.value+10;
    });
var node_name=data_layer.selectAll("text")
  .data(dataset.nodes)
  .enter()
  .append("text")
    .attr('id',function(d){return "name_text"+d.index})
    .text(function(d){return d.name})
    .attr("font-size",name_font_size+"px")
    .attr("fill","blue")
    .attr("opacity",0.1);
}

//--------------------

function generate_circle_array(circle_num){
  var circle_data=new Array();
  for (var i = 0; i < circle_num; i++) {
    circle_data[i]=circle_num-i-1
  };
  return circle_data;
}

function draw_circle(d){
  var vcx=width/2;
  var vy=height/2;
  var vr=20*(d+1);
  return 'M '+(vcx+vr)+' '+vy+' A '+vr+' '+vr+' 0 1 1 '+(vcx-vr)+' '+vy+
    ' A '+vr+' '+vr+' 0 1 1 '+(vcx+vr)+' '+vy
}

function draw_circle_color(d,darkestcolor){
  clr=255-darkestcolor/(circle_num+1)*(circle_num-d);
  return d3.rgb(clr,clr,clr)
}

function rescale() {
    console.log("a");
  trans=d3.event.translate;
  scale=d3.event.scale;
  vis.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}

function change_location_x(x,y,value){
  return width/2+(x-width/2)*value*time_scale/Math.sqrt((x-width/2)*(x-width/2)+(y-height/2)*(y-height/2));
}
function change_location_y(x,y,value){
  return height/2+(y-height/2)*value*time_scale/Math.sqrt((x-width/2)*(x-width/2)+(y-height/2)*(y-height/2));
}

function calculate_length(start_station){
  dist=matrix[start_station];
  dist_length=dist.length;
  S=new Array();

  S.push(start_station);
  min_dis=0;
  dist[start_station]=-1;
  while(S.length!=num_station){
    min_location=-1;
    this_min_dis=MAX_NUM;
    for(jj=0;jj<dist_length;jj++){
      if(dist[jj]>=min_dis && dist[jj]<this_min_dis){
        this_min_dis=dist[jj];
        min_location=jj;
      }
    }
    S.push(min_location);
    min_dis=this_min_dis;
    dist[min_location]=dist[min_location]-1;
    for(jj=0;jj<dist_length;jj++){
      if(dist[jj]>=min_dis){
        if((min_dis+matrix[min_location][jj])<dist[jj]){
          dist[jj]=min_dis+matrix[min_location][jj]
        }
      }
    }
  }
  for(ii=0;ii<dist_length;ii++){
    dist[ii]=dist[ii]+1;
  }
  return dist;
}

