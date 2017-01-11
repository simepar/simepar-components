"use strict";

function loadFlowSettings() {
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
        waveOpacity: 0.8, // the wave opacity
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        textSize: 0.4, // The relative height of the text to display in the wave circle. 1 = 50%
        decimalPlaces: 2, // how many decimal places it should be displayed
        minTextColor: "#045681", // the color of the text for the minimum value
        maxTextColor: "#045681", // the color of the text for the maximum value
        valueTextColor: "#045681", // The color of the value text when the wave does not overlap it.
        waveTextColor: "#A4DBf8", // The color of the value text when the wave overlaps it.
    };
}

function FlowElement(selector, value, config) {
    var flow = this;

    // properties
    flow.selector = selector;
    flow.config = config == null ? loadFlowSettings() : config;
    flow.value = value;
    
    // functions
    flow.createSVG = createSVG;
    flow.createWave = createWave;
    flow.update = update;

    /////////////////////////////////////

    // creates and displays the svg fully working
    (function() {
        flow.createSVG().then(function () {
            // gate.createGate().then(function () {
                // flow.createWave(gate.config, gate.value).then(function() {
                    // fit svg to its container div
                    // flow.svg.attr({ width: "100%", height: "100%" });
                // });
            // });
        });
    })();

    /** @function createSVG
     *  @description Creates the main svg and associated elements.
    */
    function createSVG() {
        var deferred = $.Deferred();
        var container = d3.select(flow.selector);

        var width = 375, 
            height = 315;

        // appends an svg to the div
        flow.svg = container.style("transform", "scale("+flow.config.scale+")")
            .append("svg")
                .attr("id", "gate-svg")
                .attr({ width: width, height: height })
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + width + " " + height);

        flow.svg.append("rect")
            .attr({ width: width-2, height: height-2 })
            .style("fill", "none")
            .style("stroke", "black");

        deferred.resolve();
        return deferred.promise();
    }

    function createWave() {
        var deferred = $.Deferred();

        // setting properties
        setSVGProperties(flow.svg, flow.config, flow.value);

        var svg = flow.svg;
        var data = []; // Data for building the clip wave area.

        for (var i = 0; i <= 40 * svg.waveClipCount; i++)
            data.push({ x: i/(40 * svg.waveClipCount), y: (i/(40)) });

        svg.outerGroup = svg.append("g");

        // Text where the wave does not overlap. This is necessary now to guarantee that the wave will not overlap all the labels
        svg.valueText1 = svg.outerGroup.append("text");
        svg.maxText1   = svg.outerGroup.append("text");
        svg.minText1   = svg.outerGroup.append("text");

        //svg.waveGroup = svg.outerGroup.append("defs")
        svg.waveGroup = svg.outerGroup.append("defs")
            .append("clipPath")
            .attr("id", "clipWaveFlow");

        svg.wave = svg.waveGroup.append("path")
            .datum(data)
            .attr("d", svg.clipArea)
            .attr("T", 0);

        // The inner rect with the clipping wave attached.
        // svg.innerGroup = svg.outerGroup.append("g")
        svg.innerGroup = svg.append("g")
            .attr("id", "waveGroup")
            .attr("clip-path", "url(#clipWaveFlow)");

        var width = parseInt(flow.svg.attr("width")), 
            height = parseInt(flow.svg.attr("height"));

        svg.innerGroup.append("rect")
            .attr({ width: width, height: height })
            .style("fill", flow.config.waveColor)
            .style("opacity", flow.config.waveOpacity);

        // Text where the wave does overlap. This is necessary now to guarantee that the wave will overlap all the labels
        svg.valueText2 = svg.innerGroup.append("text");
        svg.maxText2   = svg.innerGroup.append("text");
        svg.minText2   = svg.innerGroup.append("text");   

        if (flow.config.waveRise) {
            svg.waveGroup.attr('transform','translate('+svg.waveGroupXPosition+','+svg.waveRiseScale(0)+')')
                .transition()
                .duration(flow.config.waveRiseTime)
                .attr('transform','translate('+svg.waveGroupXPosition+','+svg.waveRiseScale(svg.fillPercent)+')')
                .each("start", function(){ svg.wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } else
            svg.waveGroup.attr('transform','translate('+svg.waveGroupXPosition+','+svg.waveRiseScale(svg.fillPercent)+')');

        if (flow.config.waveAnimate) animateWave();

        // updating labels
        updateTextLabels(svg, flow.config);

        deferred.resolve();
        return deferred.promise();
    }

    /** @function animateWave
     *  @description Animate the wave based on its value and configuration.
    */
    function animateWave() {
        var svg = flow.svg;

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

        // text
        svg.minMaxTextPixels = (0.25 * width / 2);
        svg.textPixels = (config.textSize * width);
        svg.textFinalValue = parseFloat(value).toFixed(config.decimalPlaces);
        svg.textStartValue = config.valueCountUp ? config.minValue : svg.textFinalValue;
        svg.textHeight = svg.waveRiseScale(svg.fillPercent);

        // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
        svg.textRounder = function(value) { return parseFloat(value); };
    }

    /** @function updateTextLabels
     *  @description Gets the text labels in the svg and update its values
     *  @param {Object} svg - downstream or upstream svg object
     *  @param {Object} config - object that contains all the properties/values to customize the element
    */
    function updateTextLabels(svg, config) {
        var width = 375;
        var height = 315;

        var coords = {};
        var textAnchor, translate;

        // calculate the coordinates for all text elements
        if (svg.attr("id") == "downStream") {
            coords.max = { x: width-22, y: (svg.minMaxTextPixels-((20 * svg.minMaxTextPixels)/100)) };
            coords.min = { x: width-22, y: height-2 };
            textAnchor = "end";
            translate = "translate("+(width)+","+ svg.textHeight +")";
        }
        else {
            coords.max = { x: 22, y: (svg.minMaxTextPixels-((20 * svg.minMaxTextPixels)/100)) };
            coords.min = { x: 22, y: height-2 };
            textAnchor = "start";
            translate = "translate("+(width)+","+ svg.textHeight +")";
        }

        // Texts where the wave does not overlap
        svg.valueText1 // current value text
            .text(svg.textStartValue)
            .attr("text-anchor", "middle")
            .attr("font-size", svg.textPixels + "px")
            .style("fill", config.valueTextColor)
            .attr('transform', translate);

        svg.maxText1 // max value text
            .text(svg.textRounder(config.maxValue).toFixed(config.decimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr(coords.max)
            .attr("font-size", svg.minMaxTextPixels + "px")
            .style("fill", config.valueTextColor);

        svg.minText1 // min value text
            .text(svg.textRounder(svg.textStartValue).toFixed(config.decimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr(coords.min)
            .attr("font-size", svg.minMaxTextPixels + "px")
            .style("fill", config.valueTextColor);

        // Texts where the wave does overlap
        svg.valueText2 // current value text
            .text(svg.textStartValue)
            .attr("text-anchor", "middle")
            .attr("font-size", svg.textPixels + "px")
            .style("fill", config.waveTextColor)
            .attr('transform', translate);

        svg.maxText2 // max value text
            .text(svg.textRounder(config.maxValue).toFixed(config.decimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr(coords.max)
            .attr("font-size", svg.minMaxTextPixels + "px")
            .style("fill", config.waveTextColor);

        svg.minText2 // min value text
            .text(svg.textRounder(svg.textStartValue).toFixed(config.decimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr(coords.min)
            .attr("font-size", svg.minMaxTextPixels + "px")
            .style("fill", config.waveTextColor);

        // make the value count up
        if (config.valueCountUp) {
            var textTween = function(){
                var i = d3.interpolate(this.textContent, svg.textFinalValue);
                return function(t) { this.textContent = svg.textRounder(i(t)).toFixed(config.decimalPlaces); }
            };

            svg.valueText1.transition()
                .duration(config.waveRiseTime)
                .attr('transform', translate)
                .tween("text", textTween);

            svg.valueText2.transition()
                .duration(config.waveRiseTime)
                .attr('transform', translate)
                .tween("text", textTween);
        }
    }

    function update() {

    }
}