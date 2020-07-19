const covidStart = new Date("2019-12-31");
var dateMax = new Date();
var originalDiffDays = 0;
var diffDays = 0;
var isPlaying = false;
var interval;
var playStopElement = document.getElementById("playStop");

window.onload = function setTimeSlider() {
	let today = new Date();
	today = today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear();
	diffDays = date_diff_indays("2019-12-31", today);
	originalDiffDays = diffDays;
	document.getElementById("timeSlider").max = diffDays;
	document.getElementById("timeSlider").value = diffDays;
	dateMax = new Date(covidStart.getTime() + parseInt(diffDays) * 86400000);
};

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
	dateMax = new Date(covidStart.getTime() + parseInt(val) * 86400000);
	diffDays = date_diff_indays("2019-12-31", dateMax);
	document.getElementById("simpleBarChart").innerHTML = "";
	document.getElementById("dataviz").innerHTML = "";

	let temp = csv_data;
	temp = temp.filter(function (d) {
		return new Date(d.date) < dateMax;
	});
	render(temp);
}

function triggerChangeTimeEnd(val) {
	togglePlayStopIcon(true);
	changeTimeEnd(val);
}

const container = d3.select("#simpleBarChart").classed("container", true);

const render = (data) => {
	const width = parseInt(container.style("width"));
	const height = parseInt(container.style("height"));
	var xValue = (d) => d.date;
	var yValue = (d) => d.Country == "DEU" && d.new_cases;
	const margin = { top: 10, right: 40, bottom: 40, left: 60 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	var xScale = d3.scaleBand().domain(data.map(xValue)).range([0, innerWidth]).padding(0.1);
	var yScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, yValue)])
		.range([innerHeight, 0]);
	const g = container.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

	g.append("g").attr("class", "axis").style("font", "15px times").call(d3.axisLeft(yScale));
	g.append("g")
		.attr("class", "axis")
		.style("font", "15px times")
		.attr("transform", `translate(0, ${innerHeight})`)
		.call(
			d3
				.axisBottom(xScale)
				.tickValues(
					xScale.domain().filter((d, i) => i % d3.format(".1")(diffDays / 4) === 0 || i == diffDays - 1)
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
	yValue = (d) => d.new_cases;
	yScale = d3
		.scaleLinear()
		.domain([0, d3.max(data, yValue)])
		.range([innerHeight, 0]);

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
			return d.Country;
		})
		.entries(data);
	dataviz
		.append("g")
		.style("font", "15px times")
		.attr("class", "axis")
		.attr("transform", `translate(0, ${innerHeight})`)
		.call(
			d3
				.axisBottom(xScale)
				.tickValues(
					xScale.domain().filter((d, i) => i % d3.format(".1")(diffDays / 4) === 0 || i == diffDays - 1)
				)
		);

	dataviz.append("g").attr("class", "axis").style("font", "15px times").call(d3.axisLeft(yScale));

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
		.attr("stroke-width", 1)
		.attr("d", function (d) {
			return d3
				.line()
				.x(function (d) {
					return xScale(d.date);
				})
				.y(function (d) {
					return yScale(d.new_cases);
				})(d.values);
		});
};

var csv_data = {};
d3.csv("../notebooks/test.csv").then((data) => {
	data.forEach((d) => {
		d.new_cases = +d.new_cases;
	});
	csv_data = data;
	render(data);
});
