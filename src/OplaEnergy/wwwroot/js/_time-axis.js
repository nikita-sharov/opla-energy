(function () {
    "use strict";

    if (opla === undefined) {
        window.opla = {};
    }

    opla.createTimeAxis = function (data) {
        let margin = { top: 0, right: 4, bottom: 1, left: 0 };

        let yScale = null;

        let yAxis = d3.axisLeft(yScale)
            .ticks(data.length - 1)
            .tickSizeInner(0)
            .tickSizeOuter(0);

        let yAxisContainer = d3.select(null);

        let containerHeight = 0;

        function axis(container) {
            const containerWidth = container.node().clientWidth;

            if (!containerHeight) {
                containerHeight = container.node().clientHeight;
            }

            const svg = container.append("svg")
                .attr("class", "time-axis")
                .attr("width", containerWidth)
                .attr("height", containerHeight);

            const canvas = svg.append("g")
                .attr("class", "canvas")
                .attr("transform", `translate(${containerWidth},${margin.top})`);

            const canvasWidth = containerWidth - margin.left - margin.right;
            const canvasHeight = containerHeight - margin.top - margin.bottom;

            const defs = canvas.append("defs");

            defs.append("clipPath")
                .attr("id", "time-axis-clip")
                .append("rect")
                .attr("width", containerWidth)
                .attr("height", canvasHeight)
                .attr("transform", `translate(${-containerWidth})`);

            yScale.range([0, canvasHeight]);

            yAxisContainer = canvas.append("g")
                .attr("class", "y-axis")
                .attr("clip-path", "url(#time-axis-clip)")
                .call(yAxis);
        }

        axis.timeScale = function (value) {
            if (!arguments.length) {
                return yScale;
            }

            yScale = value;
            yAxis.scale(yScale);
            return axis;
        };

        axis.tick = function () {
            // slide the yScale-axis to the top
            yAxisContainer.transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .call(yAxis.scale(yScale));
        };

        axis.containerHeight = function (value) {
            if (!arguments.length) {
                return containerHeight;
            }

            containerHeight = value;
            return axis;
        };

        return axis;
    };

    opla.createBrush = function (data) {
        let containerHeight = 0;
        let margin = { top: 0, right: 1, bottom: 1, left: 0 };

        const brushWidth = 40;
        const tickWidth = 40;

        let context = createContext(data);
        let focus = createFocus(context);

        let onBrushHandler = () => { };

        function update(selection) {
            const containerWidth = selection.node().clientWidth;            

            context.yScale.range([0, containerHeight]);
            focus.yScale.range([0, containerHeight]);

            focus.yAxis.scale(focus.yScale);

            const svg = selection.append("svg")
                .attr("class", "time-context")
                .attr("width", containerWidth)
                .attr("height", containerHeight);

            const canvasHeight = containerHeight - margin.top - margin.bottom;

            svg.append("defs")
                .append("clipPath")
                .attr("id", "time-axis-clip")
                .append("rect")
                .attr("width", containerWidth)
                .attr("height", canvasHeight);

            context.canvas = svg.append("g")
                .attr("class", "context")
                .attr("transform", `translate(${margin.left + tickWidth},${margin.top})`);

            context.canvas.append("g")
                .attr("class", "y-axis")
                //.attr("clip-path", "url(#time-axis-clip)")
                .call(context.yAxis);

            focus.canvas = svg.append("g")
                .attr("class", "focus")
                .attr("transform", `translate(${containerWidth - margin.right},${margin.top})`);

            focus.canvas.append("g")
                .attr("class", "y-axis")
                //.attr("clip-path", "url(#time-axis-clip)")
                .call(focus.yAxis);

            let brush = d3.brushY()
                .extent([[0, 0], [brushWidth, canvasHeight]])
                ////.on("end", brushed);
                .on("brush", brushed);

            context.canvas.append("g")
                .attr("class", "brush")
                .call(brush)
                ////.call(brush.move, focus.yScale.range());
                .call(brush.move, [canvasHeight - (canvasHeight / 10), canvasHeight]);
        }

        function brushed() {
            let s = d3.event.selection;
            let domain = s.map(context.yScale.invert, context.yScale);

            focus.yScale.domain(domain);

            ////focus.group.select(".series")
            ////    .attr("d", line);

            focus.canvas.select(".y-axis")
                .call(focus.yAxis);

            onBrushHandler();
        }

        update.containerHeight = function (value) {
            containerHeight = value;
            return update;
        };

        update.timeScale = function (value) {
            focus.yScale = value;           
            return update;
        };

        update.onBrush = function (value) {
            onBrushHandler = value;
            return update;
        };

        return update;
    };

    function createContext(data) {
        let context = {};

        context.yScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.timestamp));

        context.yAxis = d3.axisLeft(context.yScale)
            ////.tickSizeInner(0)
            .tickSizeOuter(0);

        return context;
    }

    function createFocus() {
        let focus = {};

        focus.yAxis = d3.axisLeft()
            ////.tickSizeInner(0)
            .tickSizeOuter(0);

        return focus;
    }
}());