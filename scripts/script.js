const Dummy_Data = [
	{ id: "d1", value: 10, region: "USA" },
	{ id: "d2", value: 5, region: "Germany" },
	{ id: "d3", value: 7, region: "China" },
];

const container = d3.select("svg").classed("container", true);

const render = (data) => {
	const xValue = (d) => d.date;
	const yValue = (d) => d.new_cases;

	const xScale = d3.scaleBand().domain(data.map(xValue)).range([0, 250]).padding(0.1);
	const yScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, yValue)])
		.range([250, 0]);
	container
		.selectAll(".bar")
		.data(data)
		.enter()
		.append("rect")
		.classed("bar", true)
		.attr("width", xScale.bandwidth())
		.attr("height", (d) => 250 - yScale(yValue(d)))
		.attr("x", (d) => xScale(xValue(d)))
		.attr("y", (d) => yScale(yValue(d)));
};

d3.csv("../test.csv").then((data) => {
	data.forEach((d) => {
		d.new_cases = +d.new_cases;
		d.total_cases = +d.total_cases;
	});
	render(data);
	console.log(data);
});
