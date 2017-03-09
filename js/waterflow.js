"use strict";

function loadWaterflowSettings() {
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
        circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor: "#178BCA", // color of the outter circle, the one that is behind all elements.
        circleStroke: "#000000",   // stroke of the outter circle, the one that is behind all elements.
        circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
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

function WaterflowElement(selector, value, config) {
    var waterflow = this;

    // properties
    waterflow.selector = selector;
    waterflow.config = config == null ? loadWaterflowSettings() : config;
    waterflow.value = value;

    // functions
    waterflow.createSVG = createSVG;
    waterflow.createWave = createWave;
    // waterflow.createWaterfall = createWaterfall;
    // waterflow.resize = resize;
    // waterflow.update = update;

    /////////////////////////////////////

    // creates and displays the svg fully working
    (function () {
        waterflow.createSVG().then(function () {
            waterflow.createWave().then(function () {
            });
        });
    })();

    /** @function createSVG
     *  @description Creates the main svg and associated elements.
    */
    function createSVG() {
        var deferred = $.Deferred();
        var container = d3.select(waterflow.selector);

        var width = 315,
            height = 315;

        // appends an svg to the div
        waterflow.svg = container.style("transform", "scale(" + waterflow.config.scale + ")")
            .append("svg")
            .attr("id", "waterflow-" + waterflow.selector.split("#")[1])
            .attr({ width: width, height: height })
            //.attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height)
            .style("max-width", "100%")
            .style("height", "100%")
            .style("visibility", "hidden");

        // var radius = width / 2;
        // var circleThickness = waterflow.config.circleThickness * radius;
        // var circleFillGap = waterflow.config.circleFillGap * radius;
        // var fillCircleMargin = circleThickness + circleFillGap;
        // var fillCircleRadius = radius - fillCircleMargin;

        // // Scales for drawing the outer circle.
        // var circleX = d3.scale.linear().range([0, 2 * Math.PI]).domain([0, 1]);
        // var circleY = d3.scale.linear().range([0, radius]).domain([0, radius]);

        // // Draw the outer circle.
        // var circleArc = d3.svg.arc()
        //     .startAngle(circleX(0))
        //     .endAngle(circleX(1))
        //     .outerRadius(circleY(radius))
        //     .innerRadius(circleY(radius - circleThickness));

        // // outter circle
        // waterflow.svg.append("path")
        //     .attr("d", circleArc)
        //     .style("fill", waterflow.config.circleColor)
        //     .attr('transform', 'translate(' + radius + ',' + radius + ')');

        // // inner circle
        // waterflow.svg.append("circle")
        //     .attr("cx", radius)
        //     .attr("cy", radius)
        //     .attr("r", fillCircleRadius)
        //     .style({ fill: "none", stroke: "black" })
        // .style("fill", waterflow.config.waveColor);

        waterflow.svgGroup = waterflow.svg.append("g")
            .attr("id", "svgGroup")
            .attr("transform", "translate(-135, -120)");

        // appending defs
        waterflow.defs = waterflow.svgGroup.append("defs");

        // outer circle. Dont know exactly how it is used, but still important to the visualization
        waterflow.defs.append("circle")
            .attr("id", "outer")
            .attr("cx", 293)
            .attr("cy", 278.7)
            .attr("r", 138)
            .style("fill", "none")
            .style("stroke", "#D17454")
            .style("stroke-miterlimit", 10)
            .style("stroke-width", 12);

        waterflow.defs.append("path")
            .attr("id", "waterfall")
            .attr("d", "M338.5,116.9c8.5,0,7.3,3.9,15.8,7.3c4.9,1.9,12.2,1.8,16,6.5c3.2,3.9,1.9,10.4,2.6,17 c1,9.7,7.1,34.4,9.3,63.4c1.6,20.7-0.6,43.7,0.9,64.2c2.7,35.3,13.6,32.4,8.7,64c-2.8,18.2-11.6,11.4-30.5,22.1 c-9.1,5.2-19.4,13.4-33.5,15.5c-10.7,1.6-22.9-2.2-36.7-4.3c-12.1-1.8-23.60.1-33.1-2.1c-12.7-2.9-22.2-9.7-30.6-12.5c-21.4-7.2-29.4,5.1-32.6-11c-6.2-31.6,5.7-28.9,7.7-64.6c1.2-20.5-1.6-43.5-0.6-64.5c1.3-27.3,6.3-51.5,6.3-64.2c0.6-7.8-1.2-14.9,1.5-19.6c3.8-6.5,11.6-7.6,16.8-9.9c9.6-4.2,8.5-7.3,18.2-7c15.6,0.4,15.5,4,31.1,4c15.6,0,15.5-3.3,31.1-4C322.9,116.2,322.9,116.9,338.5,116.9z")
            .style("fill", "#7EE7F9");

        waterflow.defs.append("clipPath")
            .attr("id", "mainMask")
            .append("use")
            .attr("xlink:href", "#outer");

        waterflow.defs.append("clipPath")
            .attr("id", "waterfallMask")
            .append("use")
            .attr("xlink:href", "#waterfall");

        waterflow.defs.append("circle")
            .attr("id", "foam")
            .attr("cx", 180)
            .attr("cy", 333.7)
            .attr("r", 17.7);

        //Append a linearGradient element to the defs and give it a unique id
        var linearGradient = waterflow.defs.append("linearGradient")
            .attr("id", "mainShadowGrad")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr({ x1: 589.3363, y1: 515.8959, x2: 306.3363, y2: 273.896 });

        //Set the color for the start (0.3)
        linearGradient.append("stop")
            .attr("offset", "0.3")
            .style("stop-color", "#263448")
            .style("stop-opacity", "0");

        //Set the color for the end (1)
        linearGradient.append("stop")
            .attr("offset", "1")
            .style("stop-color", "#172534");

        waterflow.svgGroup.append("circle")
            .attr("class", "outer")
            .attr("cx", 293)
            .attr("cy", 278.7)
            .attr("r", 156)
            .style("fill", "#F5E9C1");  

        waterflow.mainGroup = waterflow.svgGroup.append("g")
            .attr("class", "mainGroup")
            .attr("clip-path", "url(#mainMask)");

        // waterflow.mainGroup.append("path") // land
        //     .attr("d", "M464,372H124c0,0,0-151,0-189.3c28.3-28.3,340,0,340,0V432.8z")
        //     .style("fill", "#957660");

        // waterflow.mainGroup.append("path") // shadow land
        //     .attr("d", "M511,450H65c0,0,0-151,0-189.3c180,53.4,347-23.4,446,0C511,377.8,511,507.8,511,507.8z")
        //     .style("fill", "#74584A");

        waterflow.mainGroup.append("use")
            .attr("xlink:href", "#waterfall");

        waterflow.rippleMasked = waterflow.mainGroup.append("g")
            .attr("clip-path", "url(#waterfallMask)");

        waterflow.rippleMasked.append("path")
            .attr("class", "ripple")
            .attr("d", "M557.5,108c-23.8,0-36.6-6.8-46.9-12.4c-8.3-4.4-14.3-7.6-28.1-7.6s-19.8,3.2-28.1,7.6c-10.3,5.5-23.2,12.4-46.9,12.4s-36.6-6.8-46.9-12.4c-8.3-4.4-14.3-7.6-28.1-7.6s-19.8,3.2-28.1,7.6c-10.3,5.5-23.2,12.4-46.9,12.4c-23.7,0-36.8-6.8-47.2-12.4C202,91.2,196,88,182,88V48c24,0,36.8,6.8,47.2,12.4c8.3,4.4,14.5,7.6,28.2,7.6c13.7,0,19.8-3.2,28.1-7.6c10.3-5.5,23.2-12.4,46.9-12.4c23.8,0,36.6,6.8,46.9,12.4c8.3,4.4,14.3,7.6,28.1,7.6c13.8,0,19.8-3.2,28.1-7.6c10.3-5.5,23.2-12.4,46.9-12.4s36.6,6.8,46.9,12.4c8.3,4.4,14.3,7.6,28.1,7.6s19.5-3.2,27.8-7.6C595.7,54.8,609,48,632,48v40c-13,0-19.5,3.2-27.8,7.6C593.8,101.2,581.2,108,557.5,108z")
            .style("fill", "#6ADFF7");

        waterflow.maskedFoam = waterflow.mainGroup.append("g")
            .attr("clip-path", "url(#mainMask)");

        waterflow.whiteFoamGroup = waterflow.maskedFoam.append("g")
            .attr("class", "whiteFoamGroup");

        waterflow.whiteFoamGroup.selectAll("use")
            .data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
            .enter()
            .append("use")
            .attr("xlink:href", "#foam");

        waterflow.lightBlueFoamGroup = waterflow.maskedFoam.append("g")
            .attr("class", "lightBlueFoamGroup");

        waterflow.lightBlueFoamGroup.selectAll("use")
            .data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
            .enter()
            .append("use")
            .attr("xlink:href", "#foam");

        waterflow.darkBlueFoamGroup = waterflow.maskedFoam.append("g")
            .attr("class", "darkBlueFoamGroup");

        waterflow.darkBlueFoamGroup.selectAll("use")
            .data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
            .enter()
            .append("use")
            .attr("xlink:href", "#foam");

        waterflow.svgGroup.append("circle")
            .attr("class", "inner")
            .attr({ cx: 293, cy: 278.7, r: 138 })
            .style("fill", "none")
            .style("stroke", "#D17454")
            .style("stroke-width", 12)
            .style("stroke-miterlimit", 10);

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

        var ripple = document.querySelector(".ripple"),
            whiteFoamGroup = document.querySelectorAll(".whiteFoamGroup use"),
            lightBlueFoamGroup = document.querySelectorAll(".lightBlueFoamGroup use"),
            darkBlueFoamGroup = document.querySelectorAll(".darkBlueFoamGroup use");

        var forEach = function (array, callback, scope) {
            for (var i = 0; i < array.length; i++) {
                callback.call(scope, i, array[i]); // passes back stuff we need
            }
        };

        var foamTl = new TimelineMax({
            repeat: -1,
            yoyo: true,
            repeatDelay: 1
        });

        var rippleTl = new TimelineMax({
            repeat: -1,
            onRepeat: changeRipple
        });

        rippleTl.to(ripple, 2.7, {
            y: 320,
            x: -225,
            ease: Linear.easeNone
        })

        animateFoam(whiteFoamGroup, "#FFF", [-5, 1], 0.6)
        animateFoam(lightBlueFoamGroup, "#7EE7F9", [28, 40], 2)
        animateFoam(darkBlueFoamGroup, "#52E1F1", [63, 73], 3)
        foamTl.timeScale(1)
        
        var myTimeline = new TimelineMax({
            repeat: -1,
            repeatDelay: 1
        });

        myTimeline.timeScale(6)
        myTimeline.add(foamTl, 0);
        myTimeline.add(rippleTl, 0);

        function animateFoam(el, col, range, scaleMax) {
            forEach(el, function (e, c) {
                var initScale = Math.random() + scaleMax;

                TweenMax.set(c, {
                    x: e * 23,
                    scale: initScale,
                    y: randomBetween(range[0], range[1]),
                    transformOrigin: "50% 50%",
                    fill: col
                });

                var t = new TimelineMax({
                    repeat: -1,
                    yoyo: true
                });

                t.to(c, Math.random() * 3 + 3, {
                    scale: 2,
                    ease: Sine.easeInOut
                }).to(c, Math.random() * 3 + 3, {
                    scale: initScale,
                    ease: Sine.easeInOut
                });

                foamTl.add(t, e / 100);
            });
        }

        function changeRipple() {
            ripple.getAttribute("fill") === "#98E9FA" ? ripple.setAttribute("fill", "#6ADFF7") : ripple.setAttribute("fill", "#98E9FA");
        }

        function randomBetween(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        TweenMax.set("svg", {
            visibility: "visible"
        });

        deferred.resolve();
        return deferred.promise();
    }

    /** @function update
     *  @description Update the whole svg.
     *  @param {Number} value - current value, used to rise the wave
     *  @param {Boolean} isOpen - whether or not the gate is open
    */
    function update(value, isOpen) {

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
}