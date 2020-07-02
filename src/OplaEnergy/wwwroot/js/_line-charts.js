(function () {
    "use strict";

    const VISIBLE_POINT_COUNT = 34;
    const TOTAL_POINT_COUNT = 5100;

    let options = [
        {
            containerSelector: "#flow-chart",
            legend: [
                {
                    id: "flow-in",
                    name: "Flow In",
                    min: 0,
                    current: 1.821,
                    variance: 1,
                    max: 3.6,
                    color: "#a3c15d"
                }, {
                    id: "flow-out",
                    name: "Flow Out",
                    min: 0,
                    current: 0,
                    variance: 0,
                    max: 3.6,
                    color: "#da9e46"
                }
            ]
        }, {
            containerSelector: "#pressure-chart",
            legend: [
                {
                    id: "sbp",
                    name: "SPP",
                    min: 0,
                    current: 8000,
                    variance: 0,
                    max: 10000,
                    color: "#4a7595"
                }, {
                    id: "bhp",
                    name: "BHP",
                    min: 0,
                    current: 107.6,
                    variance: 0,
                    max: 30000,
                    color: "#7a0c15"
                }, {
                    id: "sbp",
                    name: "SBP",
                    min: 0,
                    current: 101.3,
                    variance: 0,
                    max: 5000,
                    color: "#402353"
                }
            ]
        }, {
            containerSelector: "#density-chart",
            legend: [
                {
                    id: "mw-in",
                    name: "MW In",
                    min: 750,
                    current: 1100,
                    variance: 0,
                    max: 1500,
                    color: "#a5c05f"
                }, {
                    id: "mw-out",
                    name: "MW Out",
                    min: 750,
                    current: 1000,
                    variance: 0,
                    max: 1500,
                    color: "#da9e46"
                }
            ]
        }, {
            containerSelector: "#chokes-chart",
            legend: [
                {
                    id: "choke-a-current",
                    name: "Choke A Current",
                    min: 0,
                    current: 23,
                    variance: 0,
                    max: 100,
                    color: "#0e4e8b"
                }, {
                    id: "choke-a-set",
                    name: "Choke A Set",
                    min: 0,
                    current: 25,
                    variance: 0,
                    max: 100,
                    color: "#1bb7a2"
                }, {
                    id: "choke-b-current",
                    name: "Choke B Current",
                    min: 0,
                    current: 78,
                    variance: 0,
                    max: 100,
                    color: "#a54ab3"
                }, {
                    id: "choke-b-set",
                    name: "Choke B Set",
                    min: 0,
                    current: 75,
                    variance: 0,
                    max: 100,
                    color: "#d487cd"
                }
            ]
        }
    ];

    function prepareData(timestamps, legend) {
        return {
            timestamps: timestamps,
            series: getSeries(timestamps, legend),
            min: getMin(legend),
            max: getMax(legend)
        };
    }

    function getTimestamps(count) {
        const result = [];
        const samplingRate = "seconds";
        const start = moment()
            .milliseconds(0)
            .subtract(count, samplingRate);

        for (let seconds = 0; seconds < count; seconds++) {
            const timestamp = moment(start).add(seconds, samplingRate).toDate();
            result.push(timestamp);
        }

        return result;
    }

    function getSeries(timestamps, legend) {
        const result = [];

        for (const entry of legend) {
            const serie = {
                id: entry.id,
                color: entry.color,
                points: getPoints(timestamps, entry.min, entry.current, entry.variance, entry.max)
            };

            result.push(serie);
        }

        return result;
    }

    function getPoints(timestamps, min, current, variance, max) {
        const result = [];

        for (let i = 0; i < timestamps.length; i++) {
            const point = {
                timestamp: timestamps[i],
                value: current
            };

            if ((variance !== 0) && (i !== (timestamps.length - 1))) {
                point.value = getRandom(min, max);
            }

            result.push(point);
        }

        return result;
    }

    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getMin(legend) {
        const settings = legend.map(e => e.min);
        return d3.min(settings);
    }

    function getMax(legend) {
        const settings = legend.map(e => e.max);
        return d3.max(settings);
    }

    function drawTimestamps(containerSelector, timestamps) {
        const container = document.querySelector(containerSelector);

        // Dimensions.
        const margin = { top: 10, right: 0, bottom: 10, left: container.clientWidth };
        const width = container.clientWidth - margin.right - margin.left;
        const height = 600 - margin.top - margin.bottom;

        // Draw base.
        const svg = d3
            .select(containerSelector)
            .append('svg')
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Scale data.
        const yScale = createVerticalScale(timestamps, height);

        // Draw y axis.
        const yAxis = d3
            .axisLeft(yScale)
            .ticks(VISIBLE_POINT_COUNT)
            .tickFormat(formatTimestamp)
            .tickSizeOuter(0)
            .tickSizeInner(0);

        const yAxisDraw = svg
            .append('g')
            .attr('class', 'y axis')
            .call(yAxis);
    }

    function drawLineChart(containerSelector, data) {
        const container = document.querySelector(containerSelector);

        // Dimensions.
        const margin = { top: 10, right: 0, bottom: 10, left: 0 };
        const width = container.clientWidth - margin.right - margin.left;
        const height = 600 - margin.top - margin.bottom;        

        // Draw base.
        const svg = d3
            .select(containerSelector)
            .append('svg')
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Scale data.
        const xScale = createHorizontalScale(data.min, data.max, width);
        const yScale = createVerticalScale(data.timestamps, height);

        // Draw x axis.
        const xAxis = d3
            .axisBottom(xScale)
            .tickFormat("")
            .tickSize(-height);

        const xAxisDraw = svg
            .append('g')
            .attr('transform', `translate(0, ${height})`)
            .attr('class', 'x axis')
            .call(xAxis);

        // Draw y axis.
        const yAxis = d3
            .axisLeft(yScale)
            .ticks(VISIBLE_POINT_COUNT)
            .tickFormat("")
            .tickSizeOuter(0)
            .tickSizeInner(-width);

        const yAxisDraw = svg
            .append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        // Group chart elements.
        const chartGroup = svg.append('g').attr('class', 'line-chart');

        // Draw lines.
        const lineGenerator = d3
            .line()
            .x(point => xScale(point.value))
            .y(point => yScale(point.timestamp));

        const durationInMilliseconds = 1000;

        chartGroup
            .selectAll('.line-series')
            .data(data.series)
            .enter()
            .append('path')
            .attr('class', "line-series")
            .attr('id', serie => serie.id)
            .attr('d', serie => lineGenerator(serie.points))
            .style('fill', 'none')
            .style('stroke', serie => serie.color)
            .style("stroke-width", 2);
            ////.transition()
            ////.duration(1000)
            ////.ease(d3.easeLinear)
            ////.on("start", tick);

        function tick() {
            // update the domain
            now = new Date();
            yScale.domain([now - (n - 2) * durationInMilliseconds, now - durationInMilliseconds]);

            // Push a new data point onto the back.
            data.push(random());

            // Redraw the line.
            d3.select(this)
                .attr("d", line)
                .attr("transform", null);

            // slide the y-axis to the top
            yAxisDraw.transition()
                .duration(durationInMilliseconds)
                .ease(d3.easeLinear)
                .call(yAxis.scale(yScale));

            // Slide it to the top.
            d3.active(this)
                .attr("transform", "translate(0," + y(now - (n - 1) * durationInMilliseconds) + ")")
                .transition()
                .on("start", tick);

            // Pop the old data point off the front.
            data.shift();
        }
    }

    function createVerticalScale(timestamps, height) {
        const extent = d3.extent(timestamps);
        return d3
            .scaleLinear()
            .domain(extent)
            .range([0, height]);
    }

    function createHorizontalScale(min, max, width) {
        return d3
            .scaleLinear()
            .domain([min, max])
            .range([0, width]);
    }

    function formatTimestamp(d) {
        return moment(d).format("LTS");
    }

    const timestamps = getTimestamps(VISIBLE_POINT_COUNT);
    drawTimestamps("#timestamps", timestamps);

    for (const chart of options) {
        const data = prepareData(timestamps, chart.legend);
        drawLineChart(chart.containerSelector, data);
    }
}());