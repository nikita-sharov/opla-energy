(function () {
    "use strict";   

    const data = opla.generateData();

    const flowChart = opla.createChart(data)
        .marginLeft(40)
        .valueDomain([0, 3.6])
        .timeAxisTickFormat(null)
        .series("flow-in", d => d.flow.in)
        .series("flow-out", d => d.flow.out);

    d3.select(".column.flow")
        .call(flowChart);

    const yScale = flowChart.timeScale();

    const pressureChart = opla.createChart(data)
        .valueDomain([0, 30000])
        .series("spp", d => d.pressure.spp)
        .series("bhp", d => d.pressure.bhp)
        .series("sbp", d => d.pressure.sbp);

    d3.select(".column.pressure")
        .call(pressureChart);

    const mwChart = opla.createChart(data)
        .valueDomain([750, 1500])
        .series("mw-in", d => d.mw.in)
        .series("mw-out", d => d.mw.out);

    d3.select(".column.mw")
        .call(mwChart);

    const chokesChart = opla.createChart(data)
        .marginRight(8)
        .valueDomain([0, 100])
        .series("choke-a-current", d => d.chokes.a.current)
        .series("choke-a-set", d => d.chokes.a.set)
        .series("choke-b-current", d => d.chokes.b.current)
        .series("choke-b-set", d => d.chokes.b.set);

    d3.select(".column.chokes")
        .call(chokesChart);

    const charts = [flowChart, pressureChart, mwChart, chokesChart];

    d3.selectAll(".chart .mouse-target")
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    function mousemove() {
        const mouseY = d3.mouse(this)[1];

        let timestamp = yScale.invert(mouseY);
        timestamp.setMilliseconds(0);

        let index = data.findIndex(d => d.timestamp.getTime() === timestamp.getTime());
        const point = data[index];

        if (!point) {
            debugger;
        }

        charts.forEach(chart => chart.updateTooltip(point, mouseY));
    }

    function mouseleave() {
        const point = data[data.length - 1];
        charts.forEach(chart => chart.updateTooltip(point));
    }
}());