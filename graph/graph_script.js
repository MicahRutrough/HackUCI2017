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

var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.count); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var jstring = '[\
	{\
		"date":"2013-09-01",\
		"count":1\
	},\
	{\
		"date":"2013-09-02",\
		"count":6\
	},\
	{\
		"date":"2013-09-03",\
		"count":6\
	},\
	{\
		"date":"2013-09-04",\
		"count":4\
	},\
	{\
		"date":"2013-09-05",\
		"count":9\
	},\
	{\
		"date":"2013-09-06",\
		"count":158\
	},\
	{\
		"date":"2013-09-07",\
		"count":107\
	},\
	{\
		"date":"2013-09-08",\
		"count":124\
	}\
]'

var jstring2 = '[\
	{\
		"date":"2013-09-01",\
		"count":123\
	},\
	{\
		"date":"2013-09-02",\
		"count":182\
	},\
	{\
		"date":"2013-09-03",\
		"count":220\
	},\
	{\
		"date":"2013-09-04",\
		"count":192\
	},\
	{\
		"date":"2013-09-05",\
		"count":168\
	},\
	{\
		"date":"2013-09-06",\
		"count":253\
	},\
	{\
		"date":"2013-09-07",\
		"count":102\
	},\
	{\
		"date":"2013-09-08",\
		"count":377\
	}\
]'

data = JSON.parse(jstring)
data2 = JSON.parse(jstring2)

var draw_graph = function(data, color='black', labels='left')
{
	if (labels == 'left')
	{
		yAxis = yAxisLeft;
	}
	else
	{
		yAxis = yAxisRight;
	}
    data.forEach(function(d) {
      d.date = parseDate(d.date);
    });

  x.domain(d3.extent(data.map(function(d) { return d.date; })));
  y.domain([0, d3.max(data.map(function(d) { return d.count; }))]);

  focus.append("path")
       .datum(data)
       .attr("clip-path", "url(#clip)")
       .attr("d", area)
	   .attr("fill","none")
	   .attr("stroke-width", 2)
	   .attr("stroke", color);

  focus.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis);

  focus.append("g")
       .attr("class", "y axis")
	   .style("fill",color)
       .call(yAxis);
}

function brushed() {
    x.domain(brush.empty() ? x2.domain() : brush.extent());
    focus.select("path").attr("d", area);
    focus.select(".x.axis").call(xAxis);
  }

draw_graph(data, color = 'red')
draw_graph(data2, color = 'blue', labels = 'right')