var width = 1280,
    height = 960,
    fill = d3.scale.category20();

// mouse event vars
var mousedown_node = null;

var circle_data=[9,8,7,6,5,4,3,2,1,0];
circle_num=circle_data.length;

// init svg
var outer = d3.select("#chart")
  .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .attr("pointer-events", "all");

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
vis.selectAll("text")
	.data(circle_data)
	.enter()
	.append("text")
    	.text(function(d){return (d+1)*20+"px"})
    	.attr('id',function(d){return "tex"+d})
    	.attr("x",function(d){return width/2+20*(d+1)+2})
    	.attr("y",height/2+3)
    	.attr("font-size","6px")
    	.attr("fill","green");
    	//.attr("opacity",0);

vis.selectAll("path")
	.data(circle_data)
	.enter()
	.append("path")
		.attr('id',function(d){return "cir"+d})
    	.attr("d",function(d){
    		var vcx=width/2;
    		var vy=height/2;
    		var vr=20*(d+1);
    		return 'M '+(vcx+vr)+' '+vy+' A '+vr+' '+vr+' 0 1 1 '+(vcx-vr)+' '+vy+
    			' A '+vr+' '+vr+' 0 1 1 '+(vcx+vr)+' '+vy
    	})
    	.attr('fill','none')
    	.attr('stroke',function(d){var clr=255/(circle_num+1)*(d+1);return d3.rgb(clr,clr,clr)})
    	.on("mouseover",function(d){
    		d3.select(this).transition().duration(400).attr('stroke',"green");
    	//	d3.select("#tex"+d).transition().duration(400).attr("opacity","1");
    	})
    	.on("mouseout",function(d){
    		d3.select(this).transition().duration(400).attr('stroke',function(d){var clr=255/(circle_num+1)*(d+1);return d3.rgb(clr,clr,clr)});
    	//	d3.select("#tex"+d).transition().duration(400).attr("opacity","0");
    	});

function mousedown() {
  if (!mousedown_node) {
    // allow panning if nothing is selected
    vis.call(d3.behavior.zoom().on("zoom"), rescale);
    return;
  }
}

function rescale() {
  trans=d3.event.translate;
  scale=d3.event.scale;

  vis.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}