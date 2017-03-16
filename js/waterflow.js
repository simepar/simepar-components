"use strict";

function loadWaterflowSettings() {
    return {
        minValue: 0,    // min value. Used to calculate scales and associated stuff.
        maxValue: 100,  // max value. Used to calculate scales and associated stuff.
        scale: 1,       // // scale of the svg's parent div. Shouldn't be used. It is an alternative way to set size.
        waterfallColor: "#7EE7F9",
        firstWaveColor: "#e7f3f9", // The color of the fill wave.
        secondWaveColor: "#7EE7F9",
        thirdWaveColor: "#52E1F1",
        waveOpacity: 0.9, // the wave opacity
        circleFillGap: 0.03, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor: "#178BCA", // color of the outter circle, the one that is behind all elements.''
        circleStroke: "none", // stroke of the outter circle, the one that is behind all elements.
        circleThickness: 0.03, // The outer circle thickness as a percentage of it's radius.
        rippleColor1: "#98E9FA",
        rippleColor2: "#6ADFF7",
        topBackgroundColor: "#a6a6a6",
        bottomBackgroundColor: "#808080",
    };
}

function WaterflowElement(elementId, value, config) {
    var waterflow = this;

    // properties
    waterflow.id = elementId;
    waterflow.config = config == null ? loadWaterflowSettings() : config;
    waterflow.value = value;

    // functions
    waterflow.createSVG = createSVG;
    waterflow.animateWaterfall = animateWaterfall;
    waterflow.update = update;

    /////////////////////////////////////

    // creates and displays the svg fully working
    (function() {
        waterflow.createSVG().then(function() {
            waterflow.animateWaterfall().then(function() { 

            });
        });
    })();

    /** @function createSVG
     *  @description Creates the main svg and associated elements.
    */
    function createSVG() {
        var deferred = $.Deferred();
        var container = d3.select("#" + waterflow.id);

        var width = 315,
            height = 315;

        var config = waterflow.config;

        // Creates the svg and configure its basic properties.
        var svg = container.style("transform", "scale(" + config.scale + ")")
            .append("svg")
            .attr("id", "waterflow-" + waterflow.id)
            .attr({ width: width, height: height })
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height)
            .style("max-width", "100%")
            .style("height", "100%")
            .style("visibility", "hidden");

        // Creates the group where every element will be appended in.
        svg.waterfallGroup = svg.append("g")
            .attr("class", "waterfallGroup")
            .attr("transform", "translate(-135, -120)");

        // Creating defs.
        svg.defs = svg.waterfallGroup.append("defs");

        // Used to generate the inner and outer circles.
        var radius = Math.min(width, height) / 2;
        var circleThickness = config.circleThickness * radius;
        var circleFillGap = config.circleFillGap * radius;
        var fillCircleMargin = circleThickness + circleFillGap;
        var fillCircleRadius = radius - fillCircleMargin;

        // Scales for drawing the outer circle.
        var scaleCircleX = d3.scale.linear().domain([0, 1]).range([0, 2 * Math.PI]);
        var scaleCircleY = d3.scale.linear().domain([0, radius]).range([0, radius]);

        var circleArc = d3.svg.arc()
            .startAngle(scaleCircleX(0))
            .endAngle(scaleCircleX(1))
            .outerRadius(scaleCircleY(radius))
            .innerRadius(scaleCircleY(radius - circleThickness));
        
        // Draw the outer circle.
        svg.append("path")
        .attr("id", "outerCircle-" + waterflow.id)
            .attr("d", circleArc)
            .attr("transform", "translate(" + radius + "," + radius + ")")
            .style("fill", config.circleColor);

        // Draw the inner circle.
        svg.defs.append("circle")
            .attr("id", "innerCircle-" + waterflow.id)
            .attr("cx", radius)
            .attr("cy", radius)
            .attr("r", fillCircleRadius)
            .style("fill", "none")
            .style("stroke", config.circleStroke)
            .attr("transform", "translate(135, 120)");

        // Draw the waterfall element.
        svg.defs.append("path")
            .attr("id", "waterfall-" + waterflow.id)
            .attr("d", "M338.5,116.9c8.5,0,7.3,3.9,15.8,7.3c4.9,1.9,12.2,1.8,16,6.5c3.2,3.9,1.9,10.4,2.6,17 c1,9.7,7.1,34.4,9.3,63.4c1.6,20.7-0.6,43.7,0.9,64.2c2.7,35.3,13.6,32.4,8.7,64c-2.8,18.2-11.6,11.4-30.5,22.1 c-9.1,5.2-19.4,13.4-33.5,15.5c-10.7,1.6-22.9-2.2-36.7-4.3c-12.1-1.8-23.60.1-33.1-2.1c-12.7-2.9-22.2-9.7-30.6-12.5c-21.4-7.2-29.4,5.1-32.6-11c-6.2-31.6,5.7-28.9,7.7-64.6c1.2-20.5-1.6-43.5-0.6-64.5c1.3-27.3,6.3-51.5,6.3-64.2c0.6-7.8-1.2-14.9,1.5-19.6c3.8-6.5,11.6-7.6,16.8-9.9c9.6-4.2,8.5-7.3,18.2-7c15.6,0.4,15.5,4,31.1,4c15.6,0,15.5-3.3,31.1-4C322.9,116.2,322.9,116.9,338.5,116.9z")
            .style("fill", config.waterfallColor);

        // Appends the all the elements to fill inside the inner circle
        svg.defs.append("clipPath")
            .attr("id", "mainMask-" + waterflow.id)
            .append("use")
                .attr("xlink:href", "#innerCircle-" + waterflow.id);

        svg.defs.append("clipPath")
            .attr("id", "waterfallMask-" + waterflow.id)
            .append("use")
                .attr("xlink:href", "#waterfall-" + waterflow.id);

        // Circle that will be used in all waves.
        svg.defs.append("circle")
            .attr("id", "foam-" + waterflow.id)
            .attr("cx", 180)
            .attr("cy", 333.7)
            .attr("r", 17.7);

        svg.mainGroup = svg.waterfallGroup.append("g")
            .attr("class", "mainGroup")
            .attr("clip-path", "url(#mainMask-" + waterflow.id + ")");

        // Draw  the top part of the background.
        svg.mainGroup.append("path")
            .attr("d", "M464,372H124c0,0,0-151,0-189.3c28.3-28.3,340,0,340,0V432.8z")
            .attr("transform", "translate(0, -30)")
            .style("fill", config.topBackgroundColor);

        // Draw  the bottom part of the background.
        svg.mainGroup.append("path") 
            .attr("d", "M511,450H65c0,0,0-151,0-189.3c180,53.4,347-23.4,446,0C511,377.8,511,507.8,511,507.8z")
            .attr("transform", "translate(0, -20)")
            .style("fill", config.bottomBackgroundColor);

        // Now it is actually drew the waterfall.
        svg.mainGroup.append("use")
            .attr("xlink:href", "#waterfall-" + waterflow.id);

        svg.rippleMasked = svg.mainGroup.append("g")
            .attr("clip-path", "url(#waterfallMask-" + waterflow.id + ")");

        // Draw the ripple that is animated in the waterfall.
        svg.rippleMasked.append("path")
            .attr("class", "ripple")
            .attr("d", "M557.5,108c-23.8,0-36.6-6.8-46.9-12.4c-8.3-4.4-14.3-7.6-28.1-7.6s-19.8,3.2-28.1,7.6c-10.3,5.5-23.2,12.4-46.9,12.4s-36.6-6.8-46.9-12.4c-8.3-4.4-14.3-7.6-28.1-7.6s-19.8,3.2-28.1,7.6c-10.3,5.5-23.2,12.4-46.9,12.4c-23.7,0-36.8-6.8-47.2-12.4C202,91.2,196,88,182,88V48c24,0,36.8,6.8,47.2,12.4c8.3,4.4,14.5,7.6,28.2,7.6c13.7,0,19.8-3.2,28.1-7.6c10.3-5.5,23.2-12.4,46.9-12.4c23.8,0,36.6,6.8,46.9,12.4c8.3,4.4,14.3,7.6,28.1,7.6c13.8,0,19.8-3.2,28.1-7.6c10.3-5.5,23.2-12.4,46.9-12.4s36.6,6.8,46.9,12.4c8.3,4.4,14.3,7.6,28.1,7.6s19.5-3.2,27.8-7.6C595.7,54.8,609,48,632,48v40c-13,0-19.5,3.2-27.8,7.6C593.8,101.2,581.2,108,557.5,108z")
            .attr("fill", config.rippleColor1);

        // Creates a group for the waves
        svg.maskedFoam = svg.mainGroup.append("g")
            .attr("clip-path", "url(#mainMask-" + waterflow.id + ")");

        // Data used to create 12 different circles. Could be anything inside the array as long as its size remain 12.
        // array.length = number of circles.
        var dataFoam = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        // First wave group.
        svg.whiteFoamGroup = svg.maskedFoam.append("g")
            .attr("class", "whiteFoamGroup")
            .attr("transform", "translate(-10, 0)");

        // Appendding all the circles.
        svg.whiteFoamGroup.selectAll("use")
            .data(dataFoam).enter()
            .append("use")
                .attr("xlink:href", "#foam-" + waterflow.id);

        // Second wave group.
        svg.lightBlueFoamGroup = svg.maskedFoam.append("g")
            .attr("class", "lightBlueFoamGroup");
        svg.lightBlueFoamGroup.selectAll("use")
            .data(dataFoam).enter()
            .append("use")
                .attr("xlink:href", "#foam-" + waterflow.id);

        // Second wave group.
        svg.darkBlueFoamGroup = svg.maskedFoam.append("g")
            .attr("class", "darkBlueFoamGroup")
            .attr("transform", "translate(0, 10)");
        svg.darkBlueFoamGroup.selectAll("use")
            .data(dataFoam).enter()
            .append("use")
                .attr("xlink:href", "#foam-" + waterflow.id);

        // Appends another inner circle so that it overlays all elements and create a border (stroke).
        svg.append("use")
            .attr("xlink:href", "#innerCircle-" + waterflow.id)
            .attr("transform", "translate(-135, -120)")
            .style("stroke", config.circleStroke);

        waterflow.svg = svg;

        deferred.resolve();
        return deferred.promise();
    }

    /** @function animateWaterfall
     *  @description Makes the animation of the ripple and the waves.
    */
    function animateWaterfall() {
        var deferred = $.Deferred();

        var config = waterflow.config,
            value = waterflow.value;

        // Making sure the current value is between min and max value.
        if (value > config.maxValue) value = config.maxValue;
        if (value < config.minValue) value = config.minValue;

        var ripple = document.querySelector(".ripple"),
            whiteFoamGroup = document.querySelectorAll(".whiteFoamGroup use"),
            lightBlueFoamGroup = document.querySelectorAll(".lightBlueFoamGroup use"),
            darkBlueFoamGroup = document.querySelectorAll(".darkBlueFoamGroup use");

        var foamTl = new TimelineMax({
            repeat: -1,
            yoyo: true,
            repeatDelay: 1
        });

        var rippleTl = new TimelineMax({
            repeat: -1,
            onRepeat: changeRipple
        });

        // Creates a speed scale so that the ripple will go faster/slower based on the current value.
        // 10 = slow ~ 2.5 = fast
        var speedScale = d3.scale.linear().domain([config.minValue, config.maxValue]).range([10, 2.5]);
        var speed = speedScale(value);

        rippleTl.to(ripple, speed, {
            y: 320,
            x: -225,
            ease: Linear.easeNone
        });

        animateFoam(whiteFoamGroup, config.firstWaveColor, [-5, 1], 0.6);
        animateFoam(lightBlueFoamGroup, config.secondWaveColor, [28, 40], 2);
        animateFoam(darkBlueFoamGroup, config.thirdWaveColor, [63, 73], 3);
        foamTl.timeScale(1);
        
        var myTimeline = new TimelineMax({
            repeat: -1,
            repeatDelay: 1
        });

        myTimeline.timeScale(6);
        myTimeline.add(foamTl, 0);
        myTimeline.add(rippleTl, 0);

        //////////////////////////////
        ////// helper functions //////
        //////////////////////////////

        function animateFoam(el, color, range, scaleMax) {
            forEach(el, function (e, c) {
                var initScale = Math.random() + scaleMax;

                TweenMax.set(c, {
                    x: e * 23,
                    scale: initScale,
                    y: randomBetween(range[0], range[1]),
                    transformOrigin: "50% 50%",
                    fill: color
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
            ripple.getAttribute("fill") === config.rippleColor1 ? 
                ripple.setAttribute("fill", config.rippleColor2) : ripple.setAttribute("fill", config.rippleColor1);
        }

        function randomBetween(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        function forEach(array, callback, scope) {
            for (var i = 0; i < array.length; i++)
                callback.call(scope, i, array[i]); // passes back stuff we need
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
    */
    function update(value) {
        var config = waterflow.config;
        waterflow.value = value;

        if (value > config.maxValue) waterflow.value = config.maxValue;
        if (value < config.minValue) waterflow.value = config.minValue;

        // remove the ripples 
        d3.selectAll(".ripple").remove();

        // creates new ripples
        waterflow.svg.rippleMasked.append("path")
            .attr("class", "ripple")
            .attr("d", "M557.5,108c-23.8,0-36.6-6.8-46.9-12.4c-8.3-4.4-14.3-7.6-28.1-7.6s-19.8,3.2-28.1,7.6c-10.3,5.5-23.2,12.4-46.9,12.4s-36.6-6.8-46.9-12.4c-8.3-4.4-14.3-7.6-28.1-7.6s-19.8,3.2-28.1,7.6c-10.3,5.5-23.2,12.4-46.9,12.4c-23.7,0-36.8-6.8-47.2-12.4C202,91.2,196,88,182,88V48c24,0,36.8,6.8,47.2,12.4c8.3,4.4,14.5,7.6,28.2,7.6c13.7,0,19.8-3.2,28.1-7.6c10.3-5.5,23.2-12.4,46.9-12.4c23.8,0,36.6,6.8,46.9,12.4c8.3,4.4,14.3,7.6,28.1,7.6c13.8,0,19.8-3.2,28.1-7.6c10.3-5.5,23.2-12.4,46.9-12.4s36.6,6.8,46.9,12.4c8.3,4.4,14.3,7.6,28.1,7.6s19.5-3.2,27.8-7.6C595.7,54.8,609,48,632,48v40c-13,0-19.5,3.2-27.8,7.6C593.8,101.2,581.2,108,557.5,108z")
            .attr("fill", config.rippleColor1);
        
        var ripple = document.querySelector(".ripple");
        var rippleTl = new TimelineMax({
            repeat: -1,
            onRepeat: function() {
                ripple.getAttribute("fill") === config.rippleColor1 ? 
                ripple.setAttribute("fill", config.rippleColor2) : ripple.setAttribute("fill", config.rippleColor1);
            }
        });

        // Creates a speed scale so that the ripple will go faster/slower based on the current value.
        // 10 = slow ~ 2.5 = fast
        var speedScale = d3.scale.linear().domain([config.minValue, config.maxValue]).range([10, 2.5]);
        var speed = speedScale(value);

        rippleTl.to(ripple, speed, {
            y: 320,
            x: -225,
            ease: Linear.easeNone
        });

        var myTimeline = new TimelineMax({
            repeat: -1,
            repeatDelay: 1
        });

        myTimeline.timeScale(6);
        myTimeline.add(rippleTl, 0);
    }
}

// "use strict";

// function loadWaterflowSettings() {
//     return {
//         minValue: 0,    // min value. Used to calculate scales and associated stuff.
//         maxValue: 100,  // max value. Used to calculate scales and associated stuff.
//         scale: 1,       // // scale of the svg's parent div. Shouldn't be used. It is an alternative way to set size.
//         waterfallColor: "#7EE7F9",
//         firstWaveColor: "#e7f3f9", // The color of the fill wave.
//         secondWaveColor: "#7EE7F9",
//         thirdWaveColor: "#52E1F1",
//         waveOpacity: 0.9, // the wave opacity
//         circleFillGap: 0.03, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
//         circleColor: "#178BCA", // color of the outter circle, the one that is behind all elements.''
//         circleStroke: "black", //"#178BCA",   // stroke of the outter circle, the one that is behind all elements.
//         circleThickness: 0.03, // The outer circle thickness as a percentage of it's radius.
//         rippleColor1: "#98E9FA",
//         rippleColor2: "#6ADFF7",
//         topBackgroundColor: "#a6a6a6",
//         bottomBackgroundColor: "#808080",
//     };
// }

// function WaterflowElement(elementId, value, config) {
//     var waterflow = this;

//     // properties
//     waterflow.id = elementId;
//     waterflow.config = config == null ? loadWaterflowSettings() : config;
//     waterflow.value = value;

//     // functions
//     waterflow.createSVG = createSVG;
//     waterflow.createWaterfall = createWaterfall;
//     waterflow.update = update;

//     /////////////////////////////////////

//     // creates and displays the svg fully working
//     (function () {
//         waterflow.createSVG().then(function () {
//             waterflow.createWaterfall().then(function () {
//                 waterflow.svg
//                     .style("max-width", "100%")
//                     .style("height", "100%");
//             });
//         });
//     })();

//     /** @function createSVG
//      *  @description Creates the main svg and associated elements.
//     */
//     function createSVG() {
//         var deferred = $.Deferred();
//         var container = d3.select("#" + waterflow.id);

//         var width = 315,
//             height = 315;

//         var config = waterflow.config;

//         // appends an svg to the div
//         waterflow.svg = container.style("transform", "scale(" + config.scale + ")")
//             .append("svg")
//             .attr("id", "waterflow-" + waterflow.id)
//             .attr({ width: width, height: height })
//             .attr("preserveAspectRatio", "xMinYMin meet")
//             .attr("viewBox", "0 0 " + width + " " + height);

//         // Center the gauge within the parent SVG.
//         var radius = Math.min(width, height) / 2;
//         var locationX = parseInt(waterflow.svg.style("width")) / 2 - radius;
//         var locationY = parseInt(waterflow.svg.style("height")) / 2 - radius;

//         // Scales for drawing the outer circle.
//         var scaleCircleX = d3.scale.linear().domain([0, 1]).range([0, 2 * Math.PI]);
//         var scaleCircleY = d3.scale.linear().domain([0, radius]).range([0, radius]);

//         // Used to create the inner and outer circles
//         var circleThickness = config.circleThickness * radius;
//         var circleFillGap = config.circleFillGap * radius;
//         var fillCircleMargin = circleThickness + circleFillGap;
//         var fillCircleRadius = radius - fillCircleMargin;
//         var circleArc = d3.svg.arc()
//             .startAngle(scaleCircleX(0))
//             .endAngle(scaleCircleX(1))
//             .outerRadius(scaleCircleY(radius))
//             .innerRadius(scaleCircleY(radius - circleThickness));

//         waterflow.svg.mainGroup = waterflow.svg.append("g")
//             .attr("class", "mainGroup")
//             .attr("transform","translate(" + locationX + "," + locationY + ")");

//         waterflow.svg.defs = waterflow.svg.mainGroup.append("defs");

//         // Draw the outer circle.
//         waterflow.svg.defs.append("path")
//             .attr("id", "outerCircle-" + waterflow.id)
//             .attr("d", circleArc)
//             .attr("transform", "translate(" + radius + "," + radius + ")")
//             .style("fill", config.circleColor);

//         // Draw the inner circle
//         waterflow.svg.defs.append("circle")
//             .attr("id", "innerCircle-" + waterflow.id)
//             .attr("cx", radius)
//             .attr("cy", radius)
//             .attr("r", fillCircleRadius)
//             .style("fill", "none")
//             .style("stroke", config.circleStroke);

//         // Draw the waterfall
//         waterflow.svg.defs.append("path")
//             .attr("id", "waterfall-" + waterflow.id)
//             .attr("d", "M338.5,116.9c8.5,0,7.3,3.9,15.8,7.3c4.9,1.9,12.2,1.8,16,6.5c3.2,3.9,1.9,10.4,2.6,17 c1,9.7,7.1,34.4,9.3,63.4c1.6,20.7-0.6,43.7,0.9,64.2c2.7,35.3,13.6,32.4,8.7,64c-2.8,18.2-11.6,11.4-30.5,22.1 c-9.1,5.2-19.4,13.4-33.5,15.5c-10.7,1.6-22.9-2.2-36.7-4.3c-12.1-1.8-23.60.1-33.1-2.1c-12.7-2.9-22.2-9.7-30.6-12.5c-21.4-7.2-29.4,5.1-32.6-11c-6.2-31.6,5.7-28.9,7.7-64.6c1.2-20.5-1.6-43.5-0.6-64.5c1.3-27.3,6.3-51.5,6.3-64.2c0.6-7.8-1.2-14.9,1.5-19.6c3.8-6.5,11.6-7.6,16.8-9.9c9.6-4.2,8.5-7.3,18.2-7c15.6,0.4,15.5,4,31.1,4c15.6,0,15.5-3.3,31.1-4C322.9,116.2,322.9,116.9,338.5,116.9z")
//             .attr("transform", "translate(-135, -110)")
//             .style("fill", config.waterfallColor);

//         waterflow.svg.defs.append("clipPath")
//             .attr("id", "mainMask-" + waterflow.id)
//             .append("use")
//                 .attr("xlink:href", "#innerCircle-" + waterflow.id);

//         waterflow.svg.defs.append("clipPath")
//             .attr("id", "waterfallMask-" + waterflow.id)
//             .append("use")
//                 .attr("xlink:href", "#waterfall");

//         waterflow.svg.defs.append("circle")
//             .attr("id", "foam-" + waterflow.id)
//             .attr("cx", 180)
//             .attr("cy", 333.7)
//             .attr("r", 17.7);

//         waterflow.svg.mainGroup.append("use")
//             .attr("xlink:href", "#outerCircle-" + waterflow.id);

//         // waterflow.svg.mainGroup.append("use")
//         //     .attr("xlink:href", "#innerCircle-" + waterflow.id);

//         deferred.resolve();
//         return deferred.promise();
//     }

//     /** @function update
//      *  @description Update the whole svg.
//      *  @param {Number} value - current value
//     */
//     function update(value) {
//         waterflow.value = value;

//         if (value > config.maxValue) waterflow.value = config.maxValue;
//         if (value < config.minValue) waterflow.value = config.minValue;

//         // remove the ripples 
//         d3.selectAll(".ripple").remove();

//         // creates new ripples
//         waterflow.svg.rippleMasked.append("path")
//             .attr("class", "ripple")
//             .attr("d", "M557.5,108c-23.8,0-36.6-6.8-46.9-12.4c-8.3-4.4-14.3-7.6-28.1-7.6s-19.8,3.2-28.1,7.6c-10.3,5.5-23.2,12.4-46.9,12.4s-36.6-6.8-46.9-12.4c-8.3-4.4-14.3-7.6-28.1-7.6s-19.8,3.2-28.1,7.6c-10.3,5.5-23.2,12.4-46.9,12.4c-23.7,0-36.8-6.8-47.2-12.4C202,91.2,196,88,182,88V48c24,0,36.8,6.8,47.2,12.4c8.3,4.4,14.5,7.6,28.2,7.6c13.7,0,19.8-3.2,28.1-7.6c10.3-5.5,23.2-12.4,46.9-12.4c23.8,0,36.6,6.8,46.9,12.4c8.3,4.4,14.3,7.6,28.1,7.6c13.8,0,19.8-3.2,28.1-7.6c10.3-5.5,23.2-12.4,46.9-12.4s36.6,6.8,46.9,12.4c8.3,4.4,14.3,7.6,28.1,7.6s19.5-3.2,27.8-7.6C595.7,54.8,609,48,632,48v40c-13,0-19.5,3.2-27.8,7.6C593.8,101.2,581.2,108,557.5,108z")
//             .attr("fill", waterflow.config.rippleColor1);

//         animateWaterfall(waterflow.config, waterflow.value);
//     }

//     function animateWaterfall(config, value) {
//         var whiteFoamGroup = document.querySelectorAll(".whiteFoamGroup use");
//         var lightBlueFoamGroup = document.querySelectorAll(".lightBlueFoamGroup use");
//         var darkBlueFoamGroup = document.querySelectorAll(".darkBlueFoamGroup use");

//         var foamTl = new TimelineMax({
//             repeat: -1,
//             yoyo: true,
//             repeatDelay: 1
//         });

//         var ripple = document.querySelector(".ripple");
//         var rippleTl = new TimelineMax({
//             repeat: -1,
//             onRepeat: changeRipple
//         });

//         var speedScale = d3.scale.linear().domain([config.minValue, config.maxValue]).range([10, 2.5]);
//         var speed = speedScale(value);

//         rippleTl.to(ripple, speed, {
//             y: 320,
//             x: -225,
//             ease: Linear.easeNone
//         });

//         animateFoam(whiteFoamGroup, config.firstWaveColor, [-5, 1], 0.6);
//         animateFoam(lightBlueFoamGroup, config.secondWaveColor, [28, 40], 2);
//         animateFoam(darkBlueFoamGroup, config.thirdWaveColor, [63, 73], 3);
//         foamTl.timeScale(1);

//         var myTimeline = new TimelineMax({
//             repeat: -1,
//             repeatDelay: 1
//         });
        
//         myTimeline.timeScale(6); // also possible to change the speed here, but it makes more sense to do it in the ripple TimelineMax
//         myTimeline.add(foamTl, 0);
//         myTimeline.add(rippleTl, 0);

//         TweenMax.set("svg", {
//             visibility: "visible"
//         });

//         //////////////////////////////////

//         function changeRipple() {
//             ripple.getAttribute("fill") == config.rippleColor1 ? 
//                 ripple.setAttribute("fill", config.rippleColor2) : ripple.setAttribute("fill", config.rippleColor1);
//         }

//         function animateFoam(el, color, range, scaleMax) {
//             forEach(el, function (e, c) {
//                 var initScale = Math.random() + scaleMax;

//                 TweenMax.set(c, {
//                     x: e * 23,
//                     scale: initScale,
//                     y: randomBetween(range[0], range[1]),
//                     transformOrigin: "50% 50%",
//                     fill: color
//                 });

//                 var t = new TimelineMax({
//                     repeat: -1,
//                     yoyo: true
//                 });

//                 t.to(c, Math.random() * 3 + 3, {
//                     scale: 2,
//                     ease: Sine.easeInOut
//                 }).to(c, Math.random() * 3 + 3, {
//                     scale: initScale,
//                     ease: Sine.easeInOut
//                 });

//                 foamTl.add(t, e / 100);
//             });
//         }

//         function forEach(array, callback, scope) {
//             for (var i = 0; i < array.length; i++)
//                 callback.call(scope, i, array[i]); // passes back stuff we need
//         }

//         function randomBetween(min, max) {
//             return Math.floor(Math.random() * (max - min + 1) + min);
//         }
//     }

//     function createWaterfall() {
//         var deferred = $.Deferred();

//         var svg = waterflow.svg,
//             config = waterflow.config,
//             value = waterflow.value;

//         svg.waterfallGroup = svg.mainGroup.append("g")
//             .attr("class", "waterfallGroup")
//             .attr("clip-path", "url(#mainMask-" + waterflow.id + ")");

//         svg.waterfallGroup.append("path") // land
//             .attr("d", "M464,372H124c0,0,0-151,0-189.3c28.3-28.3,340,0,340,0V432.8z")
//             .attr("transform", "translate(-135, -165)")
//             .style("fill", config.topBackgroundColor);

//         svg.waterfallGroup.append("path") // shadow land
//             .attr("d", "M511,450H65c0,0,0-151,0-189.3c180,53.4,347-23.4,446,0C511,377.8,511,507.8,511,507.8z")
//             .attr("transform", "translate(-100, -120)")
//             .style("fill", config.bottomBackgroundColor);

//         svg.waterfallGroup.append("use")
//             .attr("xlink:href", "#waterfall-" + waterflow.id);

//         svg.rippleMasked = svg.waterfallGroup.append("g")
//             .attr("clip-path", "url(#waterfallMask-" + waterflow.id + ")");

//         svg.rippleMasked.append("path")
//             .attr("class", "ripple")
//             .attr("d", "M557.5,108c-23.8,0-36.6-6.8-46.9-12.4c-8.3-4.4-14.3-7.6-28.1-7.6s-19.8,3.2-28.1,7.6c-10.3,5.5-23.2,12.4-46.9,12.4s-36.6-6.8-46.9-12.4c-8.3-4.4-14.3-7.6-28.1-7.6s-19.8,3.2-28.1,7.6c-10.3,5.5-23.2,12.4-46.9,12.4c-23.7,0-36.8-6.8-47.2-12.4C202,91.2,196,88,182,88V48c24,0,36.8,6.8,47.2,12.4c8.3,4.4,14.5,7.6,28.2,7.6c13.7,0,19.8-3.2,28.1-7.6c10.3-5.5,23.2-12.4,46.9-12.4c23.8,0,36.6,6.8,46.9,12.4c8.3,4.4,14.3,7.6,28.1,7.6c13.8,0,19.8-3.2,28.1-7.6c10.3-5.5,23.2-12.4,46.9-12.4s36.6,6.8,46.9,12.4c8.3,4.4,14.3,7.6,28.1,7.6s19.5-3.2,27.8-7.6C595.7,54.8,609,48,632,48v40c-13,0-19.5,3.2-27.8,7.6C593.8,101.2,581.2,108,557.5,108z")
//             .style("fill", config.rippleColor1);

//         svg.maskedFoam = svg.waterfallGroup.append("g")
//             .attr("clip-path", "url(#mainMask-" + waterflow.id + ")")
//             .attr("transform", "translate(-145, -90)");

//         svg.whiteFoamGroup = svg.maskedFoam.append("g")
//             .attr("class", "whiteFoamGroup");

//         var bubbles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

//         svg.whiteFoamGroup.selectAll("use")
//             .data(bubbles)
//             .enter()
//             .append("use")
//                 .attr("xlink:href", "#foam-" + waterflow.id);

//         svg.lightBlueFoamGroup = svg.maskedFoam.append("g")
//             .attr("class", "lightBlueFoamGroup");

//         svg.lightBlueFoamGroup.selectAll("use")
//             .data(bubbles)
//             .enter()
//             .append("use")
//                 .attr("xlink:href", "#foam-" + waterflow.id);

//         svg.darkBlueFoamGroup = svg.maskedFoam.append("g")
//             .attr("class", "darkBlueFoamGroup");

//         svg.darkBlueFoamGroup.selectAll("use")
//             .data(bubbles)
//             .enter()
//             .append("use")
//                 .attr("xlink:href", "#foam-" + waterflow.id);

//         animateWaterfall(config, value);

//         deferred.resolve();
//         return deferred.promise();
//     }
// }