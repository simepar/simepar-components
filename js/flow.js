"use strict"; // strict mode

/**
 * @function loadFlowSettings
 * @description loads default settings to create a Flow Element.
 * @returns an object that contains default configuration options.
 */
function loadFlowSettings() {
    return {
        title: "Vazão Afluente",  // SVG's title
        unit: "(m³/s)",
        stepsWaveColor: 3,        // How many steps that will control wave color as well as wave animation time.
        minValue: 0,              // Flow's minimum value.
        maxValue: 100,            // Flow's maximum value. 
        waveHeight: 0.05,         // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1,             // The number of full waves per width of the wave circle.
        waveRiseTime: 1000,       // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 18000,   // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true,           // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: false, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true,        // Controls if the wave scrolls or is static.
        startWaveColor: "#b9dcef",// The color of the fill wave. Used to create the color scale.
        endWaveColor: "#178bca",  // The color of the fill wave. Used to create the color scale.
        waveOpacity: 1.0,         // Flow's liquid opacity.
        waveOffset: 0,            // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        valueCountUp: true,      // If true, the displayed value counts up from minimum value to it's final value upon loading. If false, the final value is displayed.
        scale: 1,                 // Scale of the parent div.
        text: {
            valueTextSize: 1,              // The relative height of the text to display in the wave. 1 = 100%
            valueDecimalPlaces: 0,         // How many decimal places it should be displayed.
            valueTextColor: "#045681",     // Color of the value text when the wave does not overlap it.
            valueWaveTextColor: "#A4DBf8", // Color of the value text when the wave overlaps it.

            minTextSize: 0.30,             // The relative height of the min value text to display in the wave. 1 = 100%
            minValueDecimalPlaces: 0,      // How many decimal places it should be displayed.
            minTextColor: "#045681",       // Color of the text for the minimum value.
            minWaveTextColor: "#A4DBf8",   // Color of the min value text when the wave overlaps it.
            
            maxTextSize: 0.30,             // The relative height of the max value text to display in the wave. 1 = 100%
            maxValueDecimalPlaces: 0,      // How many decimal places it should be displayed.
            maxTextColor: "#045681",       // Color of the text for the maximum value.
            maxWaveTextColor: "#A4DBf8",   // Color of the max value text when the wave overlaps it.

            titleTextSize: 0.35,           // The relative height of the title text to display in the wave. 1 = 100%
            titleTextColor: "#045681",     // Color of the text for the title.
            titleWaveTextColor: "#A4DBf8", // Color of the title text when the wave overlaps it.

            unitTextSize: 0.20,           // The relative height of the unit text to display in the wave. 1 = 100%
            unitTextColor: "#045681",     // Color of the text for the unit.
            unitWaveTextColor: "#A4DBf8", // Color of the unit text when the wave overlaps it.
        },
        background: {
            color: "none",                // Background color.
            stroke: "#045681",            // Stroke (border) color. 
            thickness: 2,                 // Thickness (border width).
        }
    };
}

/**
 * @function FlowElement
 * @description creates and configures the Flow Element.
 * @param {String} selector - element selector.
 * @param {Number} value    - initial value of the element. If it is greater than its max value, the value will be equals to its maximum. If it is lower than its min value, the value will be equals to its minimum.
 * @param {Object} config   - object that contains flow's default configuration options.
 * @returns the FlowElement.
 */
function FlowElement(selector, value, config) {
    // Load default settings if config is null.
    config = config == null ? loadFlowSettings() : config;

    // Checks if the current value is valid.
    if (value > config.maxValue) value = config.maxValue;
    if (value < config.minValue) value = config.minValue;

    // Creates the svg element. At this point, the svg has no elements in it, but the background.
    var svg = createSVG();

    // Creates the wave animation.
    createWave(value);

    // Updates the text elements inside the svg with the proper values.
    updateTextLabels(value);

    // Fits svg to its container div.
    svg.attr("width", "100%")
    svg.attr("height", "100%")

    /////////////////////////////////////////

    /**
     * @function createSVG
     * @description Creates and configures the svg and its dimensions.
     * @returns {Object} svg - svg basic element with background in it.
     */
    function createSVG() {
        // Select the svg container.
        var container = d3.select(selector);

        // Sets width and height properties. It's fixed in order to calculate wave offset and animation. Once the component is created, it become responsive.        
        var width  = 500,
            height = 250;

        // Adds the svg to its container
        var svg = container.style("transform", "scale("+ config.scale +")")
                    .append("svg")
                        .attr("id", "flow-svg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("preserveAspectRatio", "xMinYMin meet")
                        .attr("viewBox", "0 0 " + width + " " + height)
                        .style("margin", "0 auto")
                        .style("display", "block");

        svg.append("rect")
            .attr("id", "backgroundBorder")
            .attr("width", width-10)
            .attr("height", height-10)
            .attr("x", 5)
            .attr("y", 5)
            .style("fill", config.background.color)
            .style("stroke", config.background.stroke)
            .style("stroke-width", config.background.thickness);

        return svg;
    }

    /** @function createWave
     *  @description Calculates and generates the clipPath to simulate a wave
    */
    function createWave(value) {
        var width  = parseInt(svg.attr("width")), 
            height = parseInt(svg.attr("height"));       

        // getting wave properties
        var properties = getSVGProperties(value);

        // // Generating data for building the clip wave area.
        var data = [];
        for (var i = 0; i <= 40 * properties.waveClipCount; i++)
            data.push({ x: i/(40 * properties.waveClipCount), y: (i/(40)) });

        // Group where the wave does not overlap.
        svg.outerGroup = svg.append("g");        

        // Text where the wave does not overlap. This is necessary now to guarantee that the wave will not overlap all the labels.
        svg.titleText1 = svg.outerGroup.append("text");
        svg.unitText1  = svg.outerGroup.append("text");
        svg.valueText1 = svg.outerGroup.append("text");
        svg.maxText1   = svg.outerGroup.append("text");
        svg.minText1   = svg.outerGroup.append("text");

        // defs: where the wave will be inserted in. Works like a "group".
        svg.waveGroup = svg.outerGroup.append("defs")
            .append("clipPath")
            .attr("id", "clipWaveFlow");

        // The path element with its data to represent the wave.
        svg.wave = svg.waveGroup.append("path")
            .datum(data)
            .attr("d", properties.clipArea)
            .attr("T", 0);

        // The inner rect with the clipping wave attached, where the wave does overlap.
        svg.innerGroup = svg.outerGroup.append("g")
            .attr("clip-path", "url(#clipWaveFlow)");
        svg.waveRect = svg.innerGroup.append("rect")
            .attr("width", width-10)
            .attr("height", height-10)
            .attr("x", 5)
            .attr("y", 5)
            .style("fill", properties.waveColor)
            .style("opacity", config.waveOpacity);

        // Text where the wave does overlap. This is necessary now to guarantee that the wave will overlap all the labels
        svg.titleText2 = svg.innerGroup.append("text");
        svg.unitText2  = svg.innerGroup.append("text");
        svg.valueText2 = svg.innerGroup.append("text");
        svg.maxText2   = svg.innerGroup.append("text");
        svg.minText2   = svg.innerGroup.append("text");

        // Wave rising up from min value to its current value.
        if (config.waveRise) {
            svg.waveGroup.attr('transform','translate('+properties.waveGroupXPosition+','+properties.waveRiseScale(0)+')')
                .transition()
                .duration(config.waveRiseTime)
                .attr('transform','translate('+properties.waveGroupXPosition+','+properties.waveRiseScale(properties.fillPercent)+')')
                .on("start", function(){ svg.wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } else
            svg.waveGroup.attr('transform','translate('+properties.waveGroupXPosition+','+properties.waveRiseScale(properties.fillPercent)+')');

        // Makes the wave animation.
        if (config.waveAnimate) animateWave(properties.waveAnimateTime);
    }

    /** @function animateWave
     *  @description Animate the wave based on its value and configuration
    */
    function animateWave(waveAnimateTime) {
        // Gets the properties used to create and animate waves.
        var properties = getSVGProperties(value);

        svg.wave.attr('transform', 'translate(' + properties.waveAnimateScale(svg.wave.attr('T')) + ',0)');
        svg.wave.transition()
            .duration(waveAnimateTime * (1 - svg.wave.attr('T')))
            .ease(d3.easeLinear)
            .attr('transform', 'translate(' + properties.waveAnimateScale(1) + ',0)')
            .attr('T', 1)
            .on('end', function () {
                svg.wave.attr('T', 0);
                animateWave(waveAnimateTime);
            });
    }

    /** @function getSVGProperties
     *  @description Gets the svg's properties that will be used to create the wave, update text labels, etc...
     *  @returns {Object} properties  - svg's properties
    */
    function getSVGProperties(value) {
        var properties = {};
        var width  = 500;
        var height = 250;        

        // General properties
        properties.length = Math.min(width, height) / 2;
        properties.fillPercent = (((value - (config.minValue)) * 100) / (config.maxValue - config.minValue)) / 100;

        // Loads waves' scales based on the element's value.
        var waveConfig = loadWaveConfig(value);

        // Wave properties
        var range, domain;
        if (config.waveHeightScaling) {
            range = [0, config.waveHeight, 0];
            domain = [0, 50, 100];
        } else {
            range = [config.waveHeight, config.waveHeight];
            domain = [0, 100];
        }

        properties.waveColor = waveConfig.waveColor;
        properties.waveAnimateTime = waveConfig.waveAnimateTime;
        properties.waveHeightScale = d3.scaleLinear().range(range).domain(domain);
        properties.waveHeight = (height/2) * properties.waveHeightScale(properties.fillPercent * 100);
        properties.waveLength = width / config.waveCount;
        properties.waveClipCount = 1 + config.waveCount;
        properties.waveClipWidth = properties.waveLength * properties.waveClipCount;
        properties.waveGroupXPosition = width - properties.waveClipWidth;

        // Scales for controlling the size of the clipping path.
        properties.waveScaleX = d3.scaleLinear().range([0, properties.waveClipWidth]).domain([0, 1]);
        properties.waveScaleY = d3.scaleLinear().range([0, properties.waveHeight]).domain([0, 1]);

        // Scales for controlling the position of the clipping path.
        properties.waveRiseScale = d3.scaleLinear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
            .range([(height + properties.waveHeight), (properties.waveHeight)])
            .domain([0, 1]);

        properties.waveAnimateScale = d3.scaleLinear()
            .range([0, properties.waveClipWidth - width]) // Push the clip area one full wave then snap back.
            .domain([0, 1]);

        // The clipping wave area.
        properties.clipArea = d3.area()
            .x(function(d) { return properties.waveScaleX(d.x); } )
            .y0(function(d) { return properties.waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI)); })
            .y1(function(d) { return ((height) + properties.waveHeight); } );

        // Texts' properties.
        properties.titleTextPixels = (config.text.titleTextSize * height / 2.5);
        properties.unitTextPixels  = (config.text.unitTextSize * height / 2.5);
        properties.minTextPixels = (config.text.minTextSize * height / 2.5);
        properties.maxTextPixels = (config.text.maxTextSize * height / 2.5);
        properties.textPixels = (config.text.valueTextSize * height / 2.5);
        properties.textFinalValue = parseFloat(value).toFixed(config.valueDecimalPlaces);
        properties.textStartValue = config.valueCountUp ? config.minValue : properties.textFinalValue;
        properties.textWidth  = width/2; 
        properties.textHeight = height/1.6; //properties.waveRiseScale(0.40);

        // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
        properties.textRounder = function(value) { return parseFloat(value); };

        return properties;
    }

    /** @function updateTextLabels
     *  @description Gets the text labels in the svg and update its values
     *  @param {Object} svg    - object that contains the svg properties as well as the element itself
     *  @param {Object} config - object that contains all the properties/values to customize the element
     *  @param {Object} props  - svg's properties
    */
    function updateTextLabels(value) {
        var width  = parseInt(svg.style("width")),
            height = parseInt(svg.style("height"));

        var properties = getSVGProperties(value);

        var translate = "translate("+(properties.textWidth)+","+(properties.textHeight)+")"; // move the current value to the middle of the svg
        var textAnchor = "end";   // text anchor for min/max values.
        var coords = {};
        coords.min = { x: 490, y: height-10 }; // x,y coordinates for positioning the min text element
        coords.max = { x: 490, y: properties.maxTextPixels };       // x,y coordinates for positioning the max text element

        /** 
         * Texts where the wave does not overlap
        */
        svg.titleText1 // svg's title
            .text(config.title)
            .attr("text-anchor", "start")
            .attr("font-size", properties.titleTextPixels + "px")
            .attr("x", 10)
            .attr("y", properties.titleTextPixels)
            .style("fill", config.text.titleTextColor);

        svg.valueText1 // current value text
            .text(properties.textRounder(properties.textStartValue).toFixed(config.text.valueDecimalPlaces))
            // .text("marco")
            .attr("text-anchor", "middle")
            .attr("font-size", properties.textPixels + "px")
            .style("fill", config.text.valueTextColor)
            .attr('transform', translate)
            
        svg.maxText1 // max value text
            .text(properties.textRounder(config.maxValue).toFixed(config.text.maxValueDecimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr("x", coords.max.x)
            .attr("y", coords.max.y)
            .attr("font-size", properties.maxTextPixels + "px")
            .style("fill", config.text.maxTextColor);

        svg.minText1 // min value text
            .text(properties.textRounder(config.minValue).toFixed(config.text.minValueDecimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr("x", coords.min.x)
            .attr("y", coords.min.y)
            .attr("font-size", properties.minTextPixels + "px")
            .style("fill", config.text.minTextColor);


        /** 
         * Texts where the wave does overlap
        */
        svg.titleText2 // svg's title
            .text(config.title)
            .attr("text-anchor", "start")
            .attr("font-size", properties.titleTextPixels + "px")
            .attr("x", 10)
            .attr("y", properties.titleTextPixels)
            .style("fill", config.text.titleWaveTextColor);

        svg.valueText2 // current value text
            .text(properties.textRounder(properties.textStartValue).toFixed(config.text.valueDecimalPlaces))
            .attr("text-anchor", "middle")
            .attr("font-size", properties.textPixels + "px")
            .style("fill", config.text.valueWaveTextColor)
            .attr('transform', translate);

        svg.maxText2 // max value text
            .text(properties.textRounder(config.maxValue).toFixed(config.text.maxValueDecimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr("x", coords.max.x)
            .attr("y", coords.max.y)
            .attr("font-size", properties.maxTextPixels + "px")
            .style("fill", config.text.maxWaveTextColor);

        svg.minText2 // min value text
            .text(properties.textRounder(config.minValue).toFixed(config.text.minValueDecimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr("x", coords.min.x)
            .attr("y", coords.min.y)
            .attr("font-size", properties.minTextPixels + "px")
            .style("fill", config.text.minWaveTextColor);

        // make the value count up
        if (config.valueCountUp) {
            var textTween = function(){
                var i = d3.interpolate(this.textContent, properties.textFinalValue);
                return function(t) { this.textContent = properties.textRounder(i(t)).toFixed(config.text.valueDecimalPlaces); }
            };

            svg.valueText1.transition()
                .duration(config.waveRiseTime)
                .attr('transform', translate)
                .tween("text", textTween)
                .on("end", function() {
                    var bbox = this.getBBox();

                    svg.unitText1 // svg's title unit
                        .text(config.unit)
                        .attr("text-anchor", "start")
                        .attr("font-size", properties.unitTextPixels + "px")
                        .attr("x", properties.textWidth+bbox.width/2)
                        .attr("y", properties.textHeight-5)
                        .style("fill", config.text.unitTextColor);
                });

            svg.valueText2.transition()
                .duration(config.waveRiseTime)
                .attr('transform', translate)
                .tween("text", textTween)
                .on("end", function() {
                    var bbox = this.getBBox();

                    svg.unitText2 // svg's title unit
                        .text(config.unit)
                        .attr("text-anchor", "start")
                        .attr("font-size", properties.unitTextPixels + "px")
                        .attr("x", properties.textWidth+(bbox.width/2))
                        .attr("y", properties.textHeight-5)
                        .style("fill", config.text.unitWaveTextColor);
                });
        } 
        else { // dont make the value count up
            var bbox = svg.valueText2._groups[0][0].getBBox(); // getting the text's length so that I can place the unit text correctly

            svg.unitText1 // svg's title unit
                .text(config.unit)
                .attr("text-anchor", "start")
                .attr("font-size", properties.unitTextPixels + "px")
                .attr("x", properties.textWidth+bbox.width/2)
                .attr("y", properties.textHeight-5)
                .style("fill", config.text.unitTextColor);

            svg.unitText2 // svg's title unit
                .text(config.unit)
                .attr("text-anchor", "start")
                .attr("font-size", properties.unitTextPixels + "px")
                .attr("x", properties.textWidth+(bbox.width/2))
                .attr("y", properties.textHeight-5)
                .style("fill", config.text.unitWaveTextColor);
        }
    }

    /** @function loadWaveConfig
     *  @description Generates the color scales, wave animation time and the intervals for it.
     *  @param   {Number} value - current value, used to calculate the wave properties
     *  @returns {Object} data  - contains
    */
    function loadWaveConfig(value) {
        var data = {};
        var steps    = config.stepsWaveColor;
        var interval = (config.maxValue - config.minValue) / steps;
        
        var colorScale     = d3.scaleLinear().domain([-1, steps]).range([config.startWaveColor, config.endWaveColor]); // -1 so that the first shade is a light blue, not white.
        var animationScale = d3.scaleLinear().domain([-1, steps]).range([10000, 500]); // 18000 = soft wave ~ 500 = strong wave
        var waveCountScale = d3.scaleLinear().domain([0, steps]).range([1, 5]);       // 1 to 5 waves

        var start = config.minValue;
        var end = start + interval;

        for (var i = 0; i < steps; i++) {
            if (value >= start && value <= end) {
                // data.index = i;
                // data.value = value;
                // data.interval = [start, end];
                data.waveColor = colorScale(i);
                data.waveAnimateTime = animationScale(i);
                data.waveCount = parseInt(waveCountScale(i).toFixed(0));
                
                break;
            }

            start = end+1;
            end += interval;
        }

        return data;
    }

    /** @function FlowUpdater
     *  @description Updates the value of the element as well as the wave properties.
     *  @returns {Object} flow - new flow element
    */
    function FlowUpdater() { 
        var flow = this;

        flow.update = update;

        ///////////////////////////

        function update(value) {
            // Gets the properties used to create the new svg and animate waves.
            var properties = getSVGProperties(value);

            var newWavePosition = config.waveAnimate ? properties.waveAnimateScale(1) : 0;

            svg.wave.transition()
                .duration(0)
                .transition()
                .duration(config.waveAnimate ? (properties.waveAnimateTime * (1 - svg.wave.attr('T'))) : (config.waveRiseTime))
                .ease(d3.easeLinear)
                .attr('d', properties.clipArea)
                .attr('transform','translate('+newWavePosition+', 0)')
                .attr('T','1')
                .on("end", function() {
                    if (config.waveAnimate) {
                        svg.wave.attr('transform', 'translate('+ properties.waveAnimateScale(0) +', 0)');
                        animateWave(properties.waveAnimateTime);
                    }
                });

            svg.waveGroup.transition()
                    .duration(config.waveRiseTime)
                    .attr('transform','translate('+properties.waveGroupXPosition+','+properties.waveRiseScale(properties.fillPercent)+')');

            svg.waveRect.transition()
                .duration(config.waveRiseTime)
                .ease(d3.easeLinear)
                .style("fill", properties.waveColor);

            // make the value count up
            if (config.valueCountUp) {
                var translate = "translate("+(properties.textWidth)+","+(properties.textHeight)+")"; // move the current value to the middle of the svg
                var textTween = function(){
                    var i = d3.interpolate(this.textContent, properties.textFinalValue);
                    return function(t) { 
                        this.textContent = properties.textRounder(i(t)).toFixed(config.text.valueDecimalPlaces);
                    }
                };

                svg.valueText1.transition()
                    .duration(config.waveRiseTime)
                    .attr('transform', translate)
                    .tween("text", textTween)
                    .on("end", function() {
                        var bbox = this.getBBox();

                        svg.unitText1.transition() // svg's updates title unit
                            .duration(500)
                            .attr("x", properties.textWidth+(bbox.width/2))
                            .attr("y", properties.textHeight-5)
                    });

                svg.valueText2.transition()
                    .duration(config.waveRiseTime)
                    .attr('transform', translate)
                    .tween("text", textTween)
                    .on("end", function() {
                        var bbox = this.getBBox();
                        
                        svg.unitText2.transition() // svg's updates title unit
                            .duration(500)
                            .attr("x", properties.textWidth+(bbox.width/2))
                            .attr("y", properties.textHeight-5)
                    });
            }
            else {
                svg.valueText1 // updates current value text
                    .text(properties.textRounder(properties.textStartValue).toFixed(config.text.valueDecimalPlaces));

                svg.valueText2 // updates current value text
                    .text(properties.textRounder(properties.textStartValue).toFixed(config.text.valueDecimalPlaces));

                var bbox = svg.valueText1[0][0].getBBox();
                svg.unitText1
                    .attr("x", properties.textWidth+(bbox.width/2))
                    .attr("y", properties.textHeight-5)

                svg.unitText2
                    .attr("x", properties.textWidth+(bbox.width/2))
                    .attr("y", properties.textHeight-5)
            }
        }
    }

    return new FlowUpdater();
}