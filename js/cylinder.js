"use strict"; // strict mode

/**
 * @function loadCylinderSettings
 * @description loads default settings to create a Cylinder Element.
 * @returns an object that contains default configuration options.
 */
function loadCylinderSettings() {
    return {
        minValue: 0,              // Cylinder's minimum value.
        maxValue: 100,            // Cylinder's maximum value. 
        waveHeight: 0.05,         // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1,             // The number of full waves per width of the wave circle.
        waveRiseTime: 1000,       // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 5000,    // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true,           // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true,  // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true,        // Controls if the wave scrolls or is static.
        waveColor: "#178bca",     // The color of the fill wave. Used to create the color scale.
        waveOpacity: 0.9,         // Flow's liquid opacity.
        waveStroke: "#8e8e8e",
        waveThickness: 10,
        waveOffset: 0,            // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        valueCountUp: true,       // If true, the displayed value counts up from minimum value to it's final value upon loading. If false, the final value is displayed.
        scale: 1,                 // Scale of the parent div.
        background: {
            color: "none",        // Background color.
            stroke: "#045681",    // Stroke (border) color. 
            thickness: 2,         // Thickness (border width).
        },
        cylinder: {
            top: {
                color: "#CCC",    // Color of the top part of the cylinder.
                stroke: "#8e8e8e",   // Stroke (border) color. 
                thickness: 10,     // Thickness (border width).
            },
            bottom: {
                color: "#CCC",    // Color of the bottom part of the cylinder.
                stroke: "#8e8e8e",   // Stroke (border) color. 
                thickness: 10,     // Thickness (border width).
            }
        },
        text: {
            minTextSize: 0.30,             // The relative height of the min value text to display in the wave. 1 = 100%
            minValueDecimalPlaces: 0,      // How many decimal places it should be displayed.
            minTextColor: "#045681",       // Color of the text for the minimum value.
            minWaveTextColor: "#A4DBf8",   // Color of the min value text when the wave overlaps it.
            
            maxTextSize: 0.30,             // The relative height of the max value text to display in the wave. 1 = 100%
            maxValueDecimalPlaces: 0,      // How many decimal places it should be displayed.
            maxTextColor: "#045681",       // Color of the text for the maximum value.
            maxWaveTextColor: "#A4DBf8",   // Color of the max value text when the wave overlaps it.
        }
    };
}

function CylinderElement(selector, value, config) {
    var cylinder = this;

    // properties
    cylinder.config = config == null ? loadCylinderSettings() : config; // Load default settings if config is null.
    cylinder.value  = value;

    // Checks if the current value is valid.
    if (value > cylinder.config.maxValue) cylinder.value = cylinder.config.maxValue;
    if (value < cylinder.config.minValue) cylinder.value = cylinder.config.minValue;

    // functions
    cylinder.createSVG  = createSVG;
    cylinder.createWave = createWave;
    cylinder.createCylinder = createCylinder;
    cylinder.update = update;

    (function() {
        cylinder.createSVG(selector).then(function() {
            cylinder.createCylinder().then(function() {
                cylinder.createWave().then(function() {
                    // Fits svg to its container div.
                    //cylinder.svg.attr({ width: "100%", height: "100%" });
                });
            });
        });
    })();

    ///////////////////////////////////////////////

    function createSVG(selector) {
        var deferred = $.Deferred();

        // Select the svg container.
        var container = d3.select(selector);

        // Sets width and height properties. It's fixed in order to calculate wave offset and animation. Once the component is created, it become responsive.        
        var width  = 520,
            height = 525;

        // Adds the svg to its container
        cylinder.svg = container.style("transform", "scale("+ config.scale +")")
                    .append("svg")
                        .attr("id", "cylinder-svg")
                        .attr({ width: width, height: height })
                        .attr("preserveAspectRatio", "xMinYMin meet")
                        .attr("viewBox", "0 0 " + width + " " + height);
                        //.style({ margin: "0 auto", display: "block" });

        // cylinder.svg.append("rect")
        //     .attr({ width: width, height: height })
        //     .style("fill", "none")
        //     .style("stroke", "black");

        deferred.resolve();
        return deferred.promise();
    }

    function createCylinder() {
        var deferred = $.Deferred();

        var svg = cylinder.svg;
        var config = cylinder.config;

        svg.cylinderGroup = svg.append("g").attr("transform", "translate(-81, 5)");

        svg.top = svg.cylinderGroup.append("path") // top
            .attr("d", "M256,85.333c105.28,0,170.667-16.363,170.667-42.667c0-1.621-0.405-3.115-1.067-4.48     C415.872,5.141,301.653,0.661,265.493,0.085C262.336,0.064,259.243,0,256,0s-6.336,0.064-9.515,0.085     C210.325,0.661,96.107,5.12,86.379,38.187c-0.64,1.365-1.045,2.859-1.045,4.48C85.333,68.971,150.72,85.333,256,85.333z")
            .style("fill", config.cylinder.top.color)
            .style("stroke", config.cylinder.top.stroke)
            .style("stroke-width", config.cylinder.top.thickness);

        svg.bottom = svg.cylinderGroup.append("path") // bottom
            .attr("d", "M85.333,77.888v391.445C85.333,510.805,238.549,512,256,512s170.667-1.195,170.667-42.667V77.888     c-28.48,19.093-85.44,28.779-170.667,28.779S113.835,96.981,85.333,77.888z")
            .style("fill", config.cylinder.bottom.color)
            .style("stroke", config.cylinder.bottom.stroke)
            .style("stroke-width", config.cylinder.bottom.thickness);

        deferred.resolve();
        return deferred.promise();
    }

    function createWave() {
        var deferred = $.Deferred();

        var svg = cylinder.svg;
        var properties = getSVGProperties(cylinder.config, cylinder.value);

        // Data for building the clip wave area.
        var data = [];
        for(var i = 0; i <= 40 * properties.waveClipCount; i++)
            data.push({ x: i/(40 * properties.waveClipCount), y: (i/(40)) });

        // Text where the wave does not overlap. This is necessary now to guarantee that the wave will not overlap all the labels.
        svg.maxText1   = svg.cylinderGroup.append("text");
        svg.minText1   = svg.cylinderGroup.append("text");

        svg.waveGroup = svg.cylinderGroup.append("defs")
            .append("clipPath")
            .attr("id", "clipWaveCylinder");

        svg.wave = svg.waveGroup.append("path")
            .datum(data)
            .attr("d", properties.clipArea)
            .attr("T", 0);

        // The inner rect with the clipping wave attached.
        svg.innerGroup = svg.cylinderGroup.append("g")
            .attr("clip-path", "url(#clipWaveCylinder)");
        svg.innerGroup.append("path")
            .attr("d", "M85.333,77.888v391.445C85.333,510.805,238.549,512,256,512s170.667-1.195,170.667-42.667V77.888     c-28.48,19.093-85.44,28.779-170.667,28.779S113.835,96.981,85.333,77.888z")
            .style("fill", cylinder.config.waveColor)
            .style("opacity", cylinder.config.waveOpacity)
            .style("stroke", config.waveStroke)
            .style("stroke-width", config.waveThickness);  

        // Text where the wave does overlap. This is necessary now to guarantee that the wave will overlap all the labels
        // svg.maxText2   = svg.innerGroup.append("text");
        // svg.minText2   = svg.innerGroup.append("text");

        if (config.waveRise) {
            svg.waveGroup.attr('transform','translate('+properties.waveGroupXPosition+','+properties.waveRiseScale(0)+')')
                .transition()
                .duration(config.waveRiseTime)
                .attr('transform','translate('+properties.waveGroupXPosition+','+properties.waveRiseScale(properties.fillPercent)+')')
                .each("start", function(){ 
                    svg.wave.attr('transform','translate(1,0)'); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.

                    if (cylinder.value != config.maxValue)
                        svg.top
                            .style("fill", config.cylinder.top.color)
                            .style("opacity", 1); 
                })
                .each("end", function() {
                    if (cylinder.value == config.maxValue)
                        svg.top
                            .style("fill", config.waveColor)
                            .style("opacity", config.waveOpacity);
                });
        } else
            svg.waveGroup.attr('transform','translate('+properties.waveGroupXPosition+','+properties.waveRiseScale(properties.fillPercent)+')');

        if (config.waveAnimate) 
            animateWave();

        updateTextLabels(value);

        deferred.resolve();
        return deferred.promise();
    }

    function animateWave() {
        var svg = cylinder.svg;
        var properties = getSVGProperties(cylinder.config, cylinder.value);

        svg.wave.attr('transform', 'translate(' + properties.waveAnimateScale(svg.wave.attr('T')) + ',0)');
        svg.wave.transition()
            .duration(properties.waveAnimateTime * (1 - svg.wave.attr('T')))
            .ease('linear')
            .attr('transform', 'translate(' + properties.waveAnimateScale(1) + ',0)')
            .attr('T', 1)
            .each('end', function () {
                svg.wave.attr('T', 0);
                animateWave(properties.waveAnimateTime);
            });
    }

    function update(value) {
        // Checks if the current value is valid.
        if (value > cylinder.config.maxValue) cylinder.value = cylinder.config.maxValue;
        if (value < cylinder.config.minValue) cylinder.value = cylinder.config.minValue;

        cylinder.value = value;

        // Gets the properties used to create the new svg and animate waves.
        var properties = getSVGProperties(cylinder.config, cylinder.value);
        var svg = cylinder.svg,
            config = cylinder.config;

        var newWavePosition = config.waveAnimate ? properties.waveAnimateScale(1) : 0;

        svg.wave.transition()
            .duration(0)
            .transition()
            .duration(config.waveAnimate ? (config.waveAnimateTime * (1 - svg.wave.attr('T'))) : (config.waveRiseTime))
            .ease('linear')
            .attr('d', properties.clipArea)
            .attr('transform','translate('+newWavePosition+', 0)')
            .attr('T','1')
            .each("end", function() {
                if (config.waveAnimate) {
                    svg.wave.attr('transform', 'translate('+ properties.waveAnimateScale(0) +', 0)');
                    animateWave(config.waveAnimateTime);
                }
            });

        svg.waveGroup.transition()
                .duration(config.waveRiseTime)
                .attr('transform','translate('+properties.waveGroupXPosition+','+properties.waveRiseScale(properties.fillPercent)+')')
                .each("start", function() {
                    if (cylinder.value != config.maxValue)
                        svg.top
                            .style("fill", config.cylinder.top.color)
                            .style("opacity", 1); 
                })
                .each("end", function() {
                    if (cylinder.value == config.maxValue)
                        svg.top
                            .style("fill", config.waveColor)
                            .style("opacity", config.waveOpacity);
                });
    }

    function getSVGProperties(config, value) {
        // sets width and height to 400, 535 in order to do all the calculations to match the viewBox of the svg. After the SVG is rendered, it is resized to fill fully its container.
        
        var width  = 350,
            height = 440;

        var svg = cylinder.svg;
        var properties = {};

        // general
        properties.fillPercent = (((value - (config.minValue)) * 100) / (config.maxValue - config.minValue)) / 100;

        // wave
        var range, domain;

        if (config.waveHeightScaling) {
            range = [0, config.waveHeight, 0];
            domain = [0, 50, 100];
        } else {
            range = [config.waveHeight, config.waveHeight];
            domain = [0, 100];
        }

        properties.waveAnimateTime = config.waveAnimateTime;
        properties.waveHeightScale = d3.scale.linear().range(range).domain(domain);
        properties.waveHeight = (height/2) * properties.waveHeightScale(properties.fillPercent * 100);
        properties.waveLength = width / config.waveCount;
        properties.waveClipCount = 1 + config.waveCount;
        properties.waveClipWidth = properties.waveLength * properties.waveClipCount;
        properties.waveGroupXPosition = width - properties.waveClipWidth + 81; // +81 because it is translated. See cylinderGroup element.

        // Scales for controlling the size of the clipping path.
        properties.waveScaleX = d3.scale.linear().range([0, properties.waveClipWidth]).domain([0, 1]);
        properties.waveScaleY = d3.scale.linear().range([0, properties.waveHeight]).domain([0, 1]);

        // Scales for controlling the position of the clipping path.
        properties.waveRiseScale = d3.scale.linear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
            .range([(height + properties.waveHeight+75), (properties.waveHeight+75)]) // +75 because it is translated. See cylinderGroup element.
            .domain([0, 1]);

        properties.waveAnimateScale = d3.scale.linear()
            .range([0, properties.waveClipWidth - width]) // Push the clip area one full wave then snap back.
            .domain([0, 1]);

        // The clipping wave area.
        properties.clipArea = d3.svg.area()
            .x(function(d) { return properties.waveScaleX(d.x); } )
            .y0(function(d) { return properties.waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI)); })
            .y1(function(d) { return ((height) + properties.waveHeight); } );

        // Texts' properties.
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

    function updateTextLabels(value) {
        var config = cylinder.config,
            svg = cylinder.svg;

        var properties = getSVGProperties(config, value);

        var textAnchor = "start";   // text anchor for min/max values.
        var coords = {};
        coords.min = { x: 520-81, y: 500 }; // x,y coordinates for positioning the min text element
        coords.max = { x: 520-81, y: properties.maxTextPixels };       // x,y coordinates for positioning the max text element

        /** 
         * Texts where the wave does not overlap
        */            
        svg.maxText1 // max value text
            .text(properties.textRounder(config.maxValue).toFixed(config.text.maxValueDecimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr(coords.max)
            .attr("font-size", properties.maxTextPixels + "px")
            .style("fill", config.text.maxTextColor);

        svg.minText1 // min value text
            .text(properties.textRounder(config.minValue).toFixed(config.text.minValueDecimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr(coords.min)
            .attr("font-size", properties.minTextPixels + "px")
            .style("fill", config.text.minTextColor);


        /** 
         * Texts where the wave does overlap
        */
        // svg.maxText2 // max value text
        //     .text(properties.textRounder(config.maxValue).toFixed(config.text.maxValueDecimalPlaces))
        //     .attr("text-anchor", textAnchor)
        //     .attr(coords.max)
        //     .attr("font-size", properties.maxTextPixels + "px")
        //     .style("fill", config.text.maxWaveTextColor);

        // svg.minText2 // min value text
        //     .text(properties.textRounder(config.minValue).toFixed(config.text.minValueDecimalPlaces))
        //     .attr("text-anchor", textAnchor)
        //     .attr(coords.min)
        //     .attr("transform", "translate(81, -5)")
        //     .attr("font-size", properties.minTextPixels + "px")
        //     .style("fill", config.text.minWaveTextColor);
    }

}