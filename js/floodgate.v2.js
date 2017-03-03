"use strict";

function loadFloodgateWaterfallSettings() {
    return {
        minValue: 0,    // min value. Used to calculate scales and associated stuff.
        maxValue: 100,  // max value. Used to calculate scales and associated stuff.
        scale: 1,       // // scale of the svg's parent div. Shouldn't be used. It is an alternative way to set size.
        waveHeight: 0.02, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1, // The number of full waves per width of the wave circle.
        waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 5000, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveColor: "#178BCA", // The color of the fill wave.
        waveOpacity: 0.9, // the wave opacity
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        outterCircleColor: "none", // color of the outter circle, the one that is behind all elements.
        outterCircleStroke: "#000000",   // stroke of the outter circle, the one that is behind all elements.
        outterCircleThickness: 0,     // stroke-width of the outter circle, the one that is behind all elements.
        fenceColor: "#ccc",        // color of the fences (the horizontal "string").
        fenceStroke: "none",          // stroke of the fences. No need to set it up, but still an option.
        fenceThickness: 0,            // stroke-width of the fences. No need to set it up, but still an option.
        pileColor: "#ccc",         // color of the piles (the vertical "piles").
        pileStroke: "none",           // stroke of the piles. No need to set it up, but still an option.
        pileThickness: 0,             // stroke-width of the piles. No need to set it up, but still an option.
        backgroundColor: "#ccc",   // color of the background. This is the element that is behind the four dam elements.
        backgroundStroke: "none",     // stroke-width of the background. No need to set it up, but still an option.
        backgroundThickness: 0,       // stroke-width of the background. No need to set it up, but still an option.
        damColor: "#E6E9EE",          // color of the dam. 
        damStroke: "#E6E9EE",         // stroke of the dam. 
        damThickness: 2,              // stroke-width of the dam. 
        fallingWaterColor: "#178BCA", // color of the water that is falling from the dam's gate.
        fallingWaterOpacity: 0.8,     // opacity of the water that is falling from the dam's gate. 
        fallingWaterStroke: "#178BCA",   // stroke of the falling water. No need to set it up, but still an option.
        fallingWaterThickness: 1,     // stroke-width of the falling water. No need to set it up, but still an option.
        gateColor: "#708090",         // color of the "gate" where the water comes from.
        gapColor: "#ACB3BA",          // color of the "gap" between dams.
    };
}

function FloodgateWaterfallElement(selector, value, config, isOpen) { 
    var gate = this;

    // properties
    gate.selector = selector;
    gate.config = config == null ? loadGateSettings() : config;
    gate.value = value;
    gate.isOpen = isOpen;

    // functions
    gate.createSVG = createSVG;
    gate.createGate = createGate;
    gate.createWave = createWave;
    gate.createWaterfall = createWaterfall;
    gate.resize = resize;
    gate.update = update;


    /*******************************************************
     * TODO: Find a way to make this component responsive! *
     *******************************************************/

    /////////////////////////////////////

    // creates and displays the svg fully working
    (function () {
        gate.createSVG().then(function () {
            gate.createGate().then(function () {
                gate.createWave(gate.config, gate.value).then(function () {
                    gate.createWaterfall().then(function () {
                //         // window.addEventListener("resize", gate.resize);
                //         // gate.resize();
                    });
                });
            });
        });
    })();

    /** @function createSVG
     *  @description Creates the main svg and associated elements.
    */
    function createSVG() {
        var deferred = $.Deferred();
        var container = d3.select(gate.selector);

        var width = 158,
            height = 132;

        // appends an svg to the div
        gate.svg = container.style("transform", "scale(" + gate.config.scale + ")")
            .append("svg")
            .attr("id", "floodgate-" + gate.selector.split("#")[1])
            .attr({ width: width, height: height })
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height);

        // pile's d element
        var piles = ["M419.2,118c0-3.2-2.4-5.6-5.6-5.6s-5.6,2.4-5.6,5.6c0,2.4,1.6,4.4,3.6,5.2v73.2h3.6v-73.2   C417.6,122.4,419.2,120.4,419.2,118z",
            "M312.8,118c0-3.2-2.4-5.6-5.6-5.6s-5.6,2.4-5.6,5.6c0,2.4,1.6,4.4,3.6,5.2v73.2h3.6v-73.2   C311.2,122.4,312.8,120.4,312.8,118z",
            "M206.4,118c0-3.2-2.4-5.6-5.6-5.6c-3.2,0-5.6,2.4-5.6,5.6c0,2.4,1.6,4.4,3.6,5.2v73.2h3.6v-73.2   C204.8,122.4,206.4,120.4,206.4,118z",
            "M100,118c0-3.2-2.4-5.6-5.6-5.6s-5.6,2.4-5.6,5.6c0,2.4,1.6,4.4,3.6,5.2v73.2H96v-73.2   C98.4,122.4,100,120.4,100,118z"];

        // fence's d element
        var fences = ["M480.8,140c-4.8,0.4-9.6,0.8-14.4,0.8c-29.2,0-49.6-8-53.2-9.6c-19.6,7.2-37.6,9.6-53.6,9.6   c-29.2,0-49.6-8-53.2-9.6c-19.2,7.2-37.6,9.6-53.6,9.6c-29.2,0-49.6-8-53.2-9.6c-19.6,7.2-37.6,9.6-53.6,9.6   c-29.2,0-49.6-8-53.2-9.6c-19.6,7.2-37.6,9.6-53.6,9.6c-4.8,0-9.6-0.4-13.6-0.4c0.4-0.8,0.8-2,1.6-2.8c18,1.6,40.8,0,65.2-8.8l0,0   h0.4h0.4l0,0c0.4,0,48,21.2,105.2,0l0,0h0.4h0.4l0,0c0.4,0,48,21.2,105.6,0l0,0h0.4h0.4l0,0c0.4,0,48,21.2,105.2,0l0,0h0.4h0.4l0,0   c0.4,0,27.2,12,65.2,8.8C480,138,480.4,138.8,480.8,140z",
            "M487.6,154.4c-7.2,0.8-14.4,1.2-20.8,1.2c-29.2,0-49.6-8-53.2-9.2c-19.6,7.2-37.6,9.2-53.6,9.2   c-29.2,0-49.6-8-53.2-9.2c-19.2,7.2-37.6,9.2-53.6,9.2c-29.2,0-49.6-8-53.2-9.2c-19.6,7.2-37.6,9.2-53.6,9.2   c-29.2,0-49.6-8-53.2-9.2c-19.6,7.2-37.6,9.2-53.6,9.2c-7.2,0-14.4-0.4-20.4-1.2c0.4-0.8,0.8-2,1.2-2.8c18.8,2.4,44.4,2,72-8.4l0,0   l0,0h0.4h0.4l0,0l0,0c0.4,0,21.6,9.2,52.4,9.2c15.6,0,33.6-2.4,53.2-9.6l0,0h0.4h0.4l0,0l0,0c0.4,0,21.6,9.2,52.4,9.2   c15.6,0,33.6-2.4,53.2-9.6l0,0l0,0h0.4h0.4l0,0l0,0c0.8,0.4,48,20.8,105.2,0l0,0l0,0h0.4h0.4l0,0l0,0c0.4,0.4,30.8,13.2,72,8   C486.8,152.4,487.2,153.2,487.6,154.4z",
            "M493.2,168.4c-9.2,1.6-18.4,2.4-26.4,2.4c-29.2,0-49.6-8-53.2-9.6c-19.6,7.2-37.6,9.6-53.6,9.6   c-29.2,0-49.6-8-53.2-9.6c-19.2,7.2-37.6,9.6-53.6,9.6c-29.2,0-49.6-8-53.2-9.6c-19.6,7.2-37.6,9.6-53.6,9.6   c-29.2,0-49.6-8-53.2-9.6c-19.6,7.2-37.6,9.6-53.6,9.6c-9.6,0-18.4-0.8-26-2c0.4-0.8,0.8-2,1.2-2.8c19.2,3.2,47.2,4,78-7.2l0,0h0.4   h0.4l0,0c0.4,0,48,20.8,105.2,0l0,0h0.4h0.4l0,0c0.4,0,48,20.8,105.6,0l0,0h0.4h0.4l0,0c0.4,0,21.2,9.2,52.4,9.2   c15.6,0,33.6-2.4,53.2-9.6l0,0h0.4h0.4l0,0c0.4,0,33.6,14.8,78,7.2C492.4,166.4,492.8,167.6,493.2,168.4z",
            "M498,182.8c-11.2,2.4-21.6,3.2-31.2,3.2c-29.2,0-49.6-8-53.2-9.6C394,183.6,376,186,360,186   c-29.2,0-49.6-8-53.2-9.6c-19.2,7.2-37.6,9.6-53.6,9.6c-29.2,0-49.6-8-53.2-9.6c-19.6,7.2-37.6,9.6-53.6,9.6   c-29.2,0-49.6-8-53.2-9.6c-19.6,7.2-37.6,9.6-53.6,9.6c-11.6,0-22-1.2-30.4-2.8c0.4-0.8,0.4-2,0.8-2.8c19.6,3.6,49.2,5.6,82.8-6.4   l0,0h0.4h0.4l0,0c0.4,0,48,20.8,105.2,0l0,0h0.4h0.4l0,0c0.4,0,48,20.8,105.6,0l0,0h0.4h0.4l0,0c0.4,0,48,20.8,105.2,0l0,0h0.4h0.4   l0,0c0.4,0,36,15.6,82.8,6.4C497.2,180.8,497.6,181.6,498,182.8z"];

        // background group
        gate.svg.fenceGroup = gate.svg.append("g")
            .attr("id", "fenceGroup")
            .attr("transform", "translate(-22, -45) scale(0.4)");

        // appending piles
        gate.svg.fenceGroup.selectAll("path.pile")
            .data(piles).enter()
            .append("path")
            .attr("d", function (d) { return d; })
            .style("fill", gate.config.pileColor)
            .style("stroke", gate.config.pileStroke)
            .style("stroke-width", gate.config.pileThickness);

        // appending fences
        gate.svg.fenceGroup.selectAll("path.fence")
            .data(fences).enter()
            .append("path")
            .attr("d", function (d) { return d; })
            .style("fill", gate.config.fenceColor)
            .style("stroke", gate.config.fenceStroke)
            .style("stroke-width", gate.config.fenceThickness);

        // appending semi-circle background (under the fence)
        gate.svg.append("rect")
            .attr("id", "barrier")
            .attr({ width: width, height: (height - 33) })
            .attr("y", 33)
            .style("fill", gate.config.backgroundColor)
            .style("stroke", gate.config.backgroundStroke)
            .style("stroke-width", gate.config.backgroundThickness);

        deferred.resolve();
        return deferred.promise();
    }

    /** @function createGate
     *  @description Creates all the gates and its associated elements.
    */
    function createGate() { 
        var deferred = $.Deferred();
        var container = d3.select(gate.selector);

        var points = [{ "x": 0.03, "y": 0.15 },
                    { "x": -0.05, "y": 1 },
                    { "x": 0.35, "y": 1 },
                    { "x": 0.27, "y": 0.15 }];

        var width = 158,
            height = 132;

        // scales to create the dam element
        var scaleX = d3.scale.linear().domain([0, 1]).range([0, width]);
        var scaleY = d3.scale.linear().domain([0, 1]).range([0, height]);

        var translate = "translate(0, 0)";

        // gate group
        gate.svg.damGroup = gate.svg.append("g").attr("id", "damGroup")
            .attr("transform", "translate(" + width / 2.83 + ", 0)");

        // dam element
        gate.svg.damGroup.selectAll("polygon.dam")
            .data([points]).enter()
            .append("polygon")
            .attr("points", function (d) {
                return d.map(function (d) { // returns points to create the element
                    return [scaleX(d.x), scaleY(d.y)].join(",");
                }).join(" ");
            })
            .attr("transform", translate)
            .style("fill", gate.config.damColor)
            .style("stroke", gate.config.damStroke)
            .style("stroke-width", gate.config.damThickness);

        gate.svg.gateGroup = gate.svg.damGroup.append("g")
            .attr("id", "gateGroup")
            .attr("transform", "translate(0, 0)");

        // falling water
        gate.svg.gateGroup.append("path")
            .attr("d", "M160.4,397.2H112l4.4-150c0.4-9.6,9.2-17.6,19.6-17.6l0,0c10.8,0,19.6,7.6,19.6,17.6L160.4,397.2z")
            .attr("transform", "translate(-112.2, -205)")
            .style("fill", gate.config.backgroundColor)
            .style("stroke", gate.config.backgroundColor)
            .style("stroke-width", function () { return gate.isOpen ? 0 : 1; })
            .style("opacity", 0.5);

        // element where the water falls from
        gate.svg.gateGroup.append("path")
            .attr("d", "M234.4,246c-0.8-9.2-9.2-16.4-19.6-16.4l0,0c-10.4,0-18.8,7.2-19.6,16.4H234.4z")
            .attr("transform", "translate(-191, -205) ")
            .style("fill", "#324A5E");

        // gate element
        // var elem = { w: 62, h: 62, x: 25, y: 55 };
        // gate.svg.gateGroup.append("rect")
        //     .attr({ width: elem.w, height: elem.h })
        //     .attr({ x: elem.x, y: elem.y })
        //     .style("fill", gate.config.gateColor);

        // gate.svg.gateGroup.append("image")
        //     .attr("xlink:href", window.location.href + "img/gate_.png")
        //     .attr({ width: elem.w, height: elem.h })
        //     .attr({ x: elem.x, y: elem.y });

        deferred.resolve();
        return deferred.promise();
    }

    /** @function createWave
     *  @description Calculate and generate the clipPath to simulate a wave.
     *  @param {Object} config - object that contains all the properties/values to customize the element
     *  @param {Number} value - downstream or upstream svg object
    */
    function createWave(config, value) { 
        var deferred = $.Deferred();

        gate.isOpen ? setSVGProperties(gate.svg, gate.config, value) : setSVGProperties(gate.svg, gate.config, 0);

        var svg = gate.svg;
        var data = []; // Data for building the clip wave area.

        for (var i = 0; i <= 40 * svg.waveClipCount; i++)
            data.push({ x: i / (40 * svg.waveClipCount), y: (i / (40)) });

        //svg.waveGroup = svg.outerGroup.append("defs")
        svg.waveGroup = svg.append("defs")
            .append("clipPath")
            .attr("id", "clipWaveFloodgate-" + svg.attr("id"));

        svg.wave = svg.waveGroup.append("path")
            .datum(data)
            .attr("d", svg.clipArea)
            .attr("T", 0);

        // The inner rect with the clipping wave attached.
        // svg.innerGroup = svg.outerGroup.append("g")
        svg.innerGroup = svg.append("g")
            .attr("id", "waveGroup")
            .attr("clip-path", "url(#clipWaveFloodgate-" + svg.attr("id") + ")");

        var width = 158,
            height = 132;

        svg.innerGroup.append("rect")
            .attr({ width: width, height: height })
            .style("fill", config.waveColor)
            .style("opacity", config.waveOpacity);

        if (config.waveRise) {
            svg.waveGroup.attr('transform', 'translate(' + svg.waveGroupXPosition + ',' + svg.waveRiseScale(0) + ')')
                .transition()
                .duration(config.waveRiseTime)
                .attr('transform', 'translate(' + svg.waveGroupXPosition + ',' + svg.waveRiseScale(svg.fillPercent) + ')')
                .each("start", function () { svg.wave.attr('transform', 'translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } else
            svg.waveGroup.attr('transform', 'translate(' + svg.waveGroupXPosition + ',' + svg.waveRiseScale(svg.fillPercent) + ')');

        if (config.waveAnimate) animateWave();

        deferred.resolve();
        return deferred.promise();
    }

    function createWaterfall() { 
        var deferred = $.Deferred();

        var svg = gate.svg;
        var container = d3.select(gate.selector);
        var svgWidth = parseFloat(svg.style("width"));
        var svgHeight = parseFloat(svg.style("height"));

        var canvas = container.append("canvas")
            .attr("id", "waterfall-" + svg.attr("id"))
            .style("position", "absolute")
            .style("z-index", 2)
            .style("top", 0)
            .style("left", 0);

        canvas
            .style("transform", function() {
                var x, y;
                
                x = (svgWidth / 2) - (d3.selectAll("#gateGroup > path")[0][1].getBoundingClientRect().width / 2.5);
                //x = 87;
                y = svgHeight - (svgHeight * 69/100) ;

                return "translate("+x+"px,"+y+"px)";
            })
            .style("width", function() {
                return 39.1966667175293 + "px";  
                //return d3.selectAll("#gateGroup > path")[0][1].getBoundingClientRect().width + "px"; 
            })
            .style("height", function() {
                var barrierHeight = 98.99147033691406; //d3.select("#barrier")[0][0].getBoundingClientRect().height;
                var fullWaterfallHeight = barrierHeight;
                fullWaterfallHeight += gate.value > 7 ? (barrierHeight * 11/100) : (barrierHeight * 7/100)

                var minWaterfallHeight = 21;
                var waterfallHeightScale = d3.scale.linear()
                    .domain([svg.waveRiseScale(0.62), svg.waveRiseScale(0)]) // input: min/max waterfall size in pixels
                    .range([minWaterfallHeight, fullWaterfallHeight]);         // output: from full wave to empty wave       

                var waterfallHeight = waterfallHeightScale(svg.waveRiseScale(svg.fillPercent));
                
                // se o valor atual for 0, o tamanho da cachoeira tem que ser 0px
                return svg.fillPercent > 0 ? waterfallHeight + "px" : "0px";
            });

        var isCanvasSupported = function () {
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
        };

        var setupRAF = function () {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
            };

            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function (callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            };

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                };
            };
        };

        if (isCanvasSupported()) {
            var c = document.getElementById("waterfall-" + svg.attr("id"));
            var cw = c.width = parseFloat(canvas.style("width"));
            var ch = c.height = parseFloat(canvas.style("height"));
            svg.waterfall = new waterfallCanvas(c, cw, ch);
            setupRAF();
            svg.waterfall.init();
        }

        deferred.resolve();
        return deferred.promise();
    }

    /**
     * TODO: Implement this function
     */
    function resize() {
        // this makes the svg responsive 
        // gate.svg.attr({ width: "100%", height: "100%" });

    }

    /** @function update
     *  @description Update the whole svg.
     *  @param {Number} value - current value, used to rise the wave
     *  @param {Boolean} isOpen - whether or not the gate is open
    */
    function update(value, isOpen) {
        gate.isOpen = isOpen;
        var canvas = d3.select("canvas#waterfall-" + gate.svg.attr("id"));

        if (gate.isOpen) {
            setSVGProperties(gate.svg, gate.config, value);
            canvas.style("visibility", "visible");
        }
        else {
            setSVGProperties(gate.svg, gate.config, 0);
            canvas.style("visibility", "hidden");
        }

        var newWavePosition = gate.config.waveAnimate ? gate.svg.waveAnimateScale(1) : 0;

        gate.svg.gateGroup
            .transition().duration(0)
            .transition().duration(gate.config.waveRiseTime / 2)
            .ease("linear")
            // .attr("transform", function () { return gate.isOpen ? "translate(0, 0)" : "translate(0, 20)"; })
            .each("start", function () {
                if (!gate.isOpen) {
                    canvas.remove();

                    // wave animation
                    gate.svg.wave.transition()
                        .duration(0).transition()
                        .duration(gate.config.waveAnimate ? (gate.config.waveAnimateTime * (1 - gate.svg.wave.attr('T'))) : (gate.config.waveRiseTime))
                        .ease('linear')
                        .attr('d', gate.svg.clipArea)
                        .attr('transform', 'translate(' + newWavePosition + ', 0)')
                        .attr('T', '1')
                        .each("end", function () {
                            if (gate.config.waveAnimate) {
                                gate.svg.wave.attr('transform', 'translate(' + gate.svg.waveAnimateScale(0) + ', 0)');
                                animateWave(gate.config.waveAnimateTime);
                            }
                        });

                    gate.svg.waveGroup.transition()
                        .duration(gate.config.waveRiseTime)
                        .attr('transform', 'translate(' + gate.svg.waveGroupXPosition + ',' + gate.svg.waveRiseScale(gate.svg.fillPercent) + ')');
                }
            })
            .each("end", function () {
                if (gate.isOpen) {
                    canvas.remove();
                    createWaterfall();

                    // wave animation
                    gate.svg.wave.transition()
                        .duration(0).transition()
                        .duration(gate.config.waveAnimate ? (gate.config.waveAnimateTime * (1 - gate.svg.wave.attr('T'))) : (gate.config.waveRiseTime))
                        .ease('linear')
                        .attr('d', gate.svg.clipArea)
                        .attr('transform', 'translate(' + newWavePosition + ', 0)')
                        .attr('T', '1')
                        .each("end", function () {
                            if (gate.config.waveAnimate) {
                                gate.svg.wave.attr('transform', 'translate(' + gate.svg.waveAnimateScale(0) + ', 0)');
                                animateWave(gate.config.waveAnimateTime);
                            }
                        });

                    gate.svg.waveGroup.transition()
                        .duration(gate.config.waveRiseTime)
                        .attr('transform', 'translate(' + gate.svg.waveGroupXPosition + ',' + gate.svg.waveRiseScale(gate.svg.fillPercent) + ')');
                }
            });
     }

    /** @function setSVGProperties
     *  @description Sets the svg's properties that will be used to create the wave, update text labels, etc.
     *  @param {Object} svg - downstream or upstream svg object
     *  @param {Object} config - object that contains all the properties/values to customize the element
     *  @param {Number} value - current value, used to rise the wave
    */
    function setSVGProperties(svg, config, value) {
        // sets width and height in order to do all the calculations to match the viewBox of the svg. After the SVG is rendered, it is resized to fill fully its container.
        var width = 158,
            height = 132;

        gate.value = value;

        if (value > config.maxValue) gate.value = config.maxValue;
        if (value < config.minValue) gate.value = config.minValue;

        // general
        // converting the value (scale from config.minValue to config.maxValue) to its equivalent value in a scale from 0 to 60.
        // it is necessary to fulfill only a portion of the svg that corresponds to the part below the dam's gate
        svg.fillPercent = ((60 * (value - config.minValue)) / (config.maxValue - config.minValue)) / 100;

        // wave
        var range, domain;
        if (config.waveHeightScaling) {
            range = [0, config.waveHeight, 0];
            domain = [0, 50, 100];
        } else {
            range = [config.waveHeight, config.waveHeight];
            domain = [0, 100];
        }

        svg.waveAnimateTime = config.waveAnimateTime;
        svg.waveHeightScale = d3.scale.linear().range(range).domain(domain);
        svg.waveHeight = (height / 2) * svg.waveHeightScale((svg.fillPercent / 0.60) * 100); // converting again to the original scale in order to calcule the wave height. The number 0.6 is the percentage that fulfills the dam.
        svg.waveLength = width / config.waveCount;
        svg.waveClipCount = 1 + config.waveCount;
        svg.waveClipWidth = svg.waveLength * svg.waveClipCount;
        svg.waveGroupXPosition = width - svg.waveClipWidth;

        // Scales for controlling the size of the clipping path.
        svg.waveScaleX = d3.scale.linear().range([0, svg.waveClipWidth]).domain([0, 1]);
        svg.waveScaleY = d3.scale.linear().range([0, svg.waveHeight]).domain([0, 1]);

        // Scales for controlling the position of the clipping path.
        svg.waveRiseScale = d3.scale.linear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
            .range([(height + svg.waveHeight), (svg.waveHeight)])
            .domain([0, 1]);

        svg.waveAnimateScale = d3.scale.linear()
            .range([0, svg.waveClipWidth - width]) // Push the clip area one full wave then snap back.
            .domain([0, 1]);

        // The clipping wave area.
        svg.clipArea = d3.svg.area()
            .x(function (d) { return svg.waveScaleX(d.x); })
            .y0(function (d) { return svg.waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI)); })
            .y1(function (d) { return ((height) + svg.waveHeight); });
    }

    /** @function animateWave
     *  @description Animate the wave based on its value and configuration.
    */
    function animateWave() {
        var svg = gate.svg;

        svg.wave.attr('transform', 'translate(' + svg.waveAnimateScale(svg.wave.attr('T')) + ',0)');
        svg.wave.transition()
            .duration(svg.waveAnimateTime * (1 - svg.wave.attr('T')))
            .ease('linear')
            .attr('transform', 'translate(' + svg.waveAnimateScale(1) + ',0)')
            .attr('T', 1)
            .each('end', function () {
                svg.wave.attr('T', 0);
                animateWave(svg.waveAnimateTime);
            });
    }

    function waterfallCanvas(c, cw, ch) {
        var _this = this;
        this.c = c;
        this.ctx = c.getContext('2d');
        this.cw = cw;
        this.ch = ch;

        var particleRateScale = d3.scale.linear()
            .domain([gate.config.minValue, gate.config.maxValue])
            .range([1, 10]);

        this.particles = [];
        this.particleRate = Math.floor(particleRateScale(gate.value));
        this.gravity = .15;

        this.init = function () {
            this.loop();
        };

        this.reset = function () {
            this.ctx.clearRect(0, 0, this.cw, this.ch);
            this.particles = [];
        };

        this.rand = function (rMi, rMa) { return ~~((Math.random() * (rMa - rMi + 1)) + rMi); };

        this.Particle = function () {
            var color = d3.hsl(gate.config.waveColor);

            var scale = d3.scale.linear()
                .domain([gate.config.minValue, gate.config.maxValue])
                .range([5, 20]);

            var newWidth = _this.rand(1, Math.floor(scale(gate.value)));
            var newHeight = _this.rand(1, 70);

            this.x = _this.rand((newWidth / 2), _this.cw - (newWidth / 2));
            this.y = -newHeight;
            this.vx = 0;
            this.vy = 0;
            this.width = newWidth;
            this.height = newHeight;
            this.hue = color.h;
            this.saturation = _this.rand(color.s * 100 + 30, color.s * 100);
            this.lightness = _this.rand(color.l * 100 + 30, color.l * 100);
        };

        this.Particle.prototype.update = function (i) {
            this.vx += this.vx;
            this.vy += _this.gravity;
            this.x += this.vx;
            this.y += this.vy;
        };

        this.Particle.prototype.render = function () {
            _this.ctx.strokeStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, .05)';
            _this.ctx.beginPath();
            _this.ctx.moveTo(this.x, this.y);
            _this.ctx.lineTo(this.x, this.y + this.height + 5);
            _this.ctx.lineWidth = this.width / 2;
            _this.ctx.lineCap = 'round';
            _this.ctx.stroke();
        };

        this.Particle.prototype.renderBubble = function () {
            _this.ctx.fillStyle = 'hsla(' + this.hue + ', 40%, 40%, 1)';
            _this.ctx.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, .3)';
            _this.ctx.beginPath();
            _this.ctx.arc(this.x + this.width / 2, _this.ch - 20 - _this.rand(0, 10), _this.rand(1, 8), 0, Math.PI * 2, false);
            _this.ctx.fill();
        };

        this.createParticles = function () {
            var i = this.particleRate;
            while (i--) {
                this.particles.push(new this.Particle());
            }
        };

        this.removeParticles = function () {
            var i = this.particleRate;
            while (i--) {
                var p = this.particles[i];
                if (p.y > _this.ch - 20 - p.height) {
                    //p.renderBubble();
                    _this.particles.splice(i, 1);
                }
            }
        };

        this.updateParticles = function () {
            var i = this.particles.length;
            while (i--) {
                var p = this.particles[i];
                p.update(i);
            };
        };

        this.renderParticles = function () {
            var i = this.particles.length;
            while (i--) {
                var p = this.particles[i];
                p.render();
            };
        };

        this.clearCanvas = function () {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(255,255,255,.06)';
            this.ctx.fillRect(0, 0, this.cw, this.ch);
            this.ctx.globalCompositeOperation = 'source-over';
        };

        this.loop = function () {
            var loopIt = function () {
                requestAnimationFrame(loopIt, _this.c);
                _this.clearCanvas();
                _this.createParticles();
                _this.updateParticles();
                _this.renderParticles();
                _this.removeParticles();
            };
            loopIt();
        };
    };
}