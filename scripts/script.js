const container = d3.select("svg").classed("container", true);

const render = (data) => {
	const width = parseInt(container.style("width"));
	const height = parseInt(container.style("height"));
	const xValue = (d) => d.date;
	const yValue = (d) => d.new_cases;
	const margin = { top: 20, right: 20, bottom: 20, left: 30 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	const xScale = d3.scaleBand().domain(data.map(xValue)).range([0, innerWidth]).padding(0.2);
	const yScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, yValue)])
		.range([innerHeight, 0]);
	const g = container.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

	g.append("g").style("font", "5px times").call(d3.axisLeft(yScale));
	g.append("g")
		.style("font", "5px times")
		.attr("transform", `translate(0, ${innerHeight})`)
		.call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((d, i) => i % 30 === 0)));

	g.selectAll(".bar")
		.data(data)
		.enter()
		.append("rect")
		.classed("bar", true)
		.attr("width", xScale.bandwidth())
		.attr("height", (d) => innerHeight - yScale(yValue(d)))
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
