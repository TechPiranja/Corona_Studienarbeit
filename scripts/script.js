const covidStart = new Date("2019-12-31");
var dateMax = new Date();
var originalDiffDays = 0;
var diffDays = 0;
var isPlaying = false;
var interval;
var playStopElement = document.getElementById("playStop");
var selectedData = "new_cases";

window.onload = function setTimeSlider() {
	let today = new Date();
	today = today.getMonth() + 1 + "-" + today.getDate() + "-" + today.getFullYear();
	diffDays = date_diff_indays("2019-12-31", today);
	originalDiffDays = diffDays;
	document.getElementById("timeSlider").max = diffDays;
	document.getElementById("timeSlider").value = diffDays;
	dateMax = new Date(covidStart.getTime() + parseInt(diffDays) * 86400000);

	document.getElementById("todaysDate").innerHTML = today;
};

function changeData(selectedObject) {
	selectedData = selectedObject.value;
	reRenderCharts();
}

function addDays(date, days) {
	const copy = new Date(Number(date));
	copy.setDate(date.getDate() + days);
	return copy;
}

function playStopDateAnimation() {
	if (!togglePlayStopIcon()) return;

	currentVal = document.getElementById("timeSlider").value;
	let i = currentVal < originalDiffDays ? currentVal : 1;
	interval = setInterval(function () {
		if (i <= originalDiffDays) {
			document.getElementById("timeSlider").value = i;
			changeTimeEnd(i);
			i++;
		}
		if (i == originalDiffDays) clearInterval();
	}, 80);
}

function togglePlayStopIcon(defaultState = false) {
	if (isPlaying || defaultState) {
		playStopElement.classList.remove("fa-pause");
		playStopElement.classList.add("fa-play");
		isPlaying = false;
		clearInterval(interval);
		return false;
	} else {
		playStopElement.classList.remove("fa-play");
		playStopElement.classList.add("fa-pause");
		isPlaying = true;
	}
	return true;
}

var date_diff_indays = function (date1, date2) {
	dt1 = new Date(date1);
	dt2 = new Date(date2);
	return Math.floor(
		(Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
			Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
			(1000 * 60 * 60 * 24)
	);
};

function changeTimeEnd(val) {
	// neues Enddatum berechnen
	dateMax = new Date(covidStart.getTime() + parseInt(val) * 86400000);
	// ändern des diffDays, da die x-Achse damit skaliert
	diffDays = date_diff_indays("2019-12-31", dateMax);
	reRenderCharts();
}

function reRenderCharts() {
	// löschen der alten Diagramme
	document.getElementById("simpleBarChart").innerHTML = "";
	document.getElementById("dataviz").innerHTML = "";
	document.getElementById("dataviz2").innerHTML = "";
	// new rendern der neuen Diagramme
	renderBarChart(
		csv_data1.filter(function (d) {
			return new Date(d.date) <= dateMax;
		})
	);
	render(
		csv_data1.filter(function (d) {
			return new Date(d.date) <= dateMax;
		}),
		"#dataviz"
	);
	render(
		csv_data2.filter(function (d) {
			return new Date(d.date) <= dateMax;
		}),
		"#dataviz2"
	);
}

function triggerChangeTimeEnd(val) {
	togglePlayStopIcon(true);
	changeTimeEnd(val);
}

const container = d3.select("#simpleBarChart").classed("container", true);
const width = parseInt(container.style("width"));
const height = parseInt(container.style("height"));
const margin = { top: 10, right: 40, bottom: 40, left: 60 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

function renderBarChart(data) {
	var xValue = (d) => d.date;
	var yValue = (d) => d.Country == "DEU" && d[selectedData];
	var xScale = d3.scaleBand().domain(data.map(xValue)).range([0, innerWidth]).padding(0.1);
	var yScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, yValue)])
		.range([innerHeight, 0]);
	const g = container.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
	g.append("g").attr("class", "axis").style("font", "14px times").call(d3.axisLeft(yScale));
	g.append("g")
		.attr("class", "axis")
		.style("font", "14px times")
		.attr("transform", `translate(0, ${innerHeight})`)
		.call(
			d3.axisBottom(xScale).tickValues(xScale.domain().filter((d, i) => i % d3.format(".1")(diffDays / 9) === 0))
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
}

const render = (data, datavizId) => {
	var xValue = (d) => d.date;
	var yValue = (d) => d[selectedData];
	var xScale = d3.scaleBand().domain(data.map(xValue)).range([0, innerWidth]).padding(0.1);
	var yScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, yValue)])
		.range([innerHeight, 0]);
	//------------ second visualization ------------
	yValue = (d) => d[selectedData];
	yScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, yValue)])
		.range([innerHeight, 0]);

	const dataviz = d3
		.select(datavizId)
		.append("svg")
		.classed("container", true)
		.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	// group the data: I want to draw one line per group
	var sumstat = d3
		.nest() // nest function allows to group the calculation per level of a factor
		.key(function (d) {
			return d.Country;
		})
		.entries(data);
	dataviz
		.append("g")
		.style("font", "14px times")
		.attr("class", "axis")
		.attr("transform", `translate(0, ${innerHeight})`)
		.call(
			d3.axisBottom(xScale).tickValues(xScale.domain().filter((d, i) => i % d3.format(".1")(diffDays / 9) === 0))
		);

	dataviz.append("g").attr("class", "axis").style("font", "14px times").call(d3.axisLeft(yScale));

	// color palette
	var res = sumstat.map(function (d) {
		return d.key;
	}); // list of group names
	var colorScale = d3
		.scaleOrdinal()
		.domain(res)
		.range([
			"#ef5350",
			"#ec407a",
			"#ab47bc",
			"#7e57c2",
			"#5c6bc0",
			"#42a5f5",
			"#29b6f6",
			"#26c6da",
			"#26a69a",
			"#66bb6a",
			"#9ccc65",
			"#d4e157",
			"#ffee58",
			"#ffca28",
			"#ffa726",
			"#ff7043",
			"#8d6e63",
			"#78909c",
		]);

	// Draw the line
	dataviz
		.selectAll(".line")
		.data(sumstat)
		.enter()
		.append("path")
		.attr("fill", "none")
		.attr("stroke", function (d) {
			return colorScale(d.key);
		})
		.attr("stroke-width", 1)
		.attr("d", function (d) {
			return d3
				.line()
				.x(function (d) {
					return xScale(d.date);
				})
				.y(function (d) {
					return yScale(d[selectedData]);
				})(d.values);
		});

	dataviz.append("g").attr("transform", `translate(20,10)`).call(colorLegend, {
		colorScale,
		circleRadius: 5,
		spacing: 15,
		textOffset: 20,
	});
};

var csv_data1 = {};
var csv_data2 = {};
d3.csv("../notebooks/europe.csv").then((data) => {
	data.forEach((d) => {
		d.new_cases = +d.new_cases;
		d.new_deaths = +d.new_deaths;
	});
	csv_data1 = data;
	renderBarChart(data);
	render(data, "#dataviz");
});

d3.csv("../notebooks/asia.csv").then((data) => {
	data.forEach((d) => {
		d.new_cases = +d.new_cases;
		d.new_deaths = +d.new_deaths;
	});
	csv_data2 = data;
	render(data, "#dataviz2");
});

const colorLegend = (selection, props) => {
	const { colorScale, circleRadius, spacing, textOffset } = props;

	const groups = selection.selectAll("g").data(colorScale.domain());
	const groupsEnter = groups.enter().append("g").attr("class", "tick");
	groupsEnter.merge(groups).attr("transform", (d, i) => `translate(0, ${i * spacing})`);
	groups.exit().remove();

	groupsEnter.append("circle").merge(groups.select("circle")).attr("r", circleRadius).attr("fill", colorScale);

	groupsEnter
		.append("text")
		.style("fill", "rgb(198, 198, 198)")
		.merge(groups.select("text"))
		.text((d) => d)
		.attr("dy", "0.32em")
		.attr("x", textOffset);
};
