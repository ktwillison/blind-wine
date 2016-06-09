var hist = function(data_in, chart_id, value, chart_title) {

  var margin = {
      "top": 30,
      "right": 30,
      "bottom": 50,
      "left": 30
    },
    width = 600 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  var x = d3.scale.linear()
    .domain([0, 1])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, d3.max(data_in, function(d) {
      return d.value[value];
    })])
    .range([height, 0]);
	
  d3.select("#" + chart_id).remove();
  
  var div = d3.select("#baseball_canvas").append("div").attr("id", chart_id);
  
  div.append("h4").text(chart_title);
  
  var svg = div.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bar = svg.selectAll(".bar")
    .data(data_in)
    .enter()
    .append("g")
    .attr("class", "bar")
    .attr("transform", function(d, i) {
      return "translate(" + x(i / data_in.length) + "," + y(d.value[value]) + ")";
    });

  bar.append("rect")
    .attr("x", 1)
    .attr("width", width / data_in.length - 1)
    .attr("height", function(d) {
      return height - y(d.value[value]);
    });

  var formatCount = d3.format(",.0f");

  bar.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", (width / data_in.length - 1) / 2)
    .attr("text-anchor", "middle")
    .text(function(d) {
      return formatCount(d.value[value]);
    });

  var unique_names = data_in.map(function(d) {
    return d.key;
  });

  var xScale = d3.scale.ordinal().domain(unique_names).rangePoints([0, width]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

  var xTicks = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("font-size", 10)
    .attr("transform", function(d) {
      return "rotate(-50)"
    });


  var yAxis = d3.svg.axis()
    .ticks(5)
    .scale(y)
    .orient("left");

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(yAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("font-size", 10);
}

// Data format: {"year": "1871", "team_id": "BS1", "player_id": "barnero01", "g_all": 31}
d3.json("https://tranquil-peak-82564.herokuapp.com/api/v1.0/data/baseball/limit/100/",
  function(error, games_json) {
  
		// Define dimensions and groups
    var cf = crossfilter(games_json);
    var dim_team = cf.dimension(function(d) { return d.team_id; });
    var dim_ngames = cf.dimension(function(d){ return d.g_all;     });
    var dim_player = cf.dimension(function(d){ return d.player_id;     });
    var dim_year = cf.dimension(function(d){ return d.year;     });
    
    // Define a second group of dimensions to filter on with the sliders, 
    // in order to avoid the non-update problem debugged in class
    var filter_dim_team = cf.dimension(function(d) { return d.team_id; });
    var filter_dim_ngames = cf.dimension(function(d){ return d.g_all;     });
    var filter_dim_player = cf.dimension(function(d){ return d.player_id;     });
    var filter_dim_year = cf.dimension(function(d){ return d.year;     });
    
    var group_team = dim_team.group();
    var group_ngames = dim_ngames.group();
    var group_player = dim_player.group();
    var group_year = dim_year.group();
     
  	/*
    // sanity check
    dim_year.group()
      .top(Infinity)
      .forEach(function(d, i) {
        console.log(JSON.stringify(d));
      });
      */
    
    
    var reduce_init = function() {
      return {
        "count": 0,
        "total": 0,
        
        // Add min and max year to this reduction
        "min_year" : 3000,
        "max_year" : 0,
        "all_years": []
      };
    }

    var reduce_add = function(p, v, nf) {
      ++p.count;
      p.total += v.g_all;
      if (v.year > p.max_year) { p.max_year = v.year};
      if (v.year < p.min_year) { p.min_year = v.year};
      p.all_years.push(v.year);
      return p;
    }

    var reduce_remove = function(p, v, nf) {
      --p.count;
      p.total -= v.g_all;
      p.all_years.splice(p.all_years.indexOf(v.year), 1);
  		p.max_year = Math.max.apply(null, p.all_years); 
      p.min_year = Math.min.apply(null, p.all_years); 
      return p;
    }
    
    /* --------------------------------------------------------- */
    
    
    group_team.reduce(reduce_add, reduce_remove, reduce_init);
    group_year.reduce(reduce_add, reduce_remove, reduce_init);
		group_player.reduce(reduce_add, reduce_remove, reduce_init);
    
    var render_plots = function(){
      // count refers to a specific key specified in reduce_init 
      // and updated in reduce_add and reduce_subtract
      // Modify this for the chart to plot the specified variable on the y-axis
      hist(group_team.top(Infinity), 
      	"appearances_by_team", 
        "count", 
        "Number of Appearances by Team"
      );
      
      hist(group_player.top(Infinity), 
      	"total_appearances_per_player", 
        "total", 
        "Total Appearances by Player"
      );
      
      hist(group_year.top(Infinity), 
      	"total_appearances_per_year", 
        "total", 
        "Total Player Appearances by Year"
      );   
      
      hist(group_year.top(Infinity), 
      	"count_players_per_year", 
        "count", 
        "Player Count (in dataset) by Year"
      );   
    }
    
    
    /*  Define sliders */
    var n_games_slider = new Slider(
      "#n_games_slider", {
        "id": "n_games_slider",
        "min": 0,
        "max": 100,
        "range": true,
        "value": [0, 100]
      });

    // Find first and last year in dataset
    var first_year = dim_year.bottom(1)[0].year;
    var last_year = dim_year.top(1)[0].year;
                
    var year_slider = new Slider(
      "#year_slider", {
        "id": "year_slider",
        "min": first_year -1,
        "max": last_year +1,
        "range": true,
        "value": [first_year -1, last_year +1]
      });
    
    // Add event listener to team name filter
    $('#team_name_filter').bind("keyup", filterTeams);
    
    // Create player selection tags
    // var player_select_buttons = document.createElement('div');
    // player_select_buttons.setAttribute("id", "player_select_buttons");
    // $("#baseball_canvas").append(player_select_buttons);
    
    var clearButton = document.createElement('div');
    clearButton.setAttribute("class", "button");
    clearButton.classList.add("settings");
    clearButton.innerHTML = "Clear player selections"
    clearButton.addEventListener("click", deselectAllPlayers);
    $("#player_select_settings").append(clearButton);
    
    var selectAllButton = document.createElement('div');
    selectAllButton.setAttribute("class", "button");
    selectAllButton.classList.add("settings");
    selectAllButton.innerHTML = "Select all players"
    selectAllButton.addEventListener("click", selectAllPlayers);
    $("#player_select_settings").append(selectAllButton);
    $("#player_select_settings").append(document.createElement("br"));
    
    // Add a button for each player_id
    dim_player.bottom(Infinity).forEach ( function(player) {
    	var button = document.createElement('div');
      button.setAttribute("id", "select_" + player.player_id);
      button.setAttribute("class", "button");
      button.classList.add("selected");
      button.innerHTML = player.player_id;
      
      // Add click event listener to filter dimension
      button.addEventListener("click", filterPlayers, event);
      $("#player_select_buttons").append(button);
    });
    

    /* add at least 3 more sliders here */
   
    /* Define slider event handlers */
    n_games_slider.on("slide", function(e) {
      d3.select("#n_games_slider_txt").text("min: " + e[0] + ", max: " + e[1]);
    	
      // filter based on the UI element
      filter_dim_ngames.filter(e);
      
   		// re-render
      render_plots(); 
       
     /* update the other charts here 
      hint: each one of your event handlers needs to update all of the charts
     */
    });
    
    year_slider.on("slide", function(e) {
      d3.select("#year_slider_txt").text("min: " + e[0] + ", max: " + e[1]);
    	
      // filter based on the UI element
      filter_dim_year.filter(e);
      
   		// re-render
      render_plots(); 
       
     /* update the other charts here 
      hint: each one of your event handlers needs to update all of the charts
     */
    });
    
    function filterPlayers(event) {
    	event.target.classList.toggle("selected")
      renderSelectedPlayers();
    }
    
    function selectAllPlayers() {
    	$(".button").addClass("selected")
    	renderSelectedPlayers();
    }
    
    function deselectAllPlayers() {
    	$(".button").removeClass("selected")
    	renderSelectedPlayers();
    }
    
    function renderSelectedPlayers() {
    	var selectedPlayers = [];
      var playerTags = document.getElementById("player_select_buttons").childNodes;
    	for(var i=0; i<playerTags.length; i++) {  
        if(playerTags[i].classList.contains('selected')) {
        	selectedPlayers.push(playerTags[i].textContent);
        }
      }
      
    	// filter based on the UI element
      filter_dim_player.filter(function(d) { return $.inArray(d, selectedPlayers) > -1; });
      
   		// re-render
      render_plots(); 
    }
    
    function filterTeams(event) {
    	var filterText = event.target.value.toLowerCase();
      
    	if(filterText == "") {
      	filter_dim_team.filterAll()
      } else {
      	filter_dim_team.filter(function(d) { return d.toLowerCase().indexOf(filterText) > -1; });
      }
      
      // re-render
      render_plots(); 
    }
 
     render_plots(); // this just renders the plots for the first time
    
  });
