(function () {
    "use strict";

    if (opla === undefined) {
        window.opla = {};
    }

    opla.createTimeScale = function (data) {
        const extent = d3.extent(data, d => d.timestamp);
        return d3.scaleTime()
            .domain(extent);
    };

    opla.createChart = function (data) {
        let margin = { top: 0, right: 1, bottom: 1, left: 0 };

        let xScale = d3.scaleLinear();
        let yScale = null;

        let xAxis = d3.axisTop(xScale)
            .tickSizeOuter(0)
            .tickFormat("");

        let yAxis = d3.axisLeft(yScale)
            .ticks(32)
            .tickSizeOuter(0)
            .tickFormat("");

        let yAxisContainer = d3.select(null);

        let series = [];
        let seriesContainer = d3.select(null);
        let lines = [];

        let tooltip = null;
        let clipPathId = "clip-path";

        let containerHeight = 0;

        function chart(container) {
            const containerWidth = container.node().clientWidth;

            if (!containerHeight) {
                containerHeight = container.node().clientHeight;
            }

            const svg = container.append("svg")
                .attr("class", "chart")
                .attr("width", containerWidth)
                .attr("height", containerHeight);

            const canvas = svg.append("g")
                .attr("class", "canvas")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const canvasWidth = containerWidth - margin.left - margin.right;
            const canvasHeight = containerHeight - margin.top - margin.bottom;

            canvas.append("defs")
                .append("clipPath")
                .attr("id", clipPathId)
                .append("rect")
                .attr("width", canvasWidth)
                .attr("height", canvasHeight);

            xScale.range([0, canvasWidth]);
            yScale.range([0, canvasHeight]);

            xAxis.tickSizeInner(-canvasHeight);
            yAxis.tickSizeInner(-canvasWidth);

            canvas.append("g")
                .attr("class", "x-axis")
                .call(xAxis);

            yAxisContainer = canvas.append("g")
                .attr("class", "y-axis")
                .attr("clip-path", `url(#${clipPathId})`)
                .call(yAxis);

            // adding 0.5 to get the stroke width of 1
            canvas.append("path")
                .attr("class", "border")
                .attr("d", `M0.5,0.5H${canvasWidth + 0.5}V${canvasHeight + 0.5}H0.5V0.5`);

            seriesContainer = canvas.append("g")
                .attr("clip-path", `url(#${clipPathId})`)
                .append("g")
                .attr("class", "series");

            for (const element of series) {
                const generator = d3.line()
                    .x(d => xScale(element.accessor(d)))
                    .y(d => yScale(d.timestamp));

                const path = seriesContainer.append("path")
                    .attr("class", element.name)
                    .attr("d", generator(data));

                lines.push({ path, generator });
            }

            canvas.append("rect")
                .attr("class", "mouse-target")
                .attr("width", canvasWidth)
                .attr("height", canvasHeight);

            tooltip = opla.createTooltip(canvas)
                .width(canvasWidth)
                .height(canvasHeight);

            tooltip(series, data[data.length - 1]);
        }

        chart.marginRight = function (value) {
            if (!arguments.length) {
                return margin.right;
            }

            margin.right = value;
            return chart;
        };

        chart.valueDomain = function (value) {
            if (!arguments.length) {
                return xScale.domain();
            }

            xScale.domain(value);
            return chart;
        };

        chart.timeScale = function (value) {
            if (!arguments.length) {
                return yScale;
            }

            yScale = value;
            yAxis.scale(yScale);
            return chart;
        };

        chart.series = function (name, accessor) {
            if (!arguments.length) {
                return series;
            }

            series.push({ name, accessor });
            return chart;
        };

        chart.mouseTarget = function () {
            return mouseTarget;
        };

        chart.updateTooltip = function (point, mouseY) {
            tooltip(series, point, mouseY);
        };

        chart.tick = function () {
            seriesContainer.interrupt();
            seriesContainer.attr("transform", null);            

            // redraw the lines
            for (const line of lines) {
                line.path.attr("d", line.generator(data));
            }

            seriesContainer.transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .attr("transform", "translate(0," + yScale(data[2].timestamp) + ")");

            // slide the yScale-axis to the top
            yAxisContainer.transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .call(yAxis.scale(yScale));
        };

        chart.redraw = function () {
            // redraw the lines
            for (const line of lines) {
                line.path.attr("d", line.generator(data));
            }

            // redraw the y-axis
            yAxisContainer.call(yAxis.scale(yScale));
        };

        chart.clipPathId = function (value) {
            if (!arguments.length) {
                return clipPathId;
            }

            clipPathId = value;
            return chart;
        };

        chart.containerHeight = function (value) {
            if (!arguments.length) {
                return containerHeight;
            }

            containerHeight = value;
            return chart;
        };

        return chart;
    };
}());