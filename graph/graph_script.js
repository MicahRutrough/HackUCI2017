var draw_graph = function(data, var1, var2, color1='red', color2='blue')
{
	var margin = {top: 10, right: 10, bottom: 50, left: 200},
	width  = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%Y-%m-%d").parse;

	var x = d3.time.scale().range([0, width]),
		y = d3.scale.linear().range([height, 16]);

	var xAxis = d3.svg.axis().scale(x).orient("bottom"),
		yAxisLeft = d3.svg.axis().scale(y).orient("left"),
		yAxisRight = d3.svg.axis().scale(y).orient("right");

	var brush = d3.svg.brush().on("brush", brushed);

	var area1 = d3.svg.area()
		.interpolate("monotone")
		.x(function(d) { return x(d.date); })
		.y0(height)
		.y1(function(d) { return y(d[var1]); });
		
	var area2 = d3.svg.area()
		.interpolate("monotone")
		.x(function(d) { return x(d.date); })
		.y0(height)
		.y1(function(d) { return y(d[var2]); });

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	svg.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", width)
		.attr("height", height);

	var focus = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	
	function brushed()
	{
		x.domain(brush.empty() ? x2.domain() : brush.extent());
		focus.select("path").attr("d", area);
		focus.select(".x.axis").call(xAxis);
	}
  
	//REAL SCRIPT BEGIN
	
    data.forEach(function(d) {
      d.date = parseDate(d.date);
    });

	x.domain(d3.extent(data.map(function(d) { return d.date; })));
	
	//Draw left graph
	y.domain([0, d3.max(data.map(function(d) { return d[var1]; }))]);
	focus.append("path")
       .datum(data)
       .attr("clip-path", "url(#clip)")
       .attr("d", area1)
	   .attr("fill","none")
	   .attr("stroke-width", 2)
	   .attr("stroke", color1);
	   
	  focus.append("g")
       .attr("class", "y axis")
	   .style("fill",color1)
       .call(yAxisLeft);
	   
	//Draw right graph
	y.domain([0, d3.max(data.map(function(d) { return d[var2]; }))]);
	focus.append("path")
       .datum(data)
       .attr("clip-path", "url(#clip)")
       .attr("d", area2)
	   .attr("fill","none")
	   .attr("stroke-width", 2)
	   .attr("stroke", color2);
	   
	focus.append("g")
		.attr("class", "y axis")
		.style("fill",color2)
		.call(yAxisRight);

		
		
	focus.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis);
}

var getJsonFromStorage = function()
{
	chrome.storage.sync.get(null, function(items)
	{
		var allKeys = Object.keys(items);
		for (o in allKeys)
		{
			console.log(o);
		}
	});
}


/*
  
var jstring = '[\
	{\
		"date":"2013-09-01",\
		"count":1,\
		"score": 4\
	},\
	{\
		"date":"2013-09-02",\
		"count":6,\
		"score": 4\
	},\
	{\
		"date":"2013-09-03",\
		"count":6,\
		"score": 5\
	},\
	{\
		"date":"2013-09-04",\
		"count":4,\
		"score": 3\
	},\
	{\
		"date":"2013-09-05",\
		"count":9,\
		"score": 5\
	},\
	{\
		"date":"2013-09-06",\
		"count":158,\
		"score": 5\
	},\
	{\
		"date":"2013-09-07",\
		"count":107,\
		"score": 4\
	},\
	{\
		"date":"2013-09-08",\
		"count":124,\
		"score": 6\
	}\
]'

data = JSON.parse(jstring)
draw_graph(data, 'count', 'score', color1 = 'red', color2 = 'blue')

*/

data = getJsonFromStorage();