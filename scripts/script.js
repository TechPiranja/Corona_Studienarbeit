const Dummy_Data = [
	{ id: "d1", value: 10, region: "USA" },
	{ id: "d2", value: 5, region: "Germany" },
	{ id: "d3", value: 7, region: "China" },
];

const container = d3.select("svg").classed("container", true);

const render = (data) => {
	const xScale = d3
		.scaleBand()
		.domain(data.map((d) => d.date))
		.range([0, 250])
		.padding(0.1);
	const yScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.new_cases)])
		.range([250, 0]);
	container
		.selectAll(".bar")
		.data(data)
		.enter()
		.append("rect")
		.classed("bar", true)
		.attr("width", xScale.bandwidth())
		.attr("height", (d) => 250 - yScale(d.new_cases))
		.attr("x", (d) => xScale(d.date))
		.attr("y", (d) => yScale(d.new_cases));
};

d3.csv("../test.csv").then((data) => {
	data.forEach((d) => {
		d.new_cases = +d.new_cases;
		d.total_cases = +d.total_cases;
	});
	render(data);
	console.log(data);
});
