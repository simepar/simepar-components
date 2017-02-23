"use strict";

function loadGateSettings() {
    return {
        minValue: 0,    // min value. Used to calculate scales and associated stuff.
        maxValue: 100,  // max value. Used to calculate scales and associated stuff.
        scale: 1,       // // scale of the svg's parent div. Shouldn't be used. It is an alternative way to set size.
        waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
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
        // textSize: 0.4, // The relative height of the text to display in the wave circle. 1 = 50%
        // decimalPlaces: 2, // how many decimal places it should be displayed
        // minTextColor: "#045681", // the color of the text for the minimum value
        // maxTextColor: "#045681", // the color of the text for the maximum value
        // valueTextColor: "#045681", // The color of the value text when the wave does not overlap it.
        // waveTextColor: "#A4DBf8", // The color of the value text when the wave overlaps it.
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
        fallingWaterOpacity: 0.9,     // opacity of the water that is falling from the dam's gate. 
        fallingWaterStroke: "#178BCA",   // stroke of the falling water. No need to set it up, but still an option.
        fallingWaterThickness: 1,     // stroke-width of the falling water. No need to set it up, but still an option.
        gateColor: "#708090",         // color of the "gate" where the water comes from.
        gapColor: "#ACB3BA",          // color of the "gap" between dams.
    };
}

function GateElement(selector, value, config, isOpen) {
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
    gate.update = update;

    /////////////////////////////////////
    
    // creates and displays the svg fully working
    (function() {
        gate.createSVG().then(function () {
            gate.createGate().then(function () {
                gate.createWave(gate.config, gate.value).then(function() {
                    // fit svg to its container div
                    gate.svg.attr({ width: "100%", height: "100%" });
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

        var width = 375, 
            height = 315;

        // appends an svg to the div
        gate.svg = container.style("transform", "scale("+gate.config.scale+")")
            .append("svg")
                .attr("id", "gate-svg")
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
            .attr("transform", "translate(-65, -95)");

        // // appending piles
        gate.svg.fenceGroup.selectAll("path.pile")
            .data(piles).enter()
            .append("path")
                .attr("d", function(d) { return d; })
                .style("fill", gate.config.pileColor)
                .style("stroke", gate.config.pileStroke)
                .style("stroke-width", gate.config.pileThickness);

        // appending fences
        gate.svg.fenceGroup.selectAll("path.fence")
            .data(fences).enter()
            .append("path")
                .attr("d", function(d) { return d; })
                .style("fill", gate.config.fenceColor)
                .style("stroke", gate.config.fenceStroke)
                .style("stroke-width", gate.config.fenceThickness);

        // appending semi-circle background (under the fence)
        gate.svg.append("rect")
            .attr("id", "barrier")
            .attr({ width: width, height: (height-100) })
            .attr("y", 100)
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

        var points = [{"x": 0.03, "y": 0.11},
            {"x": -0.05, "y": 1.0},
            {"x": 0.35, "y": 1},
            {"x": 0.27, "y": 0.11}];

        var width = parseInt(gate.svg.style("width"));
        var height = parseInt(gate.svg.style("height"));

        // scales to create the dam element
        var scaleX = d3.scale.linear().domain([0,1]).range([0, width]);
        var scaleY = d3.scale.linear().domain([0,1]).range([0, height]);

        var translate = "translate("+width/2+","+height/2+")";

        // gate group
        gate.svg.damGroup = gate.svg.append("g").attr("id", "damGroup")
            .attr("transform", "translate("+ width/2.83 +", 0)");
        
        // dam element
        gate.svg.damGroup.selectAll("polygon.dam")
            .data([points]).enter()
            .append("polygon")
                .attr("points", function(d) {
                    return d.map(function(d) { // returns points to create the element
                        return [scaleX(d.x), scaleY(d.y)].join(",");
                    }).join(" ");
                })
                // .attr("transform", translate)
                .style("fill", gate.config.damColor)
                .style("stroke", gate.config.damStroke)
                .style("stroke-width", gate.config.damThickness);

        gate.svg.gateGroup = gate.svg.damGroup.append("g")
            .attr("id", "gateGroup")
            .attr("transform", function() { return gate.isOpen ? "translate(0, 0)" : "translate(0, 20)"});

        // falling water
        gate.svg.gateGroup.append("path")
                .attr("d", "M160.4,397.2H112l4.4-150c0.4-9.6,9.2-17.6,19.6-17.6l0,0c10.8,0,19.6,7.6,19.6,17.6L160.4,397.2z")
                .attr("transform", "translate(-148, -280) scale(1.5)" )
                .style("fill", function() { return gate.isOpen ? gate.config.fallingWaterColor : gate.config.backgroundColor; })
                .style("opacity", function() { return gate.isOpen ? gate.config.fallingWaterOpacity : 1; })
                .style("stroke", function() { return gate.isOpen ? gate.config.fallingWaterStroke : gate.config.backgroundColor; })
                .style("stroke-width", function() { return gate.isOpen ? gate.config.fallingWaterThickness : 1; });

        // gate element
        var elem = { w: 62, h: 62, x: 25, y: 55 };
        gate.svg.gateGroup.append("rect")
            .attr({ width: elem.w, height: elem.h })
            .attr({ x: elem.x, y: elem.y })
            .style("fill", gate.config.gateColor);

        gate.svg.gateGroup.append("image")
            .attr("xlink:href", window.location.href + "img/gate_.png")
            .attr({ width: elem.w, height: elem.h })
            .attr({ x: elem.x, y: elem.y });

        deferred.resolve();
        return deferred.promise();
    }

    /** @function setSVGProperties
     *  @description Sets the svg's properties that will be used to create the wave, update text labels, etc.
     *  @param {Object} svg - downstream or upstream svg object
     *  @param {Object} config - object that contains all the properties/values to customize the element
     *  @param {Number} value - current value, used to rise the wave
    */
    function setSVGProperties(svg, config, value) {
        // sets width and height in order to do all the calculations to match the viewBox of the svg. After the SVG is rendered, it is resized to fill fully its container.
        var width = 375;
        var height = 315;

        if (value > config.maxValue) value = config.maxValue;
        if (value < config.minValue) value = config.minValue;

        // general
        // converting the value (scale from config.minValue to config.maxValue) to its equivalent value in a scale from 0 to 60.
        // it is necessary to fulfill only a portion of the svg that corresponds to the part below the dam's gate
        svg.fillPercent = ((60*(value - config.minValue)) / (config.maxValue - config.minValue)) / 100;

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
        svg.waveHeight = (height/2) * svg.waveHeightScale((svg.fillPercent/0.6) * 100); // converting again to the original scale in order to calcule the wave height. The number 0.6 is the percentage that fulfills the dam.
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
            .x(function(d) { return svg.waveScaleX(d.x); } )
            .y0(function(d) { return svg.waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI)); })
            .y1(function(d) { return ((height) + svg.waveHeight); } );
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
            data.push({ x: i/(40 * svg.waveClipCount), y: (i/(40)) });

        //svg.waveGroup = svg.outerGroup.append("defs")
        svg.waveGroup = svg.append("defs")
            .append("clipPath")
            .attr("id", "clipWaveGate");

        svg.wave = svg.waveGroup.append("path")
            .datum(data)
            .attr("d", svg.clipArea)
            .attr("T", 0);

        // The inner rect with the clipping wave attached.
        // svg.innerGroup = svg.outerGroup.append("g")
        svg.innerGroup = svg.append("g")
            .attr("id", "waveGroup")
            .attr("clip-path", "url(#clipWaveGate)");

        var width = parseInt(gate.svg.attr("width")), 
            height = parseInt(gate.svg.attr("height"));

        svg.innerGroup.append("rect")
            .attr({ width: width, height: height })
            .style("fill", config.waveColor)
            .style("opacity", config.waveOpacity);

        if (config.waveRise) {
            svg.waveGroup.attr('transform','translate('+svg.waveGroupXPosition+','+svg.waveRiseScale(0)+')')
                .transition()
                .duration(config.waveRiseTime)
                .attr('transform','translate('+svg.waveGroupXPosition+','+svg.waveRiseScale(svg.fillPercent)+')')
                .each("start", function(){ svg.wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } else
            svg.waveGroup.attr('transform','translate('+svg.waveGroupXPosition+','+svg.waveRiseScale(svg.fillPercent)+')');

        if (config.waveAnimate) animateWave();

        deferred.resolve();
        return deferred.promise();
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

    /** @function update
     *  @description Update the whole svg.
     *  @param {Number} value - current value, used to rise the wave
     *  @param {Boolean} isOpen - whether or not the gate is open
    */
    function update(value, isOpen) {
        // console.log("Comporta: %s // Valor: %s", isOpen ? "aberta" : "fechada", isOpen ? value : 0);

        gate.isOpen = isOpen;
        gate.isOpen ? setSVGProperties(gate.svg, gate.config, value) : setSVGProperties(gate.svg, gate.config, 0);

        var groupId = gate.svg.gateGroup.attr("id");
        var fallinWater = d3.select("#"+groupId+" > path");
        var newWavePosition = gate.config.waveAnimate ? gate.svg.waveAnimateScale(1) : 0;

        gate.svg.gateGroup
            .transition().duration(0)
            .transition().duration(gate.config.waveRiseTime/2)
            .ease("linear")
            .attr("transform", function() { return gate.isOpen ? "translate(0, 0)" : "translate(0, 20)"; })
            .each("start", function() {
                if (!gate.isOpen) {
                    fallinWater
                        .transition().duration(0)
                        .transition().duration(gate.config.waveRiseTime)
                        .ease("linear")
                        .style("fill", gate.config.backgroundColor)
                        .style("opacity", 1)
                        .style("stroke", gate.config.backgroundColor)
                        .style("stroke-width", 1);

                    // wave animation
                    gate.svg.wave.transition()
                        .duration(0).transition()
                        .duration(gate.config.waveAnimate ? (gate.config.waveAnimateTime * (1 - gate.svg.wave.attr('T'))) : (gate.config.waveRiseTime))
                        .ease('linear')
                        .attr('d', gate.svg.clipArea)
                        .attr('transform','translate('+newWavePosition+', 0)')
                        .attr('T','1')
                        .each("end", function() {
                            if (gate.config.waveAnimate) {
                                gate.svg.wave.attr('transform', 'translate('+ gate.svg.waveAnimateScale(0) +', 0)');
                                animateWave(gate.config.waveAnimateTime);
                            }
                        });

                    gate.svg.waveGroup.transition()
                        .duration(gate.config.waveRiseTime)
                        .attr('transform','translate('+gate.svg.waveGroupXPosition+','+gate.svg.waveRiseScale(gate.svg.fillPercent)+')');
                }
            })
            .each("end", function() {
                if (gate.isOpen) {
                    fallinWater
                        .transition().duration(0)
                        .transition().duration(gate.config.waveRiseTime)
                        .ease("linear")
                        .style("fill", gate.config.fallingWaterColor)
                        .style("opacity", gate.config.fallingWaterOpacity)
                        .style("stroke", gate.config.fallingWaterStroke)
                        .style("stroke-width", gate.config.fallingWaterThickness);

                    // wave animation
                    gate.svg.wave.transition()
                        .duration(0).transition()
                        .duration(gate.config.waveAnimate ? (gate.config.waveAnimateTime * (1 - gate.svg.wave.attr('T'))) : (gate.config.waveRiseTime))
                        .ease('linear')
                        .attr('d', gate.svg.clipArea)
                        .attr('transform','translate('+newWavePosition+', 0)')
                        .attr('T','1')
                        .each("end", function() {
                            if (gate.config.waveAnimate) {
                                gate.svg.wave.attr('transform', 'translate('+ gate.svg.waveAnimateScale(0) +', 0)');
                                animateWave(gate.config.waveAnimateTime);
                            }
                        });

                    gate.svg.waveGroup.transition()
                        .duration(gate.config.waveRiseTime)
                        .attr('transform','translate('+gate.svg.waveGroupXPosition+','+gate.svg.waveRiseScale(gate.svg.fillPercent)+')');
                }
            });
    }
}