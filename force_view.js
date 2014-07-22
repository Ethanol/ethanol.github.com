var width = 1280,
    height = 720,
    fill = d3.scale.category20();

    darkest_color=64;
    transition_time=400;
    time_font_size=4;
    name_font_size=4;

circle_num=15
circle_data=new Array();
for (var i = 0; i < circle_num; i++) {
  circle_data[i]=circle_num-i-1
};

// mouse event vars
var mousedown_node = null;

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
  .append('svg:g')
    .on("mousedown", mousedown);
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
//Circle End ####################
//Circle End ####################
//Circle End ####################
//Circle End ####################

var dataset={
  nodes:[
    {'index':'1',name:"苹果园","value":20},
    {'index':'2',name:"古城","value":80},
    {'index':'3',name:"玉泉路","value":0}
  ],
  edges:[
    {source:0,target:1},
    {source:1,target:2},
    {source:2,target:0}
  ]
};
var center=0;
var distance=[0,2,3];

var force=d3.layout.force()
  .nodes(dataset.nodes)
  .links(dataset.edges)
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
 /*   .on("click",function(d){

    })*/;
var node_name=data_layer.selectAll("text")
  .data(dataset.nodes)
  .enter()
  .append("text")
    .attr('id',function(d){return "name_text"+d.index})
    .text(function(d){return d.name})
    .attr("font-size",name_font_size+"px")
    .attr("fill","blue")
    .attr("opacity",0.1);


function mousedown() {
  if (!mousedown_node) {
    // allow panning if nothing is selected
    vis.call(d3.behavior.zoom().on("zoom"), rescale);
    return;
  }
}

//--------------------
//--------------------
//--------------------
//--------------------
//--------------------
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
  trans=d3.event.translate;
  scale=d3.event.scale;
  vis.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}

function change_location_x(x,y,value){
  return width/2+(x-width/2)*value/Math.sqrt((x-width/2)*(x-width/2)+(y-height/2)*(y-height/2));
}
function change_location_y(x,y,value){
  return height/2+(y-height/2)*value/Math.sqrt((x-width/2)*(x-width/2)+(y-height/2)*(y-height/2));
}



