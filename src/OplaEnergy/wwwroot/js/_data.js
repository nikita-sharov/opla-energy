(function () {
    "use strict";

    if (window.opla === undefined) {
        window.opla = {};
    }

    const scales = {
        flow: {
            in: createScale({ min: 0, current: 1.821, max: 3.6 }),
            out: createScale({ min: 0, current: 0, max: 3.6 })
        },
        pressure: {
            spp: createScale({ min: 0, current: 8e3, max: 1e4 }),
            bhp: createScale({ min: 0, current: 107.6, max: 3e4 }),
            sbp: createScale({ min: 0, current: 101.3, max: 5e3 })
        },
        mw: {
            in: createScale({ min: 750, current: 1100, max: 1500 }),
            out: createScale({ min: 750, current: 1000, max: 1500 })
        },
        chokes: {
            a: {
                current: createScale({ min: 0, current: 23, max: 100 }),
                set: createScale({ min: 0, current: 25, max: 100 })
            },
            b: {
                current: createScale({ min: 0, current: 78, max: 100 }),
                set: createScale({ min: 0, current: 75, max: 100 })
            }
        }
    };

    function createScale(options) {
        const scale = d3.scaleLinear()
            .domain([0, 1]);

        if (Number.isInteger(options.current)) {
            scale.rangeRound([options.min, options.max]);
        } else {
            scale.range([options.min, options.max]);
        }

        return scale;
    }

    opla.generateDataPoint = function (timestamp) {
        const random = d3.randomNormal(0.5, 0.1);

        return {
            timestamp,
            flow: {
                in: Number(scales.flow.in(random()).toFixed(3)),
                out: 0
            },
            pressure: {
                spp: scales.pressure.spp(random()),
                bhp: Number(scales.pressure.bhp(random()).toFixed(1)),
                sbp: Number(scales.pressure.sbp(random()).toFixed(1))
            },
            mw: {
                in: scales.mw.in(random()),
                out: scales.mw.out(random())
            },
            chokes: {
                a: {
                    current: scales.chokes.a.current(random()),
                    set: scales.chokes.a.set(random())
                },
                b: {
                    current: scales.chokes.b.current(random()),
                    set: scales.chokes.b.set(random())
                }
            }
        };
    };

    opla.generateData = function (length = 34) {
        const data = [];

        const start = moment()
            .milliseconds(0)
            .subtract(length, "seconds");

        for (let seconds = 0; seconds < length; seconds++) {
            const timestamp = moment(start)
                .add(seconds, "seconds")
                .toDate();

            const point = opla.generateDataPoint(timestamp);
            data.push(point);
        }

        return data;
    };
}());