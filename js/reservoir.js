/**
 * dam svg = <polygon points=""></polygon>
 * 
 * jusante (downstream): do mais alto para o mais baixo
 * montante (upstream): do mais baixo para o mais alto
 * 
 */

function ReservoirElement(selector, config, values) {
    var re = this;
    
    // properties
    re.selector = selector;
    re.config = config == null ? loadDefaultSettings() : config;
    re.downStreamValue = values.down;
    re.upStreamValue = values.up;
    
    // functions
    re.createSVG = createSVG;
    re.createDam = createDam;
    re.createDownstream = createDownstream;
    re.createUpstream = createUpstream;
    //re.createWave = createWave;
    re.animateWave = animateWave;
    
    /////////////////////////////////////
    
    (function() {
        re.createSVG().then(function () {
            re.createDownstream().then(function () {
                re.createUpstream().then(function() {
                    re.createDam();
                });
            });
        });
    })();
    
    function createSVG() {
        var deferred = $.Deferred();
        var container = d3.select(re.selector);
        
        // gets actual svg's width and height
        var width = 500;  //parseInt(re.svg.style("width"));
        var height = 250; //parseInt(re.svg.style("height"));
        
        // appends an svg to the div
        re.svg = container.style("transform", "scale(" + re.config.scale + ")") // @TODO: check if it is really necessary
            .append("svg")
                .attr({ width: width, height: height })
                .attr("preserveAspectRatio", "xMinYMid meet")
                .attr("viewBox", "0 0 " + width + " " + height);            
        
        // append a g element where all contents will be placed in
        re.svg.backgroundGroup = re.svg.append("g").attr("id", "backgroundGroup");
            
        // background rect. @TODO: this may not stay in the final version
        re.svg.backgroundGroup.append("rect")
            .attr("id", "rectBackground")
            .attr({ stroke: "#000", fill: "none" })
            .attr({ width: width, height: height });

        deferred.resolve();
        return deferred.promise();
    }

    function createDam() {
        var deferred = $.Deferred();
        
        // translating dam to the middle of the svg
        var translate = parseInt(re.svg.style("width")) / 2.35;
        
        // append dam element
        re.svg.append("g").attr("id", "damGroup").append("polygon")
            .attr("points", "0.678,0 0.678,443.842 139.225,443.842 62.338,0")
            .attr("transform", "translate(" + translate + ")")
            .style("stroke-width", re.config.dam.strokeThickness)
            .style("stroke", re.config.dam.strokeColor)
            .style("fill", re.config.dam.fillColor);

        deferred.resolve();
        return deferred.promise();
    }

    function createDownstream() {
        var deferred = $.Deferred();

        var width = parseInt(re.svg.style("width")) / 2;
        var height = parseInt(re.svg.style("height"));

        re.svg.downStreamGroup = re.svg.append("g")
            .attr("id", "downStreamGroup");

        // re.svg.downStreamGroup.append("rect")
        //     .attr("id", "downstream")
        //     .attr({ width: width, height: height })
        //     .style("stroke-width", 1)
        //     .style("stroke", "green")
        //     .style("fill", "none");
        
        // create wave passing wave downstream config and its value
        createWave(re.svg.downStreamGroup, re.config.downStream, re.downStreamValue);

        deferred.resolve();
        return deferred.promise();
    }

    function createUpstream() {
        var deferred = $.Deferred();

        var width = parseInt(re.svg.style("width")) / 2;
        var height = parseInt(re.svg.style("height"));
        var transform = "translate(" + (width + 1) + ")";

        re.svg.upStreamGroup = re.svg.append("g")
            .attr("id", "upStreamGroup")
            .attr("transform", transform); // +1 only to not overlay the downstream group

        // re.svg.upStreamGroup.append("rect")
        //     .attr("id", "upstream")
        //     .attr({ width: width - 1, height: height })
        //     .style("stroke-width", 1)
        //     .style("stroke", "red")
        //     .style("fill", "none");
        
        // create wave passing wave upstream config and its value
        createWave(re.svg.upStreamGroup, re.config.upStream, re.upStreamValue);

        deferred.resolve();
        return deferred.promise();
    }

    function createWave(group, waveConfig, value) {
        var deferred = $.Deferred();

        var width = parseInt(re.svg.style("width")) / 2;
        var height = parseInt(re.svg.style("height"));
        var elementId = group.attr("id").split("Group")[0];
        var radius = width/2;

        if (value > waveConfig.maxValue) value = waveConfig.maxValue;
        if (value < waveConfig.minValue) value = waveConfig.minValue;

        var fillPercent = (((value - (waveConfig.minValue)) * 100) / (waveConfig.maxValue - waveConfig.minValue)) / 100;

        var waveHeightScale;
        if (waveConfig.waveHeightScaling) {
            waveHeightScale = d3.scale.linear()
                .range([0, waveConfig.waveHeight, 0])
                .domain([0, 50, 100]);
        } else {
            waveHeightScale = d3.scale.linear()
                .range([waveConfig.waveHeight, waveConfig.waveHeight])
                .domain([0, 100]);
        }

        var fillCircleRadius = radius;
        var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);

        var waveLength = fillCircleRadius * 2 / waveConfig.waveCount;
        var waveClipCount = 1 + waveConfig.waveCount;
        var waveClipWidth = waveLength * waveClipCount;

        // Data for building the clip wave area.
        var data = [];
        for (var i = 0; i <= 40 * waveClipCount; i++) {
            data.push({ x: i / (40 * waveClipCount), y: (i / (40)) });
        }

        // Scales for controlling the size of the clipping path.
        var waveScaleX = d3.scale.linear().range([0, waveClipWidth]).domain([0, 1]);
        var waveScaleY = d3.scale.linear().range([0, waveHeight]).domain([0, 1]);

        // Scales for controlling the position of the clipping path.
        var waveRiseScale = d3.scale.linear()
        // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
        // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
        // circle at 100%.
            .range([(fillCircleRadius * 2 + waveHeight), (waveHeight)])
            .domain([0, 1]);
            
        re.waveAnimateScale = d3.scale.linear()
            .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
            .domain([0, 1]);

        // The clipping wave area.
        var clipArea = d3.svg.area()
            .x(function (d) { return waveScaleX(d.x); })
            .y0(function (d) { return waveScaleY(Math.sin(Math.PI * 2 * waveConfig.waveOffset * -1 + Math.PI * 2 * (1 - waveConfig.waveCount) + d.y * 2 * Math.PI)); })
            .y1(function (d) { return (fillCircleRadius * 2 + waveHeight); });
        
        re.waveGroup = group.append("defs")
            .append("clipPath")
            .attr("id", "clipWave" + elementId);

        if (elementId == "upStream") {
            re.waveUp = re.waveGroup.append("path")
                .datum(data)
                .attr("d", clipArea)
                .attr("T", 0);
                
            re.upConfig = waveConfig;
        } else {
            re.waveDown = re.waveGroup.append("path")
                .datum(data)
                .attr("d", clipArea)
                .attr("T", 0);
            re.downConfig = waveConfig;
        }
        
        // The inner rect with the clipping wave attached.
        var g = group.append("g")
                .attr("clip-path", "url(#clipWave" + elementId + ")")
        g.append("rect")
            .attr({ width: width, height: height })
            .style("fill", waveConfig.waveColor);

        // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
        var waveGroupXPosition = fillCircleRadius * 2 - waveClipWidth;

        if (waveConfig.waveRise) {
            re.waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
                .transition()
                .duration(waveConfig.waveRiseTime)
                .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
                .each("start", function () { elementId == "upStream" ? re.waveUp.attr('transform', 'translate(1,0)') : re.waveDown.attr('transform', 'translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } else {
            re.waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
        }
        
        if (waveConfig.waveAnimate) re.animateWave();

        deferred.resolve();
        return deferred.promise();
    }

    function animateWave() {
        if (re.waveUp) {
            re.waveUp.attr('transform', 'translate(' + re.waveAnimateScale(re.waveUp.attr('T')) + ',0)');
            re.waveUp.transition()
                .duration(re.upConfig.waveAnimateTime * (1 - re.waveUp.attr('T')))
                .ease('linear')
                .attr('transform', 'translate(' + re.waveAnimateScale(1) + ',0)')
                .attr('T', 1)
                .each('end', function () {
                    re.waveUp.attr('T', 0);
                    re.animateWave(re.upConfig.waveAnimateTime);
                });
        }
        
        if (re.waveDown) {            
            re.waveDown.attr('transform', 'translate(' + re.waveAnimateScale(re.waveDown.attr('T')) + ',0)');
            re.waveDown.transition()
                .duration(re.downConfig.waveAnimateTime * (1 - re.waveDown.attr('T')))
                .ease('linear')
                .attr('transform', 'translate(' + re.waveAnimateScale(1) + ',0)')
                .attr('T', 1)
                .each('end', function () {
                    re.waveDown.attr('T', 0);
                    re.animateWave(re.downConfig.waveAnimateTime);
                });
        }
    }
}

/** @function loadReservoirSettings
 *  @description Load the default settings to create the reservoir elements
 *  NOTE: not all of the properties are being used at this moment.
*/
function loadReservoirSettings() {
    return {
        downStream: {
            minValue: 0,
            maxValue: 100,
            thickness: 0.05, // @TODO - This don't work as expected. - The outer circle thickness as a percentage of it's radius.
            fillGap: 0.05, // @TODO - This don't work as expected. - The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
            waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
            waveCount: 1, // The number of full waves per width of the wave circle.
            waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
            waveAnimateTime: 10000, // The amount of time in milliseconds for a full wave to enter the wave circle.
            waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
            waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
            waveAnimate: true, // Controls if the wave scrolls or is static.
            waveColor: "#178BCA", // The color of the fill wave.
            waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
            liquidColor: "blue", // the color of the liquid
            minTextColor: "#045681", // the color of the text for the minimum value
            maxTextColor: "#045681", // the color of the text for the maximum value
            liquidOpacity: 0.7 // the liquid opacity
        },
        upStream: {
            minValue: 0,
            maxValue: 100,
            thickness: 0.05, // @TODO - This don't work as expected. - The outer circle thickness as a percentage of it's radius.
            fillGap: 0.05, // @TODO - This don't work as expected. - The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
            waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
            waveCount: 1, // The number of full waves per width of the wave circle.
            waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
            waveAnimateTime: 10000, // The amount of time in milliseconds for a full wave to enter the wave circle.
            waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
            waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
            waveAnimate: true, // Controls if the wave scrolls or is static.
            waveColor: "#178BCA", // The color of the fill wave.
            waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
            liquidColor: "#178BCA", // the color of the liquid
            minTextColor: "#045681", // the color of the text for the minimum value
            maxTextColor: "#045681", // the color of the text for the maximum value
            liquidOpacity: 0.7 // the liquid opacity
        },
        dam: {
            strokeColor: "#000",
            strokeThickness: 1,
            fillColor: "#000"
        },
        scale: 1, // scale
    };
}

(function () {
    var values = {}
    values.down = 50;
    values.up = 73;

    var config = loadReservoirSettings();
    config.upStream.waveAnimateTime = 1000;

    var re = new ReservoirElement("#div-reservoir", config, values);

    
})();