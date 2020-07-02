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