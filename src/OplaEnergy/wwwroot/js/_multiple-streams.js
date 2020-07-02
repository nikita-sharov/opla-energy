(function () {
    "use strict";   

    const data = opla.generateData();

    let rowHeight = d3.select(".row").node().clientHeight;

    let yScale = d3.scaleTime()
        .domain([data[2].timestamp, data[data.length - 3].timestamp])
        .range([0, rowHeight]);

    const timeAxis = opla.createTimeAxis(data)
        .timeScale(yScale);

    d3.select(".column.time")
        .call(timeAxis);

    const flowChart = opla.createChart(data)
        .valueDomain([0, 3.6])
        .timeScale(yScale)
        .series("flow-in", d => d.flow.in)
        .series("flow-out", d => d.flow.out)
        .clipPathId("flow-clip-path");

    d3.select(".column.flow")
        .call(flowChart);

    const pressureChart = opla.createChart(data)
        .valueDomain([0, 30000])
        .timeScale(yScale)
        .series("spp", d => d.pressure.spp)
        .series("bhp", d => d.pressure.bhp)
        .series("sbp", d => d.pressure.sbp)
        .clipPathId("pressure-clip-path");

    d3.select(".column.pressure")
        .call(pressureChart);

    const mwChart = opla.createChart(data)
        .valueDomain([750, 1500])
        .timeScale(yScale)
        .series("mw-in", d => d.mw.in)
        .series("mw-out", d => d.mw.out)
        .clipPathId("mw-clip-path");

    d3.select(".column.mw")
        .call(mwChart);

    const chokesChart = opla.createChart(data)
        .marginRight(8)
        .valueDomain([0, 100])
        .timeScale(yScale)
        .series("choke-a-current", d => d.chokes.a.current)
        .series("choke-a-set", d => d.chokes.a.set)
        .series("choke-b-current", d => d.chokes.b.current)
        .series("choke-b-set", d => d.chokes.b.set)
        .clipPathId("chokes-clip-path");

    d3.select(".column.chokes")
        .call(chokesChart);

    const charts = [flowChart, pressureChart, mwChart, chokesChart];

    ////d3.selectAll(".chart .mouse-target")
    ////    .on("mousemove", mousemove)
    ////    .on("mouseleave", mouseleave);

    function mousemove() {
        const mouseY = d3.mouse(this)[1];

        let timestamp = yScale.invert(mouseY);
        timestamp.setMilliseconds(0);

        let index = data.findIndex(d => d.timestamp.getTime() === timestamp.getTime());
        const point = data[index];

        charts.forEach(chart => chart.updateTooltip(point, mouseY));
    }

    function mouseleave() {
        const point = data[data.length - 1];
        charts.forEach(chart => chart.updateTooltip(point));
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

        // Pop the old data point off the front.
        data.shift();

        setTimeout(update, 1000);
    })();     
}());