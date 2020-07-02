(function () {
    "use strict";

    function toKebabCase(value) {
        return value.replace(/\s+/g, '-')
            .toLowerCase();
    }

    function getSeries() {
        return [
            {
                name: "Bingham Plastic",
                data: [
                    { x: 0, y: 84 },
                    { x: 1100, y: 450 }
                ]
            },
            {
                name: "Power Law",
                data: [
                    { x: 0, y: 0 },
                    { x: 1100, y: 450 }
                ]
            },
            {
                name: "Herschel Bulkley",
                data: [
                    { x: 0, y: 30 },
                    { x: 150, y: 100 },
                    { x: 300, y: 160 },
                    { x: 450, y: 215 },
                    { x: 1100, y: 450 }
                ]
            }
        ];
    }

    function drawSeries(selection, line, series) {
        const canvas = selection.append("g")
            .attr("class", "series");

        for (const entry of series) {
            canvas.append("g")
                .attr("class", toKebabCase(entry.name))
                .append("path")
                .attr("d", line(entry.data));
        }

        return canvas;
    }

    function drawLegend(selection, series) {
        const canvas = selection.append("g")
            .attr("class", "legend");

        let translateX = 0;

        for (const entry of series) {
            const dataset = canvas.append("g")
                .attr("class", "dataset");                

            if (translateX) {
                dataset.attr("transform", `translate(${translateX})`);
            }

            dataset.append("line")
                .attr("class", toKebabCase(entry.name))
                .attr("x2", 20);

            dataset.append("text")
                .attr("dx", 25)
                .attr("dy", "0.32em")
                .text(entry.name);

            translateX += dataset.node().getBBox().width + 10;
        }

        return canvas;
    }

    function drawChart(selection) {
        const margin = { top: 40, right: 20, bottom: 45, left: 55 };

        const containerWidth = selection.node().clientWidth;
        const containerHeight = selection.node().clientHeight;

        const svg = selection.append("svg")
            .attr("class", "chart")
            .attr("width", containerWidth)
            .attr("height", containerHeight);

        const canvas = svg.append("g")
            .attr("class", "canvas")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const canvasWidth = containerWidth - margin.left - margin.right;
        const canvasHeight = containerHeight - margin.top - margin.bottom;

        const series = getSeries();

        const legend = drawLegend(canvas, series);

        const legendWidth = legend.node().getBBox().width;
        const translateX = (canvasWidth - legendWidth) / 2;
        if (translateX < 0) {
            translateX = 0;
        }

        legend.attr("transform", `translate(${translateX},-18)`);

        const xScale = d3.scaleLinear()
            .domain([0, 1200])
            .range([0, canvasWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, 500])
            .range([canvasHeight, 0]);

        const xAxis = d3.axisBottom(xScale)
            .tickSizeInner(-canvasHeight)
            .tickSizeOuter(0);

        const xAxisGroup = canvas.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${canvasHeight})`)
            .call(xAxis);

        xAxisGroup.selectAll(".tick text")
            .attr("dy", "12");

        xAxisGroup.append("text")
            .attr("class", "label")
            .attr("x", canvasWidth / 2)
            .attr("y", 32)
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .style("font-size", "12.8px")
            .text("Shear Rate");

        const yAxis = d3.axisLeft(yScale)
            .tickSizeInner(-canvasWidth)
            .tickSizeOuter(0);

        const yAxisGroup = canvas.append("g")
            .attr("class", "axis y-axis")
            .call(yAxis);

        yAxisGroup.selectAll(".tick text")
            .attr("dx", "-5");

        const textX = -35;
        const textY = canvasHeight / 2;

        yAxisGroup.append("text")
            .attr("x", textX)
            .attr("y", textY)
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90,${textX},${textY})`)
            .attr("fill", "currentColor")
            .style("font-size", "12.8px")
            .text("Shear Stress");

        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));
        
        drawSeries(canvas, line, series);

        const dots = canvas.select(".series .herschel-bulkley")
            .append("g")
            .attr("class", "dots");        

        dots.selectAll(".dot")
            .data(series[2].data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", 5);
    }

    d3.select("#rheological-analysis")
        .call(drawChart);
}());