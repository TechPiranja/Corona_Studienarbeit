const container = d3.select("#simpleBarChart").classed("container", true);

const render = (data) => {
	const width = parseInt(container.style("width"));
	const height = parseInt(container.style("height"));
	const xValue = (d) => d.date;
	const yValue = (d) => d.DEU_new_cases;
	const margin = { top: 20, right: 50, bottom: 40, left: 50 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	const xScale = d3.scaleBand().domain(data.map(xValue)).range([0, innerWidth]).padding(0.1);
	const yScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, yValue)])
		.range([innerHeight, 0]);
	const g = container.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

	g.append("g").style("font", "15px times").call(d3.axisLeft(yScale));
	g.append("g")
		.style("font", "15px times")
		.attr("transform", `translate(0, ${innerHeight})`)
		.call(
			d3
				.axisBottom(xScale)
				.tickValues(
					xScale.domain().filter((d, i) => i % d3.format(".1")(data.length / 4) === 0 || i == data.length - 1)
				)
		);

	g.selectAll(".bar")
		.data(data)
		.enter()
		.append("rect")
		.classed("bar", true)
		.attr("width", xScale.bandwidth())
		.attr("height", (d) => innerHeight - yScale(yValue(d)))
		.attr("x", (d) => xScale(xValue(d)))
		.attr("y", (d) => yScale(yValue(d)));

	//------------ second visualization ------------
	const dataviz = d3
		.select("#dataviz")
		.append("svg")
		.classed("container", true)
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	// group the data: I want to draw one line per group
	var sumstat = d3
		.nest() // nest function allows to group the calculation per level of a factor
		.key(function (d) {
			return d.key;
		})
		.entries(data);

	dataviz
		.append("g")
		.style("font", "15px times")
		.attr("transform", `translate(0, ${innerHeight})`)
		.call(
			d3
				.axisBottom(xScale)
				.tickValues(
					xScale.domain().filter((d, i) => i % d3.format(".1")(data.length / 4) === 0 || i == data.length - 1)
				)
		);

	dataviz.append("g").style("font", "15px times").call(d3.axisLeft(yScale));

	// color palette
	var res = sumstat.map(function (d) {
		return d.key;
	}); // list of group names
	var color = d3
		.scaleOrdinal()
		.domain(res)
		.range(["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999"]);

	// Draw the line
	dataviz
		.selectAll(".line")
		.data(sumstat)
		.enter()
		.append("path")
		.attr("fill", "none")
		.attr("stroke", function (d) {
			return color(d.key);
		})
		.attr("stroke-width", 5)
		.attr("d", function (d) {
			return d3
				.line()
				.x(function (d) {
					return xScale(d.date);
				})
				.y(function (d) {
					return yScale(+d.new_cases);
				})(d.values);
		});
};

d3.csv("../notebooks/test.csv").then((data) => {
	data.forEach((d) => {
		d.DEU_new_cases = +d.DEU_new_cases;
		d.USA_new_cases = +d.USA_new_cases;
	});
	console.log(data);
	render(data);
});
