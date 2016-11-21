function loadReservoirSettings() {
    return {
        downStream: {
            minValue: 0,
            maxValue: 100,
            scale: 1,
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
            textSize: 0.4, // The relative height of the text to display in the wave circle. 1 = 50%
            decimalPlaces: 2, // how many decimal places it should be displayed
            minTextColor: "#045681", // the color of the text for the minimum value
            maxTextColor: "#045681", // the color of the text for the maximum value
            valueTextColor: "#045681", // The color of the value text when the wave does not overlap it.
            waveTextColor: "#A4DBf8", // The color of the value text when the wave overlaps it.
            ruler: {
                color: "#045681", // The color of the value text when the wave does not overlap it.
                waveColor: "#A4DBf8", // The color of the fill wave.
                textSize: 0.25, // The relative height of the text to display in the wave circle. 1 = 50%
                decimalPlaces: 2, // how many decimal places it should be displayed
            },
        },
        upStream: {
            minValue: 0,
            maxValue: 100,
            scale: 1,
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
            textSize: 0.4, // The relative height of the text to display in the wave circle. 1 = 50%
            decimalPlaces: 2, // how many decimal places it should be displayed
            minTextColor: "#045681", // the color of the text for the minimum value
            maxTextColor: "#045681", // the color of the text for the maximum value
            valueTextColor: "#045681", // The color of the value text when the wave does not overlap it.
            waveTextColor: "#A4DBf8", // The color of the value text when the wave overlaps it.
            ruler: {
                color: "#045681", // The color of the value text when the wave does not overlap it.
                waveColor: "#A4DBf8", // The color of the fill wave.
                textSize: 0.25, // The relative height of the text to display in the wave circle. 1 = 50%
                decimalPlaces: 2, // how many decimal places it should be displayed
            },
        },
        dam: {
            strokeColor: "#636363",
            strokeThickness: 2,
            fillColor: "#636363"
        }
    };
}

function ReservoirElement(selector, values, config) {
    var re = this;
    
    // properties
    re.selector = selector;
    re.config = config == null ? loadReservoirSettings() : config;
    re.downStreamValue = values.down;
    re.upStreamValue = values.up;
    
    // functions
    re.createSVG = createSVG;
    re.createDam = createDam;
    re.createDownStream = createDownStream;
    re.createUpStream = createUpStream;
    re.update = update;

    /////////////////////////////////////
    
    // creates and displays the svg fully working
    (function() {
        re.createSVG().then(function () {
            re.createDownStream().then(function () {
                re.createUpStream().then(function() {
                    re.createDam().then(function() {
                        // fit svg to its container div
                        re.svg.attr({ width: "100%", height: "100%" });
                    });
                });
            });
        });
    })();

    /** @function createSVG
     *  @description Creates the main svg
    */
    function createSVG() {
        var deferred = $.Deferred();
        var container = d3.select(re.selector);
        
        var width = 500, // parseInt(container.style("width")), 
            height = width/2;

        // appends an svg to the div
        re.svg = container.style("transform", "scale("+re.config.scale+")")
            .append("svg")
                .attr("id", "reservoir-svg")
                .attr({ width: width, height: height })
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + width + " " + height)
                .style("margin", "0 auto")  // center svg 
                .style("display", "block"); // in its container

        deferred.resolve();
        return deferred.promise();
    }

    /** @function update
     *  @description Update the whole svg
     *  @param {Object} values - current value for both up and downstreams, used to rise the wave
    */
    function update(values) {
        updateSVG(re.downStreamSVG, re.config.downStream, values.down); // updating downstream
        updateSVG(re.upStreamSVG, re.config.upStream, values.up); // updating upstream
    }

    /** @function updateSVG
     *  @description Update the nested svg (upstream and downstream) with new config or new value
     *  @param {Object} svg - downstream or upstream svg object
     *  @param {Object} config - object that contains all the properties/values to customize the element
     *  @param {Number} value - current value, used to rise the wave
    */
    function updateSVG(svg, config, value) {
        setSVGProperties(svg, config, value);

        var newWavePosition = config.waveAnimate ? svg.waveAnimateScale(1) : 0;

        svg.wave.transition()
            .duration(0)
            .transition()
            .duration(config.waveAnimate ? (config.waveAnimateTime * (1 - svg.wave.attr('T'))) : (svg.config.waveRiseTime))
            .ease('linear')
            .attr('d', svg.clipArea)
            .attr('transform','translate('+newWavePosition+', 0)')
            .attr('T','1')
            .each("end", function() {
                if (config.waveAnimate) {
                    svg.wave.attr('transform', 'translate('+ svg.waveAnimateScale(0) +', 0)');
                    animateWave(svg, config.waveAnimateTime);
                }
            });

        svg.waveGroup.transition()
                .duration(config.waveRiseTime)
                .attr('transform','translate('+svg.waveGroupXPosition+','+svg.waveRiseScale(svg.fillPercent)+')');

        var translate;
        if (svg.attr("id") == "downStream")
            translate = "translate("+(svg.radius)+","+ svg.textHeight +")";
        else
            translate = "translate("+(svg.radius-15)+","+ svg.textHeight +")";

        var textTween = function(){
            var i = d3.interpolate(this.textContent, value);
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

    /** @function createDownStream
     *  @description Creates the svg that represents the downstream part of a reservoir
    */
    function createDownStream() {
        var deferred = $.Deferred();

        var width = parseInt(re.svg.style("width")) / 2;
        var height = parseInt(re.svg.style("height"));

        re.downStreamSVG = re.svg.append("svg")
            .attr("id", "downStream")
            .attr("x", width+1) // +1 only to not overlay the downstream group
            .attr({ width: "50%", height: "100%" })
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height);
        
        // setting properties
        setSVGProperties(re.downStreamSVG, re.config.downStream, re.downStreamValue);

        // create wave passing wave downstream config and its value
        createWave(re.downStreamSVG, re.config.downStream);

        // update text labels
        updateTextLabels(re.downStreamSVG, re.config.downStream);

        // create side-markers to represent a ruler
        createRuler(re.downStreamSVG, re.config.downStream);

        deferred.resolve();
        return deferred.promise();
    }

    /** @function createUpStream
     *  @description Creates the svg that represents the upstream part of a reservoir
    */
    function createUpStream() {
        var deferred = $.Deferred();

        var width = parseInt(re.svg.style("width")) / 2;
        var height = parseInt(re.svg.style("height"));

        re.upStreamSVG = re.svg.append("svg")
            .attr("id", "upStream")
            .attr({ width: "50%", height: "100%" })
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height);
                    
        // setting properties
        setSVGProperties(re.upStreamSVG, re.config.upStream, re.upStreamValue)

        // create wave passing wave upstream config and its value
        createWave(re.upStreamSVG, re.config.upStream);

        // update text labels
        updateTextLabels(re.upStreamSVG, re.config.upStream);

        // create side-markers to represent a ruler
        createRuler(re.upStreamSVG, re.config.upStream);

        deferred.resolve();
        return deferred.promise();
    }

    /** @function createDam
     *  @description Creates the polygon that represents a dam
    */
    function createDam() {
        var deferred = $.Deferred();
        
        // translating dam to the middle (not exactly) of the svg
        var translate = parseInt(re.svg.style("width")) / 2.3;
        
        var width = parseInt(re.svg.style("width"));
        var height = parseInt(re.svg.style("height"));

        // scales to create the dam element
        var scaleX = d3.scale.linear().domain([0,1]).range([0, width]);
        var scaleY = d3.scale.linear().domain([0,1]).range([0, height]);

        // points to create dam element
        var points = [{"x": 0.0, "y": 0.0},
            {"x": 0.0, "y": 1.0},
            {"x": 0.17, "y": 1.0},
            {"x": 0.1, "y": 0.0}];

        // append dam element
        re.svg.append("g").attr("id", "damGroup")
            .selectAll("polygon")
            .data([points])
            .enter()
            .append("polygon")
                .attr("points",function(d) {
                    // returns points to create the element
                    return d.map(function(d) {
                        return [scaleX(d.x), scaleY(d.y)].join(",");
                    }).join(" ");
                })
                .attr("transform", "translate("+translate+", 0)")
                .style("stroke-width", re.config.dam.strokeThickness)
                .style("stroke", re.config.dam.strokeColor)
                .style("fill", re.config.dam.fillColor);

        deferred.resolve();
        return deferred.promise();
    }

    /** @function setSVGProperties
     *  @description Sets the svg's properties that will be used to create the wave, update text labels, etc...
     *  @param {Object} svg - downstream or upstream svg object
     *  @param {Object} config - object that contains all the properties/values to customize the element
     *  @param {Number} value - current value, used to rise the wave
    */
    function setSVGProperties(svg, config, value) {
        // sets width and height to 250 in order to do all the calculations to match the viewBox of the svg. After the SVG is rendered, it is resized to fill fully its container.
        var width = 250;
        var height = 250;

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

        // text
        svg.rulerTextPixels = (config.ruler.textSize * svg.radius / 2);
        svg.textPixels = (config.textSize * svg.radius / 2);
        svg.textFinalValue = parseFloat(value).toFixed(config.decimalPlaces);
        svg.textStartValue = config.valueCountUp ? config.minValue : svg.textFinalValue;
        svg.textHeight = value >= ((90 * config.maxValue)/100) ? svg.waveRiseScale(svg.fillPercent)+25 : svg.waveRiseScale(svg.fillPercent)-5;

        // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
        svg.textRounder = function(value) { return parseFloat(value); };
        // if (parseFloat(svg.textFinalValue) != parseFloat(svg.textRounder(svg.textFinalValue))) svg.textRounder = function(value) { return parseFloat(value).toFixed(config.decimalPlaces); };
        // if (parseFloat(svg.textFinalValue) != parseFloat(svg.textRounder(svg.textFinalValue))) svg.textRounder = function(value) { return parseFloat(value).toFixed(config.decimalPlaces); };
    }

    /** @function createWave
     *  @description Calculate and generate the clipPath to simulate a wave
     *  @param {Object} svg - downstream or upstream svg object
     *  @param {Object} config - object that contains all the properties/values to customize the element
    */
    function createWave(svg, config) {
        var width = parseInt(re.svg.style("width")) / 2;
        var height = parseInt(re.svg.style("height"));

        // Data for building the clip wave area.
        var data = [];
        for(var i = 0; i <= 40 * svg.waveClipCount; i++)
            data.push({ x: i/(40 * svg.waveClipCount), y: (i/(40)) });

        svg.outerGroup = svg.append("g");

        // Text where the wave does not overlap. This is necessary now to guarantee that the wave will not overlap all the labels
        svg.valueText1 = svg.outerGroup.append("text");
        svg.maxText1   = svg.outerGroup.append("text");
        svg.minText1   = svg.outerGroup.append("text");

        // Ruler where the wave does not overlap. This is necessary now to guarantee that the wave will not overlap all the ruler markes.
        // Instead of creating all markers right now, it is created a group and after we append all markers to this group.
        svg.rulerOuterGroup = svg.outerGroup.append("g").attr("id", "rulerOuterGroup");

        svg.waveGroup = svg.outerGroup.append("defs")
            .append("clipPath")
            .attr("id", "clipWave" + svg.attr("id"));

        svg.wave = svg.waveGroup.append("path")
            .datum(data)
            .attr("d", svg.clipArea)
            .attr("T", 0);

        // The inner rect with the clipping wave attached.
        svg.innerGroup = svg.outerGroup.append("g")
            .attr("clip-path", "url(#clipWave" + svg.attr("id") + ")");
        svg.innerGroup.append("rect")
            .attr({ width: width, height: height })
            .style("fill", config.waveColor)
            .style("opacity", config.waveOpacity);

        // Text where the wave does overlap. This is necessary now to guarantee that the wave will overlap all the labels
        svg.valueText2 = svg.innerGroup.append("text");
        svg.maxText2   = svg.innerGroup.append("text");
        svg.minText2   = svg.innerGroup.append("text");     

        // Ruler where the wave does overlap. This is necessary now to guarantee that the wave will overlap all the ruler markes.
        // Instead of creating all markers right now, it is created a group and after we append all markers to this group.
        svg.rulerInnerGroup = svg.innerGroup.append("g").attr("id", "rulerInnerGroup");

        if (config.waveRise) {
            svg.waveGroup.attr('transform','translate('+svg.waveGroupXPosition+','+svg.waveRiseScale(0)+')')
                .transition()
                .duration(config.waveRiseTime)
                .attr('transform','translate('+svg.waveGroupXPosition+','+svg.waveRiseScale(svg.fillPercent)+')')
                .each("start", function(){ svg.wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } else
            svg.waveGroup.attr('transform','translate('+svg.waveGroupXPosition+','+svg.waveRiseScale(svg.fillPercent)+')');

        if (config.waveAnimate) animateWave(svg);
    }

    /** @function animateWave
     *  @description Animate the wave based on its value and configuration
     *  @param {Object} svg - downstream or upstream svg object
    */
    function animateWave(svg) {
        svg.wave.attr('transform', 'translate(' + svg.waveAnimateScale(svg.wave.attr('T')) + ',0)');
        svg.wave.transition()
            .duration(svg.waveAnimateTime * (1 - svg.wave.attr('T')))
            .ease('linear')
            .attr('transform', 'translate(' + svg.waveAnimateScale(1) + ',0)')
            .attr('T', 1)
            .each('end', function () {
                svg.wave.attr('T', 0);
                animateWave(svg, svg.waveAnimateTime);
            });
    }

    /** @function updateTextLabels
     *  @description Gets the text labels in the svg and update its values
     *  @param {Object} svg - downstream or upstream svg object
     *  @param {Object} config - object that contains all the properties/values to customize the element
    */
    function updateTextLabels(svg, config) {
        var width = parseInt(re.svg.style("width")) /2;
        var height = parseInt(re.svg.style("height"));

        var coords = {};
        var textAnchor, translate;

        // calculate the coordinates for all text elements
        if (svg.attr("id") == "downStream") {
            coords.max = { x: width-22, y: (svg.rulerTextPixels-((20 * svg.rulerTextPixels)/100)) };
            coords.min = { x: width-22, y: height-2 };
            textAnchor = "end";
            translate = "translate("+(svg.radius)+","+ svg.textHeight +")";
        }
        else {
            coords.max = { x: 22, y: (svg.rulerTextPixels-((20 * svg.rulerTextPixels)/100)) };
            coords.min = { x: 22, y: height-2 };
            textAnchor = "start";
            translate = "translate("+(svg.radius-15)+","+ svg.textHeight +")";
        }

        // Texts where the wave does not overlap
        svg.valueText1 // current value text
            .text(svg.textStartValue)
            .attr("text-anchor", "middle")
            .attr("font-size", svg.textPixels + "px")
            .style("fill", config.valueTextColor)
            .attr('transform', translate);

        svg.maxText1 // max value text
            .text(svg.textRounder(config.maxValue).toFixed(config.ruler.decimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr(coords.max)
            .attr("font-size", svg.rulerTextPixels + "px")
            .style("fill", config.valueTextColor);

        svg.minText1 // min value text
            .text(svg.textRounder(svg.textStartValue).toFixed(config.ruler.decimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr(coords.min)
            .attr("font-size", svg.rulerTextPixels + "px")
            .style("fill", config.valueTextColor);

        // Texts where the wave does overlap
        svg.valueText2 // current value text
            .text(svg.textStartValue)
            .attr("text-anchor", "middle")
            .attr("font-size", svg.textPixels + "px")
            .style("fill", config.waveTextColor)
            .attr('transform', translate);

        svg.maxText2 // max value text
            .text(svg.textRounder(config.maxValue).toFixed(config.ruler.decimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr(coords.max)
            .attr("font-size", svg.rulerTextPixels + "px")
            .style("fill", config.waveTextColor);

        svg.minText2 // min value text
            .text(svg.textRounder(svg.textStartValue).toFixed(config.ruler.decimalPlaces))
            .attr("text-anchor", textAnchor)
            .attr(coords.min)
            .attr("font-size", svg.rulerTextPixels + "px")
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

    /** @function createRuler
     *  @description Create the side markers to represent a ruler in both sides of the svg
     *  @param {Object} svg - downstream or upstream svg object
     *  @param {Object} config - object that contains all the properties/values to customize the element
    */
    function createRuler(svg, config) {
        var width = parseInt(re.svg.style("width")) / 2; // var height = parseInt(svg.style("height"));
        var height = parseInt(re.svg.style("height"));   // var width = parseInt(svg.style("width"));

        var coords = [];
        var total = parseInt(height/5);
        var x, y=0, w;

        // calculate the [x, y] coords to create the ruler
        for (var i=0; i < total; i++) {
            if (svg.attr("id") == "downStream")
                x = i % 5 == 0 ? width-20 : width - 10; // right side. If variable i is mod 5, it should create the bigger marker
            else
                x = 0; // left side

            w = i % 5 == 0 ? 20 : 10; // If variable i is mod 5, it should create the bigger marker 
            coords.push({ x: x, y: y, width: w, height: 2 });
            y += 5;
        }

        // add the last marker at the bottom of the svg
        coords.push({ 
            x: svg.attr("id") == "downStream" ? width-20 : 0, 
            y: height-2, 
            width: 20, 
            height: 2 
        });

        // markers where the wave does not overlap
        svg.rulerOuterGroup.selectAll("rect")
            .data(coords)
            .enter()
            .append("rect")
                .attr("fill", config.ruler.color)
                .attr("width", function(d) { return d.width })
                .attr("height", function(d) { return d.height })
                .attr("y", function(d) { return d.y })
                .attr("x", function(d) { return d.x });

        // markers where the wave does overlap
        svg.rulerInnerGroup.selectAll("rect")
            .data(coords)
            .enter()
            .append("rect")
                .attr("fill", config.ruler.waveColor)
                .attr("width", function(d) { return d.width })
                .attr("height", function(d) { return d.height })
                .attr("y", function(d) { return d.y })
                .attr("x", function(d) { return d.x });
    }
}