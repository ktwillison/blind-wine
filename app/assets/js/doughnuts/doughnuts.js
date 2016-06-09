function updateID(item) {
  var updated_item = item;
  updated_item._id = item["id"];
  updated_item["id"] = null;
  if (updated_item.children){
    for(i=0; i<updated_item.children.length; i++){
      updated_item.children[i] = updateID(updated_item.children[i]);
    }
  }
  return updated_item;
}

var DataSet = function() {
  this.data = {
    "items": {
      "item": [{
          "_id": "0001",
          "type": "donut",
          "name": "Cake",
          "ppu": 0.55,
          "batters": {
            "batter": [{
              "_id": "1001",
              "type": "Regular"
            }, {
              "_id": "1002",
              "type": "Chocolate"
            }, {
              "_id": "1003",
              "type": "Blueberry"
            }, {
              "_id": "1004",
              "type": "Devil's Food"
            }]
          },
          "topping": [{
            "_id": "5001",
            "type": "None"
          }, {
            "_id": "5002",
            "type": "Glazed"
          }, {
            "_id": "5005",
            "type": "Sugar"
          }, {
            "_id": "5007",
            "type": "Powdered Sugar"
          }, {
            "_id": "5006",
            "type": "Chocolate with Sprinkles"
          }, {
            "_id": "5003",
            "type": "Chocolate"
          }, {
            "_id": "5004",
            "type": "Maple"
          }]
        }, {
          "_id": "0002",
          "type": "donut",
          "name": "Raised",
          "ppu": 0.55,
          "batters": {
            "batter": [{
              "_id": "1001",
              "type": "Regular"
            }]
          },
          "topping": [{
            "_id": "5001",
            "type": "None"
          }, {
            "_id": "5002",
            "type": "Glazed"
          }, {
            "_id": "5005",
            "type": "Sugar"
          }, {
            "_id": "5003",
            "type": "Chocolate"
          }, {
            "_id": "5004",
            "type": "Maple"
          }]
        },

        {
          "_id": "0003",
          "type": "donut",
          "name": "Old Fashioned",
          "ppu": 0.55,
          "batters": {
            "batter": [{
              "_id": "1001",
              "type": "Regular"
            }, {
              "_id": "1002",
              "type": "Chocolate"
            }]
          },
          "topping": [{
            "_id": "5001",
            "type": "None"
          }, {
            "_id": "5002",
            "type": "Glazed"
          }, {
            "_id": "5003",
            "type": "Chocolate"
          }, {
            "_id": "5004",
            "type": "Maple"
          }]
        }, {
          "_id": "0004",
          "type": "bar",
          "name": "Bar",
          "ppu": 0.75,
          "batters": {
            "batter": [{
              "_id": "1001",
              "type": "Regular"
            }, ]
          },
          "topping": [{
            "_id": "5003",
            "type": "Chocolate"
          }, {
            "_id": "5004",
            "type": "Maple"
          }],
          "fillings": {
            "filling": [{
              "_id": "7001",
              "name": "None",
              "addcost": 0
            }, {
              "_id": "7002",
              "name": "Custard",
              "addcost": 0.25
            }, {
              "_id": "7003",
              "name": "Whipped Cream",
              "addcost": 0.25
            }]
          }
        },

        {
          "_id": "0005",
          "type": "twist",
          "name": "Twist",
          "ppu": 0.65,
          "batters": {
            "batter": [{
              "_id": "1001",
              "type": "Regular"
            }, ]
          },
          "topping": [{
            "_id": "5002",
            "type": "Glazed"
          }, {
            "_id": "5005",
            "type": "Sugar"
          }, ]
        },

        {
          "_id": "0006",
          "type": "filled",
          "name": "Filled",
          "ppu": 0.75,
          "batters": {
            "batter": [{
              "_id": "1001",
              "type": "Regular"
            }, ]
          },
          "topping": [{
            "_id": "5002",
            "type": "Glazed"
          }, {
            "_id": "5007",
            "type": "Powdered Sugar"
          }, {
            "_id": "5003",
            "type": "Chocolate"
          }, {
            "_id": "5004",
            "type": "Maple"
          }],
          "fillings": {
            "filling": [{
              "_id": "7002",
              "name": "Custard",
              "addcost": 0
            }, {
              "_id": "7003",
              "name": "Whipped Cream",
              "addcost": 0
            }, {
              "_id": "7004",
              "name": "Strawberry Jelly",
              "addcost": 0
            }, {
              "_id": "7005",
              "name": "Rasberry Jelly",
              "addcost": 0
            }]
          }
        }
      ]
    }
  };
  
  // Update the provided data to fit it into the required format
  // for the D3 visualization
  function transformData(data) {
    var data_transformed = {
      "name" : "items",
      "children" : data.items.item
    };

    for(i=0; i<data_transformed.children.length; i++){
      
      var item = {
        "id" : data_transformed.children[i].id,
        "name" : data_transformed.children[i].name,
        "ppu" : data_transformed.children[i].ppu,
        "type" : data_transformed.children[i].type,
        "children" : []
      }

      // Reformat batters
      if(data_transformed.children[i].batters){
        var batters = {
          "name" : "batters",
          "children" : data_transformed.children[i].batters.batter
        };
        item.children.push(batters);
      }

      // Reformat toppings
      if(data_transformed.children[i].topping) {
        var topping = {
          "name" : "toppings",
          "children" : data_transformed.children[i].topping
        };
        item.children.push(topping);
      }

      // Reformat fillings
      if(data_transformed.children[i].fillings) {
        var fillings = {
          "name" : "fillings",
          "children" : data_transformed.children[i].fillings.filling
        };
        item.children.push(fillings);
      }

      // Reformat item
      data_transformed.children[i] = item;
    }

    // Update the item IDs so that it doesn't mess with D3's game
    // (this function didn't actually work- so I did it manually...)
    data_transformed = updateID(data_transformed);
    return data_transformed;
  }
  this.dataTransformed = transformData(this.data);
};


// Set up general D3 variables
var donuts = (new DataSet()).dataTransformed;
  
var height = 740,
    width = 1100;

var svg = d3
    .select("#hierarchy")
    .append("svg")
    .attr("height", height)
    .attr("width", width);

svg
    .append("g")
    .attr("transform", "translate(50,0)");

var tree = d3
    .layout
    .tree()
    .size([height, width - 150]);

var diagonal = d3
    .svg
    .diagonal()
    .projection(function(d) {
      return [d.y, d.x];
    });

var search_term = "Sugar";

function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  search_term = d.name ? d.name : d.type;
  update(d);
}

var depthCount = function(branch) {
    if (!branch.children) {
        return 1;
    }
    return 1 + d3.max(branch.children.map(depthCount));
}

var max_depth = depthCount(donuts);
var max_size = 10;

var scaleInterpolate = d3.interpolateNumber(max_size, 1)

var scale = d3.scale.log()
 .domain([1, max_depth])
 .range([max_size, 1]);

var colorScale = d3.scale.linear()
  .domain([1, max_depth])
  .range(["orange", "blue"]);

function findInPath(source, text) {
  if(source.name === text || source.type === text) {
    return true;
  }

  else if(source.children || source._children){
    var c = source.children ? source.children : source._children;
    for(var i = 0; i<c.length; i++){
      if(findInPath(c[i], text)){
        return true;
      }
    }
  }
  return false;
}

var linkFilter = function(d){
    return findInPath(d.target, search_term)}

var i = 0;
var duration = 750;


function update(source) {
  var nodes = tree.nodes(donuts);
  var links = tree.links(nodes);

  var node = svg.selectAll("g.node")
    .data(nodes, function(d) { 
      return d.id || (d.id = ++i); 
    });

  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", click);
    
  nodeEnter.append("circle")
    .attr("r", 1e-6)
    .style("fill", function(d) { 
      return d._children ? "lightsteelblue" : "#fff"; })
    .style("stroke", "steelblue")
    .style("stroke-width", "1.5px");

  nodeEnter.append("text")
    .attr("dx", function(d) { 
      return d.children || d._children ? -13 : 13; })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) { 
      return d.children || d._children ? "end" : "start"; })
    .text(function(d) { 
      if(d.name) 
        return d.name;
      return d.type; 
     })
    .style("fill-opacity", 1e-6)
    .style("font", "10px sans-serif")
    // .style("stroke", "black")
    .style("stroke-width", ".01px");


  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function(d) { 
      return "translate(" + d.y + "," + d.x + ")"; 
    });

  nodeUpdate.select("circle")
    .attr("r", function(d) {
      return scaleInterpolate(d.depth/max_depth);})
    .style("fill", function(d) {
      return d._children ? colorScale(d.depth) : "#fff"; })
    .style("stroke", "steelblue")
    .style("stroke-width", "1.5px");

  nodeUpdate.select("text")
    .style("fill-opacity", 1)
    .style("font", "10px sans-serif")
    .style("stroke", function(d) {
      return colorScale(d.depth);
    })
    .style("fill", function(d) {
      return colorScale(d.depth); })
    .style("stroke-width", ".01px");

  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) { 
      return "translate(" + source.y + "," + source.x + ")"; })
    .remove();

  nodeExit.select("circle")
    .attr("r", 1e-6);

  nodeExit.select("text")
    .style("fill-opacity", 1e-6);

  var link = svg.selectAll("path.link")
    .data(links, function(d) { return d.target.id; });

  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
      var o = {x: source.x0, y: source.y0};
      return diagonal({source: o, target: o});
    })
    .style("fill", "none")
    .style("stroke", "#ccc")
    .style("stroke-width", "1.5px");

  link.transition()
    .duration(duration)
    .attr("d", diagonal);

  link.exit().transition()
    .duration(duration)
    .attr("d", function(d) {
      var o = {x: source.x, y: source.y};
      return diagonal({source: o, target: o});
    })
    .remove();

  link.filter(linkFilter).style("stroke", "red");
  link.filter(function(d){ return !linkFilter(d); })
      .style("stroke", "ccc");

  nodeUpdate.select("circle")
    .filter(function(d) {
      return findInPath(d, search_term)
    })
    .style("fill", function(d) {
      return d._children ? "red" : "#faa";
    });

  nodeUpdate.select("circle")
    .filter(function(d) {
      return !findInPath(d, search_term)
    })
    .style("fill", function(d) {
      return d._children ? colorScale(d.depth) : "#fff";
    });

  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

donuts.x0 = height / 2;
donuts.y0 = 0;

update(donuts);