/* 

API returns entire iris dataset
http://tranquil-peak-82564.herokuapp.com/api/v1.0/data/iris/

API returns n=10 entries from dataset, useful for debugging
http://tranquil-peak-82564.herokuapp.com/api/v1.0/data/iris/limit/10/

data is in this format
{"sepal_length":5.1,"sepal_width":3.5,"petal_length":1.4,"petal_width":0.2,"species":"setosa"}

*/

d3.json("http://tranquil-peak-82564.herokuapp.com/api/v1.0/data/iris/", function(remote_json){
	
  window.remote_json = remote_json;
  
  // crossfilter
  var cf            = crossfilter(remote_json);
  
  // dimension
  // round all decimals to the nearest .5
  var sepal_length  = cf.dimension(function(d){return Math.round(d.sepal_length * 2)/2; }); 
  var species       = cf.dimension(function(d){return d.species; }); 
  var sepal_width   = cf.dimension(function(d){return Math.round(d.sepal_width * 2)/2; }); 
  var petal_length  = cf.dimension(function(d){return Math.round(d.petal_length * 2)/2; }); 
  var petal_width   = cf.dimension(function(d){return Math.round(d.petal_width * 2)/2; }); 
 
  // groups
  var sepal_length_sum = sepal_length.group().reduceSum(function(d){ return d.sepal_length; });
  var species_sum      = species.group().reduceCount();
  var sepal_width_sum  = sepal_width.group().reduceSum(function(d){ return d.sepal_width; });
  var petal_length_sum = petal_length.group().reduceSum(function(d){ return d.petal_length; });
  var petal_width_sum  = petal_width.group().reduceSum(function(d){ return d.petal_width; });

  
	// Find unique species names
  window.species_names = _.chain(remote_json).pluck("species").uniq().value()
 
 
  //Create charts
  
  // Helper function to define a chart's range
  function getRange(dimension, property) {
  	var min = Math.floor(dimension.bottom(1)[0][property]) - 1;
    var max = Math.ceil(dimension.top(1)[0][property]) + 1;
    return[min, max];
  }
  
  var sepal_length_chart_range = getRange(sepal_length, "sepal_length")
  var sepal_length_chart = dc.barChart("#sepal_length_chart")
    .width(250)
    .height(200)
    .dimension(sepal_length)
    .group(sepal_length_sum)
    .centerBar(true)
  	.x( d3.scale.linear().domain(sepal_length_chart_range) )
    .xUnits(dc.units.fp.precision(.5));
  sepal_length_chart.xAxis().ticks(sepal_length_chart_range[1] - sepal_length_chart_range[0]);

  var species_pie_chart = dc.pieChart("#species_pie_chart")
    .width(200)
    .height(200)
    .radius(100)
    .innerRadius(50)
    .dimension(species)
    .group(species_sum)
    .renderLabel(true)
    .label(function (d) {	return (d.data.key ); });
  
   var sepal_width_chart_range = getRange(sepal_width, "sepal_width")
   var sepal_width_chart = dc.rowChart("#sepal_width_chart")
     .width(250)
     .height(200)
     .dimension(sepal_width)
     .group(sepal_width_sum);
   
   var petal_length_chart_range = getRange(petal_length, "petal_length")
   var petal_length_chart = dc.barChart("#petal_length_chart")
     .width(250)
     .height(200)
     .dimension(petal_length)
     .group(petal_length_sum)
     .centerBar(true)
     .x( d3.scale.linear().domain(petal_length_chart_range) )
     .xUnits(dc.units.fp.precision(.5));
   petal_length_chart.xAxis().ticks(petal_length_chart_range[1] - petal_length_chart_range[0]);
   
   var petal_width_chart_range = getRange(petal_width, "petal_width")
   var petal_width_chart = dc.rowChart("#petal_width_chart")
     .width(250)
     .height(200)
     .dimension(petal_width)
     .group(petal_width_sum);

  // Add a reset button
  d3.select("#resetButton")
    .append("button")
    .attr("type","button")
    .attr("class","btn-btn")
    .style("visibility", "hidden")
    .append("div")
    .attr("class","label")
    .attr("class","selected")
    .text(function(d) { return "Reset";})
    .on("click", function(){
      sepal_length_chart.filter(null);
      species_pie_chart.filter(null);
      sepal_width_chart.filter(null);
      petal_length_chart.filter(null);
      petal_width_chart.filter(null);
      dc.redrawAll();
    })

  // show button when filtered
  var showButton = function(){
    if(sepal_length_chart.filters().length > 0 || 
    	species_pie_chart.filters().length > 0 || 
      sepal_width_chart.filters().length > 0 || 
      petal_length_chart.filters().length > 0 || 
      petal_width_chart.filters().length > 0 ){
      d3.select(".btn-btn")
        .style("visibility", "visible")
    } else {
      d3.select(".btn-btn")
        .style("visibility", "hidden")
    };
  };

  sepal_length_chart.on('filtered', showButton);
  species_pie_chart.on('filtered', showButton);
  sepal_width_chart.on('filtered', showButton);
  petal_length_chart.on('filtered', showButton);
  petal_width_chart.on('filtered', showButton);

  dc.renderAll();
  
});