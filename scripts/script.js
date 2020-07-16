const Dummy_Data = [
	{ id: "d1", value: 10, region: "USA" },
	{ id: "d2", value: 5, region: "Germany" },
	{ id: "d3", value: 7, region: "China" },
];

const container = d3.select("svg").classed("container", true);

container
	.selectAll(".bar")
	.data(Dummy_Data)
	.enter()
	.append("rect")
	.classed("bar", true)
	.attr("width", 50)
	.attr("height", (data) => data.value * 15);
