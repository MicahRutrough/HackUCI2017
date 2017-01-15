var draw_graph = function(data, var1, var2, color1='red', color2='blue')
{
	var format_mood = function(mood)
	{
		var moods = [":C",":(",":/",":I",":j",":)",":D"];
		return moods[mood];
	}
	
	var margin = {top: 10, right: 50, bottom: 50, left: 50},
	width  = 950 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;
	
	var parseDate = d3.time.format("%Y-%m-%d").parse;

	var x = d3.time.scale().range([0, width]),
		y = d3.scale.linear().range([height, 25]);

	var xAxis = d3.svg.axis().scale(x).orient("bottom"),
		yAxisLeft = d3.svg.axis().scale(y).orient("left").ticks(7).tickFormat(format_mood),
		yAxisRight = d3.svg.axis().scale(y).orient("right");

	var brush = d3.svg.brush().on("brush", brushed);

	var area1 = d3.svg.area()
		.interpolate("monotone")
		.x(function(d) { return x(d.date); })
		.y0(height)
		.y1(function(d) { return y(6-d[var1]); });
		
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
	var gmax = d3.max(data.map(function(d) { return 6-d[var1]; }));
	y.domain([0, 6]);
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
	var gmax = d3.max(data.map(function(d) { return d[var2]; }));
	y.domain([0,  gmax *1.2]);
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

var drawJsonGraph = function(var1, var2, color1='red', color2='blue')
{
	chrome.storage.sync.get(null, function(items)
	{
		var json_values = Object.values(items);
		var json_keys = Object.keys(items);
		var delimeter = "";
		var json_string = "[";
		
		if (json_keys.length < 6)
		{
			var warn = document.getElementById("warn");
			warn.innerHTML = "YOU MUST ANSWER FOR AT LEAST TWO DAYS TO SEE GRAPHS";
		}
		
		for (v in json_values)
		{
			if (json_keys[v] == "name" || json_keys[v] == "addr" || json_keys[v] == "dist" || json_keys[v] == "home_latitude" || json_keys[v] == "home_longitude")
				continue;
			json_string += delimeter;
			json_string += JSON.stringify(json_values[v]);
			delimeter = ",";
		}
		json_string += "]";
		draw_graph(JSON.parse(json_string), var1, var2, color1=color1, color2=color2);
	});
	//draw_graph(JSON.parse(PSEUDO_DATA), var1, var2, color1=color1, color2=color2);
}
var mood_col = "#8361e2";

drawJsonGraph("mood","temp",color1=mood_col,color2="#551155")

console.log(document.getElementById("but_temp"));

var delete_graph = function()
{
	d3.select("svg").remove();
}
var graphlabel = document.getElementById("current_label");
graphlabel.style="display:inline; color: #994499;"
document.getElementById("but_temp").addEventListener("click", 
        function (event) {
            event.preventDefault();
            delete_graph();
			graphlabel.innerHTML = "Temperature";
			graphlabel.style="display:inline; color: #994499;"
			drawJsonGraph("mood", "temp", color1=mood_col, color2="#994499");
        }, 
        false);
		
document.getElementById("but_ssn").addEventListener("click", 
        function (event) {
            event.preventDefault();
            delete_graph();
			graphlabel.innerHTML = "Length of Day";
			graphlabel.style="display:inline; color: red;"
			drawJsonGraph("mood", "sunset", color1=mood_col, color2="red");
        }, 
        false);

document.getElementById("but_aq").addEventListener("click", 
        function (event) {
            event.preventDefault();
            delete_graph();
			graphlabel.innerHTML = "Air quality";
			graphlabel.style="display:inline; color: orange;"
			drawJsonGraph("mood", "air_index", color1=mood_col, color2="orange");
        }, 
        false);
		
document.getElementById("but_dist").addEventListener("click", 
        function (event) {
            event.preventDefault();
            delete_graph();
			graphlabel.innerHTML = "Distance From Home";
			graphlabel.style="display:inline; color: lime;"
			drawJsonGraph("mood", "dist", color1=mood_col, color2="lime");
        }, 
        false);