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