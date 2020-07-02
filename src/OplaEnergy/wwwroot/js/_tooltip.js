(function () {
    "use strict";

    opla.createTooltip = function (canvas) {
        const MARGIN_BOTTOM = 10;

        let width = 0;
        let height = 0;

        const selection = canvas.append("g")
            .attr("class", "tooltip");

        const background = selection.append("rect")
            .attr("class", "background");

        const text = selection.append("text")
            .attr("class", "values")
            .attr("x", 5)
            .attr("y", -10);

        const line = selection.append("line")
            .attr("class", "line")
            .attr("x2", width);

        function update(series, point, mouseY) {
            const data = [];
            for (let element of series) {
                data.push({ name: element.name, value: element.accessor(point) });
            }

            data.sort((a, b) => {
                return a.value - b.value;
            });

            let textVales = text.selectAll("tspan")
                .data(data);

            textVales.enter()
                .append("tspan")                    
                    .attr("dx", 5)
                .merge(textVales)
                    .attr("class", d => d.name)
                    .text(d => d.value);            

            updateTextBackground(text, background);
            selection.attr("transform", `translate(0,${translateY(mouseY)})`);
        }

        function updateTextBackground(textSelection, backgroundSelection) {
            const bbox = textSelection.node()
                .getBBox();

            backgroundSelection.attr("x", bbox.x)
                .attr("y", bbox.y)
                .attr("width", bbox.width)
                .attr("height", bbox.height);
        }

        function translateY(mouseY) {
            const yMax = height - MARGIN_BOTTOM;

            if (mouseY) {
                return Math.min(mouseY, yMax);
            } else {
                return yMax;
            }
        }

        update.height = function (_) {
            return arguments.length ? ((height = _), update) : height;
        };

        update.width = function (_) {
            return arguments.length ? (line.attr("x2", _), update) : +line.attr("x2");
        };

        return update;
    };
}());