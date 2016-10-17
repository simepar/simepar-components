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
    //re.animateWave = animateWave;
    
    /////////////////////////////////////
    
    function createSVG() {
        var deferred = $.Deferred();
        var container = d3.select(re.selector);
        
        // appends an svg to the div
        re.svg = container
            //.style("transform", "scale("+config.scale+")") // @TODO: check if it is really necessary
            .append("svg")
                .attr({ width: "100%", height: "100%" });

        // gets actual svg's width and height
        var width = parseInt(re.svg.style("width"));
        var height = parseInt(re.svg.style("height"));
        
        // updates svg's viewbox
        re.svg
            .attr("preserveAspectRatio", "xMinYMid meet")
            .attr("viewBox", "0 0 "+width+" "+height);
        
        // append a g element where all contents will be placed in
        re.svg.group = re.svg.append("g");
            
        // background rect. @TODO: this may not stay in the final version
        re.svg.group.append("rect")
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
        re.svg.group.append("polygon")
            .attr("points", "0.678,0 0.678,443.842 139.225,443.842 62.338,0")
            .attr("transform", "translate("+translate+")")
            .style("stroke-width", re.config.strokeThickness)
            .style("stroke", re.config.strokeColor)
            .style("fill", re.config.outerColor);
        
        deferred.resolve();
        return deferred.promise();
    }
    
    function createDownstream() {
        var deferred = $.Deferred();
        
        var width = parseInt(re.svg.style("width")) / 2;
        var height = parseInt(re.svg.style("height"));
        
        re.svg.group.append("rect")
            .attr("id", "downstream")
            .attr({ width: width, height: height })
            .style("stroke-width", 1)
            .style("stroke", "green")
            .style("fill", "none");
        
        // create wave passing wave downstream config and its value
        createWave("DownStream", re.config.downStream, re.downStreamValue);
        
        // The inner drop element with the clipping wave attached.
        re.svg.group.append("g")
                .attr("clip-path", "url(#clipWaveDownStream)")
            .append("rect") // the inner element itself
                .attr({ width: width, height: height })
                .style("fill", re.config.upStream.liquidColor)
                .style("opacity", re.config.upStream.liquidOpacity);
        
        deferred.resolve();
        return deferred.promise();
    }
    
    function createUpstream() {
        var deferred = $.Deferred();
        
        var width = parseInt(re.svg.style("width")) / 2;
        var height = parseInt(re.svg.style("height"));
        var transform = "translate("+(width+1)+")";
        
        re.svg.group.append("rect")
            .attr("id", "upstream")
            .attr({ width: width-1, height: height })
            .attr("transform", transform) // +1 only to not overlay the downstream rect
            .style("stroke-width", 1)
            .style("stroke", "red")
            .style("fill", "none");
        
        // create wave passing wave upstream config and its value
        createWave("UpStream", re.config.upStream, re.upStreamValue);        

        // The inner drop element with the clipping wave attached.
        re.svg.group.append("g")
                .attr("clip-path", "url(#clipWaveUpStream)")
            .append("rect") // the inner element itself
                .attr({ width: width, height: height })
                .attr("transform", transform)
                .style("fill", re.config.upStream.liquidColor)
                .style("opacity", re.config.upStream.liquidOpacity);
        
        deferred.resolve();
        return deferred.promise();
    }
    
    function createWave(id, waveConfig, value) {
        var deferred = $.Deferred();
        
        var width = parseInt(re.svg.style("width")) / 2;
        var height = parseInt(re.svg.style("height"));
        
        var radius = Math.min(width, height) / 2;        
        var fillCircleMargin = (waveConfig.thickness * radius) + (waveConfig.fillGap * radius);
        var fillCircleRadius = radius - fillCircleMargin;
        
        var waveValue = value;
        
        if (value > waveConfig.maxValue) waveValue = waveConfig.maxValue;
        if (value < waveConfig.minValue) waveValue = waveConfig.minValue;
        
        var fillPercent = (((waveValue-(waveConfig.minValue))*100)/(waveConfig.maxValue-waveConfig.minValue))/100;
        var waveHeightScale;

        if (waveConfig.waveHeightScaling)
            waveHeightScale = d3.scale.linear()
                .range([0, waveConfig.waveHeight,0])
                .domain([0,50, 100]);
        else
            waveHeightScale = d3.scale.linear()
                .range([waveConfig.waveHeight, waveConfig.waveHeight])
                .domain([0, 100]);
        
        var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);
        var waveLength = fillCircleRadius * 2 / waveConfig.waveCount;
        var waveClipCount = 1 + waveConfig.waveCount;
        var waveClipWidth = waveLength * waveClipCount;
        
        // // data for building the clip wave area.
        var data = [];
        for(var i = 0; i <= 40 * waveClipCount; i++){
            data.push({x: i/(40 * waveClipCount), y: (i/(40))});
        }
        
        // // Scales for controlling the size of the clipping path.
        var waveScaleX = d3.scale.linear().range([0, waveClipWidth]).domain([0,1]);
        var waveScaleY = d3.scale.linear().range([0, waveHeight]).domain([0,1]);

        // // Scales for controlling the position of the clipping path.
        var waveRiseScale = d3.scale.linear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
            .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight),(fillCircleMargin - waveHeight)])
            .domain([0,1]);
        
        re.waveAnimateScale = d3.scale.linear()
            .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
            .domain([0,1]);
        
        // // The clipping wave area.
        var clipArea = d3.svg.area()
            .x(function(d) { return waveScaleX(d.x); } )
            .y0(function(d) { return waveScaleY(Math.sin(Math.PI * 2 * waveConfig.waveOffset * -1 + Math.PI * 2 * (1 - waveConfig.waveCount) + d.y * 2 * Math.PI));} )
            .y1(function(d) { return (fillCircleRadius * 2 + waveHeight); } );
        
        var waveGroup = re.svg.group.append("defs")
            .append("clipPath")
            .attr("id", "clipWave" + id);
        
        re.wave = waveGroup.append("path")
            .datum(data)
            .attr("d", clipArea)
            .attr("T", 0);
        
        var waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
        
        if (waveConfig.waveRise) {
            waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(0)+')')
                .transition()
                .duration(waveConfig.waveRiseTime)
                .attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')')
                .each("start", function(){ re.wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } 
        else
            re.waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')');
        
        re.waveConfig = waveConfig;
        
        // wave animation
        if (waveConfig.waveAnimate) animateWave(); 
        
        deferred.resolve();
        return deferred.promise();
    }
    
    function animateWave() {            
        re.wave.attr('transform','translate('+re.waveAnimateScale(re.wave.attr('T'))+',0)');
        re.wave.transition()
            .duration(re.waveConfig.waveAnimateTime * (1-re.wave.attr('T')))
            .ease('linear')
            .attr('transform','translate('+re.waveAnimateScale(1)+',0)')
            .attr('T', 1)
            .each('end', function(){
                re.wave.attr('T', 0);
                animateWave(re.waveConfig.waveAnimateTime);
            });
    }
}

/** @function loadDefaultSettings
 *  @description Load the default settings to create the reservoir elements
 *  NOTE: not all of the properties are being used at this moment.
*/
function loadDefaultSettings() {
    return {
        downStream: {
            minValue: 0,
            maxValue: 100,
            thickness: 0.05, // @TODO - This don't work as expected. - The outer circle thickness as a percentage of it's radius.
            fillGap: 0.05, // @TODO - This don't work as expected. - The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
            waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
            waveCount: 1, // The number of full waves per width of the wave circle.
            waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
            waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
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
        upStream: {
            minValue: 0,
            maxValue: 100,
            thickness: 0.05, // @TODO - This don't work as expected. - The outer circle thickness as a percentage of it's radius.
            fillGap: 0.05, // @TODO - This don't work as expected. - The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
            waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
            waveCount: 1, // The number of full waves per width of the wave circle.
            waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
            waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
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
        strokeThickness: 1, // @TODO - Apply this to external. Keep the internal gap.
        strokeColor: "#178BCA",
        outerColor: "none",
        innerColor: "#178BCA", // The color of the outer circle.
        //textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
        //valueCountUp: false, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        //displayPercent: false, // If true, a % symbol is displayed after the value.
        textColor: "#045681", // The color of the value text when the wave does not overlap it.
        waveTextColor: "#A4DBf8", // The color of the value text when the wave overlaps it.
        scale: 1, // scale
        
    };
}

(function() {
    
    var values = {}
    values.down = 23;
    values.up = 73;    
    
    var config = loadDefaultSettings();
    config.strokeColor = "#000";
    config.outerColor = "#000";
    
    var re = new ReservoirElement("#div-reservoir", config, values);

    re.createSVG();
    re.createDownstream();
    re.createUpstream();
        
    re.createDam();
    
})();