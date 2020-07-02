(function () {
    "use strict";

    function createBarChart() {
        let xScale = d3.scaleLinear();
        let centerX = 0;

        let colorScale = d3.scaleLinear()
            ////.range(["lightblue", "palevioletred"]);
            .range(["#81bcda", "#e6887c"]);
        

        let unit = "lit";
        let bar = null;
        let centralValue = 0;        
        let textValue = null;
        let textUnit = null;

        let negativeValueSelection = d3.select(null);
        let positiveValueSelection = d3.select(null);

        let negativeValueUnitSelection = d3.select(null);        
        let positiveValueUnitSelection = d3.select(null);

        function chart(selection) {
            const width = selection.node().clientWidth;
            const height = selection.node().clientHeight;

            const svg = selection.insert("svg", ".bar-chart-indicator-row.values")
                .attr("width", width)
                .attr("height", height);

            xScale.rangeRound([0, width]);
            centerX = xScale(0);

            svg.append("line")
                .attr("x1", centerX)
                .attr("x2", centerX)
                .attr("y2", height)
                .attr("stroke", "#989898");

            colorScale.domain([0, width]);

            const barHeight = height / 2;

            bar = svg.append("rect")
                .attr("height", barHeight);

            negativeValueSelection = selection.select(".values .negative-value");
            positiveValueSelection = selection.select(".values .positive-value");

            negativeValueUnitSelection = selection.select(".unit .negative-value");
            positiveValueUnitSelection = selection.select(".unit .positive-value");
        }

        chart.valueDomain = function (value) {
            xScale.domain(value);
            return chart;
        };

        chart.centralValue = function (value) {
            centralValue = value;
            return chart;
        };

        chart.unit = function (value) {
            unit = value;
            return chart;
        };

        chart.update = function (value) {
            const currentX = xScale(value);

            const barX = value < 0 ? currentX : centerX;

            const barWidth = Math.abs(currentX - centerX);
            const fill = value < 0 ? colorScale(barX) : colorScale(barX + barWidth);

            bar.attr("x", barX)
                .attr("width", barWidth)
                .attr("fill", fill);

            const valueText = Number.isInteger(value) ? value.toFixed() : value.toFixed(1);

            if (value >= 0) {
                negativeValueSelection.text("");
                negativeValueUnitSelection.text("");

                positiveValueSelection.text(valueText);
                positiveValueUnitSelection.text(unit);
            } else {
                negativeValueSelection.text(valueText);
                negativeValueUnitSelection.text(unit);

                positiveValueSelection.text("");
                positiveValueUnitSelection.text("");
            }
        };

        return chart;
    }

    const fluidBarChart = createBarChart()
        .valueDomain([-3600, 3600])
        .centralValue(0)
        .unit("lit");

    d3.select("#fluid-bar-chart")
        .call(fluidBarChart);

    const sbpBarChart = createBarChart()
        .valueDomain([-1000, 4000])
        .centralValue(1000)
        .unit("kPa");

    d3.select("#sbp-bar-chart")
        .call(sbpBarChart);

    const mwBarChart = createBarChart()
        .valueDomain([-750, 750])
        .centralValue(0)
        .unit("kg/m³");

    d3.select("#mw-bar-chart")
        .call(mwBarChart);

    opla.updateBarCharts = function (point) {
        let value = (point.flow.out - point.flow.in) * 1000;
        fluidBarChart.update(value);

        value = point.pressure.sbp - 1000;
        sbpBarChart.update(value);

        value = point.mw.out - point.mw.in;
        mwBarChart.update(value);
    };
}());
(function () {
    "use strict";   

    const data = opla.generateData();
    const recent = data[data.length - 1];

    updateDate(recent);
    updateValues(recent);

    let rowHeight = d3.select(".row#line-charts").node().clientHeight - 11;

    let yScale = d3.scaleTime()
        .domain([data[2].timestamp, data[data.length - 3].timestamp])
        .range([0, rowHeight]);

    const timeAxis = opla.createTimeAxis(data)
        .timeScale(yScale)
        .containerHeight(rowHeight);

    d3.select("#timestamps")
        .call(timeAxis);

    const flowChart = opla.createChart(data)
        .valueDomain([0, 3.6])
        .timeScale(yScale)
        .series("flow-in", d => d.flow.in)
        .series("flow-out", d => d.flow.out)
        .clipPathId("flow-clip-path")
        .containerHeight(rowHeight);

    d3.select("#flow-chart")
        .call(flowChart);

    const pressureChart = opla.createChart(data)
        .valueDomain([0, 30000])
        .timeScale(yScale)
        .series("spp", d => d.pressure.spp)
        .series("bhp", d => d.pressure.bhp)
        .series("sbp", d => d.pressure.sbp)
        .clipPathId("pressure-clip-path")
        .containerHeight(rowHeight);

    d3.select("#pressure-chart")
        .call(pressureChart);

    const mwChart = opla.createChart(data)
        .valueDomain([750, 1500])
        .timeScale(yScale)
        .series("mw-in", d => d.mw.in)
        .series("mw-out", d => d.mw.out)
        .clipPathId("mw-clip-path")
        .containerHeight(rowHeight);

    d3.select("#density-chart")
        .call(mwChart);

    const chokesChart = opla.createChart(data)
        ////.marginRight(4)
        .valueDomain([0, 100])
        .timeScale(yScale)
        .series("choke-a-current", d => d.chokes.a.current)
        .series("choke-a-set", d => d.chokes.a.set)
        .series("choke-b-current", d => d.chokes.b.current)
        .series("choke-b-set", d => d.chokes.b.set)
        .clipPathId("chokes-clip-path")
        .containerHeight(rowHeight);

    d3.select("#chokes-chart")
        .call(chokesChart);

    const charts = [flowChart, pressureChart, mwChart, chokesChart];

    function updateValues(point) {
        d3.selectAll(".flow-in-value").text(point.flow.in);
        d3.selectAll(".flow-out-value").text(point.flow.out);
        d3.selectAll(".pressure-spp-value").text(point.pressure.spp);
        d3.selectAll(".pressure-bhp-value").text(point.pressure.bhp);
        d3.selectAll(".pressure-sbp-value").text(point.pressure.sbp);
        d3.selectAll(".mw-in-value").text(point.mw.in);
        d3.selectAll(".mw-out-value").text(point.mw.out);
        d3.selectAll(".chokes-a-current-value").text(point.chokes.a.current);
        d3.selectAll(".chokes-a-set-value").text(point.chokes.b.set);
        d3.selectAll(".chokes-b-current-value").text(point.chokes.b.current);
        d3.selectAll(".chokes-b-set-value").text(point.chokes.b.set);
    }

    function updateDate(point) {
        const format = d3.timeFormat("%Y-%m-%d");
        const dateValue = format(point.timestamp);
        d3.selectAll(".date-value").text(dateValue);
    }

    (function update() {
        // update the domain
        yScale.domain([data[3].timestamp, data[data.length - 2].timestamp]);

        const now = moment(data[data.length - 1].timestamp)
            .add(1, "seconds")
            .toDate();

        const point = opla.generateDataPoint(now);

        // Push the new data point onto the back.
        data.push(point);

        timeAxis.tick();

        charts.forEach((chart) => {
            chart.updateTooltip(point);
            chart.tick();
        });

        updateValues(point);
        opla.updateBarCharts(point);

        // Pop the old data point off the front.
        data.shift();

        setTimeout(update, 1000);
    })();     
}());