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
        waveOpacity: 0.7, // the wave opacity
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        textSize: 0.4, // The relative height of the text to display in the wave circle. 1 = 50%
        decimalPlaces: 2, // how many decimal places it should be displayed
        minTextColor: "#045681", // the color of the text for the minimum value
        maxTextColor: "#045681", // the color of the text for the maximum value
        valueTextColor: "#045681", // The color of the value text when the wave does not overlap it.
        waveTextColor: "#A4DBf8", // The color of the value text when the wave overlaps it.
        outterCircleColor: "#FFD05B", // color of the outter circle, the one that is behind all elements.
        outterCircleStroke: "none",   // stroke of the outter circle, the one that is behind all elements.
        outterCircleThickness: 0,     // stroke-width of the outter circle, the one that is behind all elements.
        fenceColor: "#FFFFFF",        // color of the fences (the horizontal "string").
        fenceStroke: "none",          // stroke of the fences. No need to set it up, but still an option.
        fenceThickness: 0,            // stroke-width of the fences. No need to set it up, but still an option.
        pileColor: "#FFFFFF",         // color of the piles (the vertical "piles").
        pileStroke: "none",           // stroke of the piles. No need to set it up, but still an option.
        pileThickness: 0,             // stroke-width of the piles. No need to set it up, but still an option.
        backgroundColor: "#F9B54C",   // color of the background. This is the element that is behind the four dam elements.
        backgroundStroke: "none",     // stroke-width of the background. No need to set it up, but still an option.
        backgroundThickness: 0,       // stroke-width of the background. No need to set it up, but still an option.
        damColor: "#E6E9EE",          // color of the dam. 
        damStroke: "#E6E9EE",         // stroke of the dam. 
        damThickness: 2,              // stroke-width of the dam. 
        fallingWaterColor: "#54C0EB", // color of the water that is falling from the dam's gate.
        fallingWaterStroke: "none",   // stroke of the falling water. No need to set it up, but still an option.
        fallingWaterThickness: 0,     // stroke-width of the falling water. No need to set it up, but still an option.
        holeColor: "#324A5E",         // color of the "hole" where the water comes from.
        gapColor: "#ACB3BA",          // color of the "gap" between dams.
    };
}

function GateElement(selector, value, config) {
    var gate = this;

    // properties
    gate.selector = selector;
    gate.config = config == null ? loadGateSettings() : config;
    gate.value = value;
    
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
        
        var width = 508, 
            height = 508;

        // appends an svg to the div
        gate.svg = container.style("transform", "scale("+gate.config.scale+")")
            .append("svg")
                .attr("id", "gate-svg")
                .attr({ width: width, height: height })
                .attr({ x: 0, y: 0 })
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + width + " " + height);
                // .style("margin", "0 auto")
                // .style("display", "block");
        
        // the outter circle
        gate.svg.append("circle")
            .attr("id", "outterCircle")
            .attr({ cx: width/2, cy: height/2 })
            .attr("r", width/2)
            .style("fill", gate.config.outterCircleColor)
            .style("stroke", gate.config.outterCircleStroke)
            .style("stroke-width", gate.config.outterCircleThickness);

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

        // fence group
        gate.svg.fenceGroup = gate.svg.append("g").attr("id", "fenceGroup");

        // appending piles
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

        // appending circle background (under the fence)
        gate.svg.append("path")
            .attr("d", "M37.6,387.2H470c1.2-2,2.8-4.4,4-6.4c21.6-37.2,34-80.8,34-126.8c0-20-2.4-39.6-6.8-58.4H6.8   C2.4,214.4,0,234,0,254c0,48,13.2,92.8,36.4,131.2C36.8,386,37.2,386.4,37.6,387.2z")
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

        // gate group
        gate.svg.gateGroup = gate.svg.append("g").attr("id", "gateGroup");
        gate.svg.gateGroup.append("polygon")
            .attr("points", "426.8,425.6 81.2,425.6 95.2,196.4 412.8,196.4")
            .style("fill", gate.config.damColor)
            .style("stroke", gate.config.damStroke)
            .style("stroke-width", gate.config.damThickness);

        // falling water's d element
        var fallingWater = ["M396,397.2h-48.4l4.4-150c0.4-9.6,9.2-17.6,19.6-17.6l0,0c10.8,0,19.6,7.6,19.6,17.6L396,397.2z",
            "M317.6,397.2h-48.8l4.4-150c0.4-9.6,9.2-17.6,19.6-17.6l0,0c10.8,0,19.6,7.6,19.6,17.6L317.6,397.2z",
            "M238.8,397.2h-48.4l4.4-150c0.4-9.6,9.2-17.6,19.6-17.6l0,0c10.8,0,19.6,7.6,19.6,17.6L238.8,397.2z",
            "M160.4,397.2H112l4.4-150c0.4-9.6,9.2-17.6,19.6-17.6l0,0c10.8,0,19.6,7.6,19.6,17.6L160.4,397.2z"];

        // appending falling water
        gate.svg.gateGroup.selectAll("path.fallingWater")
            .data(fallingWater).enter()
            .append("path")
                .attr("d", function(d) { return d; })
                .attr("fill", gate.config.fallingWaterColor)
                .attr("stroke", gate.config.fallingWaterStroke)
                .attr("stroke-width", gate.config.fallingWaterThickness);

        // hole's d element
        var hole = ["M391.2,246c-0.8-9.2-9.2-16.4-19.6-16.4l0,0c-10.4,0-18.8,7.2-19.6,16.4H391.2z",
            "M312.8,246c-0.8-9.2-9.2-16.4-19.6-16.4l0,0c-10.4,0-18.8,7.2-19.6,16.4H312.8z",
            "M234.4,246c-0.8-9.2-9.2-16.4-19.6-16.4l0,0c-10.4,0-18.8,7.2-19.6,16.4H234.4z",
            "M156,246c-0.8-9.2-9.2-16.4-19.6-16.4l0,0c-10.4,0-18.8,7.2-19.6,16.4H156z"];

        // appending the "hole" where the water comes from
        gate.svg.gateGroup.selectAll("path.hole")
            .data(hole).enter()
            .append("path")
                .attr("d", function(d) { return d; })
                .attr("fill", gate.config.holeColor);

        // coordinates do create the gaps between dams
        var gaps = [{ x: 169.9, y: 196.4, w: 11.6, h: 229.2 }, { x: 248.4, y: 196.4, w: 11.6, h: 229.2 }, { x: 326.8, y: 196.4, w: 11.6, h: 229.2 }];

        // appending the "gap" between dams
        gate.svg.gateGroup.selectAll("rect.gap")
            .data(gaps).enter()
            .append("rect")
                .attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; })
                .attr("width", function(d) { return d.w; })
                .attr("height", function(d) { return d.h; })
                .attr("fill", gate.config.gapColor);

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
        // sets width and height to 508 in order to do all the calculations to match the viewBox of the svg. 
        // After the SVG is rendered, it is resized to fill fully its container.
        var width = 508, 
            height = 508;

        // checking if the value do not exceed the min and max values
        if (value > config.maxValue) value = config.maxValue;
        if (value < config.minValue) value = config.minValue;

        // general
        svg.radius = Math.min(width, height) / 2;
        svg.fillPercent = (((value - (config.minValue)) * 100) / (config.maxValue - config.minValue)) / 100;

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
        svg.waveHeight = svg.radius * svg.waveHeightScale(svg.fillPercent * 100);
        svg.waveLength = svg.radius * 2 / config.waveCount;
        svg.waveClipCount = 1 + config.waveCount;
        svg.waveClipWidth = svg.waveLength * svg.waveClipCount;
        svg.waveGroupXPosition = svg.radius * 2 - svg.waveClipWidth;

        // Scales for controlling the size of the clipping path.
        svg.waveScaleX = d3.scale.linear().range([0, svg.waveClipWidth]).domain([0, 1]);
        svg.waveScaleY = d3.scale.linear().range([0, svg.waveHeight]).domain([0, 1]);

        // Scales for controlling the position of the clipping path.
        svg.waveRiseScale = d3.scale.linear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
            .range([(svg.radius * 2 + svg.waveHeight), (svg.waveHeight)])
            .domain([0, 1]);

        svg.waveAnimateScale = d3.scale.linear()
            .range([0, svg.waveClipWidth - svg.radius * 2]) // Push the clip area one full wave then snap back.
            .domain([0, 1]);

        // The clipping wave area.
        svg.clipArea = d3.svg.area()
            .x(function(d) { return svg.waveScaleX(d.x); } )
            .y0(function(d) { return svg.waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
            .y1(function(d) { return (svg.radius * 2 + svg.waveHeight); } );
    }

    /** @function createWave
     *  @description Calculate and generate the clipPath to simulate a wave.
     *  @param {Object} config - object that contains all the properties/values to customize the element
     *  @param {Number} value - downstream or upstream svg object
    */
    function createWave(config, value) {
        var deferred = $.Deferred();

        setSVGProperties(gate.svg, config, value);

        var width = 508;
        var height = 508;
        var svg = gate.svg;       

        // Data for building the clip wave area.
        var data = [];
        for(var i = 0; i <= 40 * svg.waveClipCount; i++)
            data.push({ x: i/(40 * svg.waveClipCount), y: (i/(40)) });

        svg.outerGroup = svg.append("g");

        svg.waveGroup = svg.outerGroup.append("defs")
            .append("clipPath")
            .attr("id", "clipWaveGate");

        svg.wave = svg.waveGroup.append("path")
            .datum(data)
            .attr("d", svg.clipArea)
            .attr("T", 0);

        // The inner rect with the clipping wave attached.
        svg.innerGroup = svg.outerGroup.append("g")
            .attr("clip-path", "url(#clipWaveGate)");
        svg.innerGroup.append("circle")
            .attr({ cx: width/2, cy: height/2 })
            .attr("r", width/2)
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
    */
    function update(value) {
        setSVGProperties(gate.svg, gate.config, value);

        var newWavePosition = gate.config.waveAnimate ? gate.svg.waveAnimateScale(1) : 0;

        gate.svg.wave.transition()
            .duration(0)
            .transition()
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
}