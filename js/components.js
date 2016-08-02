/** @function WeatherElement
 *  Create and configure the generic weather element based on the element set as parameter
 *  @param {String} selector - div id
 *  @param {Number} value    - the value for the element from config.min to config.max
 *  @param {Object} el       - object that contains all the properties/values to customize the element and the element itself
*/
function WeatherElement(selector, value, el) {
    var we = this;
    
    // properties
    we.selector = selector; // div selector
    we.value    = value;    // the value for the element
    we.element  = el;       // the element itself
    
    // functions
    we.createSVG   = createSVG;
    we.createOuter = createOuterElement;
    we.createInner = createInnerElement;
    we.createWave  = createWave;
    we.animateWave = animateWave;
    we.update      = update;
    
    /////////////////////////
    
    /** @function createSVG
     *  Create and configure the svg element without its elements
    */
    function createSVG() {
        var deferred = $.Deferred();
        var margin = {top: 5, right: 5, bottom: 5, left: 5};
        
        // adjust div selector to the fixed width and height
        // TODO: do it in a better way
        $(we.selector).width(we.element.config.width);
        $(we.selector).height(we.element.config.height);
        
        // appending and setting svg's height and width
        we.svg = d3.select(selector)
            .style("transform", "scale("+we.element.config.scale+")")
            .append("svg")
                .attr({ width: "100%", height: "100%" })
                .attr("preserveAspectRatio", "xMinYMid meet")
                .attr("viewBox", "0 0 "+we.element.config.width+" "+we.element.config.height);
        
        // append a g element where all contents will be placed in
        we.elementGroup = we.svg.append("g")
            .attr("transform", "translate("+margin.left+","+margin.top+")");
            
        deferred.resolve();
        return deferred.promise();
    }
    
    /** @function createOuterElement
     *  Create and configure the outer element
    */
    function createOuterElement() {
        var deferred = $.Deferred();
        
        // outer element properties
        we.elementGroup.append("path")
            .attr("d", we.element.outerd)
            .attr("transform", we.element.transformOuter)
            .style("stroke-width", we.element.config.strokeThickness)
            .style("stroke", we.element.config.strokeColor)
            .style("fill", we.element.config.outerColor);
        
        // text min
        we.elementGroup.append("text")
            .text(we.element.config.minValue)
            .attr("text-anchor", we.element.textMinAnchor)
            .attr("font-size", we.element.textPixels + "px")
            .style("fill", we.element.config.minTextColor)
            .attr("transform", we.element.transformTextMin);
            
        // text max
        we.elementGroup.append("text")
            .text(we.element.config.maxValue)
            .attr("text-anchor", we.element.textMaxAnchor)
            .attr("font-size", we.element.textPixels + "px")
            .style("fill", we.element.config.maxTextColor)
            .attr('transform', we.element.transformTextMax);
        
        deferred.resolve();
        return deferred.promise();
    }
    
    /** @function createInnerElement
     *  Create and configure the inner element
    */
    function createInnerElement() {
        var deferred = $.Deferred();
        
        // The inner drop element with the clipping wave attached.
        we.elementGroup.append("g")
                .attr("clip-path", "url(#clipWave" + we.selector.split("#")[1] + ")")
            .append("path") // the inner element itself
                .attr("d", we.element.innerd)
                .attr("transform", we.element.transformInner)
                .style("fill", we.element.config.liquidColor)
                .style("opacity", we.element.config.liquidOpacity);
        
        // wave animation
        if (we.element.config.waveAnimate) 
            we.animateWave();
                
        deferred.resolve();
        return deferred.promise();
    }
    
    function createWave() {
        var deferred = $.Deferred();
        
        we.radius = Math.min(we.element.config.width, we.element.config.height) / 2;        
        we.fillCircleMargin = (we.element.config.thickness * we.radius) + (we.element.config.fillGap * we.radius);
        we.fillCircleRadius = we.radius - we.fillCircleMargin;
        
        if (we.element.fillPercent)
            we.fillPercent = we.element.fillPercent(value);
        else
            we.fillPercent = (((value-(we.element.config.minValue))*100)/(we.element.config.maxValue-we.element.config.minValue))/100;

        if(we.element.config.waveHeightScaling){
            we.waveHeightScale = d3.scale.linear()
                .range([0,we.element.config.waveHeight,0])
                .domain([0,50,100]);
        } else {
            we.waveHeightScale = d3.scale.linear()
                .range([we.element.config.waveHeight,we.element.config.waveHeight])
                .domain([0,100]);
        }
        
        we.waveHeight = we.fillCircleRadius * we.waveHeightScale(we.fillPercent * 100);
        we.waveLength = we.fillCircleRadius * 2 / we.element.config.waveCount;
        we.waveClipCount = 1 + we.element.config.waveCount;
        we.waveClipWidth = we.waveLength * we.waveClipCount;
        
        // data for building the clip wave area.
        var data = [];
        for(var i = 0; i <= 40 * we.waveClipCount; i++){
            data.push({x: i/(40 * we.waveClipCount), y: (i/(40))});
        }
        
        // Scales for controlling the size of the clipping path.
        we.waveScaleX = d3.scale.linear().range([0, we.waveClipWidth]).domain([0,1]);
        we.waveScaleY = d3.scale.linear().range([0, we.waveHeight]).domain([0,1]);

        // Scales for controlling the position of the clipping path.
        we.waveRiseScale = d3.scale.linear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
            .range([(we.fillCircleMargin + we.fillCircleRadius * 2 + we.waveHeight),(we.fillCircleMargin - we.waveHeight)])
            .domain([0,1]);
        
        we.waveAnimateScale = d3.scale.linear()
            .range([0, we.waveClipWidth - we.fillCircleRadius*2]) // Push the clip area one full wave then snap back.
            .domain([0,1]);
        
        // The clipping wave area.
        we.clipArea = d3.svg.area()
            .x(function(d) { return we.waveScaleX(d.x); } )
            .y0(function(d) { return we.waveScaleY(Math.sin(Math.PI * 2 * we.element.config.waveOffset * -1 + Math.PI * 2 * (1 - we.element.config.waveCount) + d.y * 2 * Math.PI));} )
            .y1(function(d) { return (we.fillCircleRadius*2 + we.waveHeight); } );
        
        we.waveGroup = we.elementGroup.append("defs")
            .append("clipPath")
            .attr("id", "clipWave" + we.selector.split("#")[1]);
        
        we.wave = we.waveGroup.append("path")
            .datum(data)
            .attr("d", we.clipArea)
            .attr("T", 0);
        
        we.waveGroupXPosition = we.fillCircleMargin+we.fillCircleRadius*2-we.waveClipWidth;
        
        if(we.element.config.waveRise){
            we.waveGroup.attr('transform','translate('+we.waveGroupXPosition+','+we.waveRiseScale(0)+')')
                .transition()
                .duration(we.element.config.waveRiseTime)
                .attr('transform','translate('+we.waveGroupXPosition+','+we.waveRiseScale(we.fillPercent)+')')
                .each("start", function(){ we.wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } else {
            we.waveGroup.attr('transform','translate('+we.waveGroupXPosition+','+we.waveRiseScale(we.fillPercent)+')');
        }
        
        if (we.element.config.waveAnimate) we.animateWave();
        
        deferred.resolve();
        return deferred.promise();
    }
    
    function animateWave() {
        we.wave.attr('transform','translate('+we.waveAnimateScale(we.wave.attr('T'))+',0)');
        we.wave.transition()
            .duration(we.element.config.waveAnimateTime * (1-we.wave.attr('T')))
            .ease('linear')
            .attr('transform','translate('+we.waveAnimateScale(1)+',0)')
            .attr('T', 1)
            .each('end', function(){
                we.wave.attr('T', 0);
                animateWave(we.element.config.waveAnimateTime);
            });
    }
    
    function update(value) {
        if (we.element.fillPercent)
            we.fillPercent = we.element.fillPercent(value);
        else
            we.fillPercent = (((value-(we.element.config.minValue))*100)/(we.element.config.maxValue-we.element.config.minValue))/100;
        
        we.waveHeight = we.fillCircleRadius * we.waveHeightScale(we.fillPercent * 100);
        
        we.waveRiseScale = d3.scale.linear()
            // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
            // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
            // circle at 100%.
            .range([(we.fillCircleMargin+we.fillCircleRadius*2+we.waveHeight),(we.fillCircleMargin-we.waveHeight)])
            .domain([0,1]);
        
        var newHeight = we.waveRiseScale(we.fillPercent);
        we.waveScaleX = d3.scale.linear().range([0, we.waveClipWidth]).domain([0,1]);
        we.waveScaleY = d3.scale.linear().range([0, we.waveHeight]).domain([0,1]);
        
        var newClipArea;
        
        if(we.element.config.waveHeightScaling){
            newClipArea = d3.svg.area()
                .x(function(d) { return we.waveScaleX(d.x); } )
                .y0(function(d) { return we.waveScaleY(Math.sin(Math.PI*2*we.element.config.waveOffset*-1 + Math.PI*2*(1-we.element.config.waveCount) + d.y*2*Math.PI));} )
                .y1(function(d) { return (we.fillCircleRadius*2 + we.waveHeight); } );
        } else {
            newClipArea = we.clipArea;
        }

        var newWavePosition = we.element.config.waveAnimate ? we.waveAnimateScale(1) : 0;
        we.wave.transition()
            .duration(0)
            .transition()
            .duration(we.element.config.waveAnimate ? (we.element.config.waveAnimateTime * (1-we.wave.attr('T'))):(we.element.config.waveRiseTime))
            .ease('linear')
            .attr('d', newClipArea)
            .attr('transform','translate('+newWavePosition+',0)')
            .attr('T','1')
            .each("end", function(){
                if(we.element.config.waveAnimate){
                    we.wave.attr('transform','translate('+we.waveAnimateScale(0)+',0)');
                    animateWave(we.element.config.waveAnimateTime);
                }
            });
        we.waveGroup.transition()
            .duration(we.element.config.waveRiseTime)
            .attr('transform','translate('+we.waveGroupXPosition+','+newHeight+')')
    }
}

/** @function Drop
 *  Create and configure the drop element with its own properties
 *  @param {String} selector - div id
 *  @param {Number} value    - the value for the element from config.min to config.max
 *  @param {Object} config   - object that contains all the properties/values to customize the element
*/
function Drop(selector, value, config) {
    var drop = this;
    drop.config = config == null ? loadDefaultSettings() : drop.config = config;
    
    // used to fit the elements in this proportion and then rescale the div
    // TODO: do it in a better way
    drop.config.width = 375;
    drop.config.height = 315;
    
    // outer and inner elements' path
    drop.outerd = "M146.831,0c0,0-116.22,107.715-116.22,181.074c0,68.393,52.043,112.589,116.22,112.589  c64.192,0,116.22-44.196,116.22-112.589C263.051,107.715,146.831,0,146.831,0z";
    drop.innerd = "M146.831,0c0,0-116.22,107.715-116.22,181.074c0,68.393,52.043,112.589,116.22,112.589  c64.192,0,116.22-44.196,116.22-112.589C263.051,107.715,146.831,0,146.831,0z";
    
    // traslating the outer and inner elements to the most left and vertical centered
    drop.transformOuter = "translate(-25, 5)";
    drop.transformInner = "translate(-15, 17) scale(0.93)";
    
    // text labels configs
    drop.textPixels = drop.config.textSize * drop.config.height / 7;
    drop.textMinAnchor = "middle";
    drop.textMaxAnchor = "middle";
    drop.transformTextMin = "translate(285, 300)";
    drop.transformTextMax = "translate(285, 35)";  
    
    // instatiate the weather element for drop element
    var we = new WeatherElement(selector, value, drop);
    
    we.createSVG().then(function() {                // create the svg
        we.createOuter().then(function() {          // create the outer path and text labels
            we.createWave().then(function() {       // create the wave path and defs
                we.createInner().then(function() {  // create the inner path and wave animation
                    // TODO: responsiveness in a better way
                    $(we.selector).width("50%");
                    $(we.selector).height("50%");
                    
                    drop.update = we.update; // for updating the element
                });
            });
        });
    });
}

/** @function Ruler
 *  Create and configure the ruler element with its own properties
 *  @param {String} selector - div id
 *  @param {Number} value    - the value for the element from config.min to config.max
 *  @param {Object} config   - object that contains all the properties/values to customize the element
*/
function Ruler(selector, value, config) {
    var ruler = this;
    ruler.config = config == null ? loadDefaultSettings() : ruler.config = config;
    
    // used to fit the elements in this proportion and then rescale the div
    // TODO: do it in a better way
    ruler.config.width = 375;
    ruler.config.height = 315;
    
    // outer and inner elements' path
    ruler.outerd = "M297,106c0-4.418-3.582-8-8-8H8c-4.418,0-8,3.582-8,8v85c0,4.418,3.582,8,8,8h281c4.418,0,8-3.582,8-8V106z M281,183h-18   v-43c0-4.418-3.582-8-8-8s-8,3.582-8,8v43h-20v-28c0-4.418-3.582-8-8-8s-8,3.582-8,8v28h-19v-43c0-4.418-3.582-8-8-8s-8,3.582-8,8   v43h-20v-28c0-4.418-3.582-8-8-8s-8,3.582-8,8v28h-20v-43c0-4.418-3.582-8-8-8s-8,3.582-8,8v43H85v-28c0-4.418-3.582-8-8-8   s-8,3.582-8,8v28H49v-43c0-4.418-3.582-8-8-8s-8,3.582-8,8v43H16v-69h265V183z";
    ruler.innerd = "M16,183h17v-43c0-4.418,3.582-8,8-8s8,3.582,8,8v43h20v-28c0-4.418,3.582-8,8-8s8,3.582,8,8v28h19   v-43c0-4.418,3.582-8,8-8s8,3.582,8,8v43h20v-28c0-4.418,3.582-8,8-8s8,3.582,8,8v28h20v-43c0-4.418,3.582-8,8-8s8,3.582,8,8v43h19   v-28c0-4.418,3.582-8,8-8s8,3.582,8,8v28h20v-43c0-4.418,3.582-8,8-8s8,3.582,8,8v43h18v-69H16V183z";
    
    // traslating the outer and inner elements to the most left and vertical centered
    ruler.transformOuter = "translate(-90, 301) rotate(270)";
    ruler.transformInner = "translate(-90, 301) rotate(270)";
    
    // text labels configs
    ruler.textPixels = ruler.config.textSize * ruler.config.height / 7;
    ruler.textMinAnchor = "start";
    ruler.textMaxAnchor = "start";
    ruler.transformTextMin = "translate(125, 297)";
    ruler.transformTextMax = "translate(125, 40)";  
    
    // instatiate the weather element for ruler element
    var we = new WeatherElement(selector, value, ruler);
    
    we.createSVG().then(function() {                // create the svg
        we.createOuter().then(function() {          // create the outer path and text labels
            we.createWave().then(function() {       // create the wave path and defs
                we.createInner().then(function() {  // create the inner path and wave animation
                    // TODO: responsiveness in a better way
                    $(we.selector).width("50%");
                    $(we.selector).height("50%");
                    
                    ruler.update = we.update; // for updating the element
                });
            });
        });
    });
}

/** @function Thermo
 *  Create and configure the thermometer element with its own properties
 *  @param {String} selector - div id
 *  @param {Number} value    - the value for the element from config.min to config.max
 *  @param {Object} config   - object that contains all the properties/values to customize the element
*/
function Thermo(selector, value, config) {
    var thermo = this;
    thermo.config = config == null ? loadDefaultSettings() : thermo.config = config;

    // used to fit the elements in this proportion and then rescale the div
    // TODO: do it in a better way
    thermo.config.width = 375;
    thermo.config.height = 315;
    
    // outer and inner elements' path
    thermo.outerd = "M30.5,60L30.5,60c-0.453,0-0.914-0.026-1.368-0.076c-5.485-0.608-9.923-5.029-10.551-10.512 c-0.502-4.383,1.374-8.605,4.919-11.151V7c0-3.859,3.14-7,7-7s7,3.141,7,7v31.261c3.141,2.257,5,5.857,5,9.739 c0,3.205-1.248,6.219-3.515,8.485C36.719,58.751,33.706,60,30.5,60z M30.5,2c-2.757,0-5,2.243-5 5v32.328l-0.454,0.297 c-3.199,2.088-4.915,5.75-4.478,9.559c0.523,4.565,4.217,8.246,8.785,8.752c3.064,0.346,6.061-0.707,8.218-2.864 C39.46,53.183,40.5,50.671,40.5,48c0-3.387-1.7-6.518-4.546-8.375L35.5,39.329V7C35.5,4.243,33.257,2,30.5,2z";
    thermo.innerd = "M31.5,43.101V6c0-0.553-0.448-1-1-1s-1,0.447-1,1v37.101c-2.282,0.463-4,2.48-4,4.899 c0,2.761,2.239,5,5,5s5-2.239,5-5C35.5,45.581,33.782,43.564,31.5,43.101z";
    
    // traslating the outer and inner elements to the most left and vertical centered
    thermo.transformOuter = "translate(-85, 0) scale(5)";
    thermo.transformInner = "translate(-85, 0) scale(5)";
    
    // text labels configs
    thermo.textPixels = thermo.config.textSize * thermo.config.height / 7;
    thermo.textMinAnchor = "start";
    thermo.textMaxAnchor = "start";
    thermo.transformTextMin = "translate(115, 200)";
    thermo.transformTextMax = "translate(130, 35)";
    
    // until the minimum value, thermometer has it filled on the element. So because of that, we used another scale different from min to max => 0 to 100.
    // we used the scale min to max => 37.5 to 100. The 37.5 is because that's the amount needed to fill the "circle portion" inside de element
    // basically, this function returns the number that matches from min to max into the scale from 37.5 to 100.
    // In other words, min = 37.5, max = 100 and the value X in the first scale is calculated to match its correspondent value in the second scale
    thermo.fillPercent = function(value) { 
        // the formula to find the X value is:
        // (value - min) / (max - min) = (X - 37.5) / (100 - 37.5)
        return ((((value - thermo.config.minValue) * (100-37.5)) + ((thermo.config.maxValue - thermo.config.minValue) * 37.5)) / (thermo.config.maxValue - thermo.config.minValue)) / 100;
    }
    
    // instatiate the weather element for thermo element
    var we = new WeatherElement(selector, value, thermo);
    
    // functions
    thermo.fixOuterElement = fixOuterElement;
    
    /////////////////////////
    
    /** @function fixOuterElement
     *  Add the markers at the left side of the thermometer
    */
    function fixOuterElement() {
        var deferred = $.Deferred();
        
        // d attribute for the paths, which are the markers
        var ds = ["M26.5,8h-2c-0.552,0-1-0.447-1-1s0.448-1,1-1h2c0.552,0,1,0.447,1,1S27.052,5,26.5,5z",
                  "M26.5,8h-2c-0.552,0-1-0.447-1-1s0.448-1,1-1h2c0.552,0,1,0.447,1,1S27.052,8,26.5,8z",
                  "M26.5,13h-2c-0.552,0-1-0.447-1-1s0.448-1,1-1h2c0.552,0,1,0.447,1,1S27.052,13,26.5,13z",
                  "M26.5,18h-2c-0.552,0-1-0.447-1-1s0.448-1,1-1h2c0.552,0,1,0.447,1,1S27.052,18,26.5,18z",
                  "M26.5,23h-2c-0.552,0-1-0.447-1-1s0.448-1,1-1h2c0.552,0,1,0.447,1,1S27.052,23,26.5,23z",
                  "M26.5,28h-2c-0.552,0-1-0.447-1-1s0.448-1,1-1h2c0.552,0,1,0.447,1,1S27.052,28,26.5,28z",
                  "M26.5,33h-2c-0.552,0-1-0.447-1-1s0.448-1,1-1h2c0.552,0,1,0.447,1,1S27.052,33,26.5,33z",
                  "M26.5,38h-2c-0.552,0-1-0.447-1-1s0.448-1,1-1h2c0.552,0,1,0.447,1,1S27.052,38,26.5,38z"]
        
        // create all the paths in their positions, sizes, and color
        we.elementGroup.selectAll("path")
            .data(ds).enter()
            .append("path")
            .attr("d", function(d, i) { return d; })
            .attr("transform", "scale(4.6) translate(-16, 2.5)")
            .style("fill", thermo.config.outerColor);
            
        deferred.resolve();
        return deferred.promise();
    }
    
    we.createSVG().then(function() {                    // create the svg
        we.createOuter().then(function() {              // create the outer path and text labels
            thermo.fixOuterElement().then(function() {  // create the paths for the markers on the left side of the thermometer
                we.createWave().then(function() {       // create the wave path and defs
                    we.createInner().then(function() {  // create the inner path and wave animation
                        // TODO: responsiveness in a better way
                        $(we.selector).width("50%");
                        $(we.selector).height("50%");
                        
                        thermo.update = we.update; // for updating the element
                    });
                });
            });
        });
    });
}

/** @function Leaf
 *  Create and configure the wet leaf element with its own properties
 *  @param {String} selector - div id
 *  @param {Number} value    - the value for the element from config.min to config.max
 *  @param {Object} config   - object that contains all the properties/values to customize the element
*/
function Leaf(selector, value, config) {
    var leaf = this;
    leaf.config = config == null ? loadDefaultSettings() : leaf.config = config;

    // used to fit the elements in this proportion and then rescale the div
    // TODO: do it in a better way
    leaf.config.width = 375;
    leaf.config.height = 315;
    
    // outer and inner elements' path
    leaf.outerd = "M44.142,24.938c9.279,19.309,9.176,42.223-0.321,68.108c-28.871,78.752,1.61,124.571,1.92,125.022    c17.334,26.978,39.466,40.624,65.829,40.624c19.874,0,41.881-7.664,65.405-22.773l2.807-1.795    c-37.181-34.794-78.393-72.481-84.403-122.798c-0.838-7.006,4.998-10.595,10.459-10.138c-3.796,2.23-6.505,6.695-4.835,11.999    c15.246,48.489,47.771,84.599,84.186,117.484c0.696,0.631,1.403,1.256,2.099,1.882c0.702,0.626,1.398,1.262,2.099,1.887    c9.763,8.692,19.749,17.187,29.741,25.64c9.274,7.843,18.536,15.659,27.592,23.584c9.339,8.175,20.712-7.375,11.417-15.507    c-17.106-14.968-35-29.491-52.21-44.595c-0.702-0.615-1.387-1.246-2.089-1.866c-0.702-0.62-1.392-1.246-2.094-1.871    c19.091-13.07,34.756-26.853,38.655-45.471c3.361-16.056-2.252-34.669-17.149-56.893C188.973,66.319,77.369,19.825,24.376,0    C31.686,6.081,39.002,14.245,44.142,24.938z";
    leaf.innerd = "M44.142,24.938c9.279,19.309,9.176,42.223-0.321,68.108c-28.871,78.752,1.61,124.571,1.92,125.022    c17.334,26.978,39.466,40.624,65.829,40.624c19.874,0,41.881-7.664,65.405-22.773l2.807-1.795    c-37.181-34.794-78.393-72.481-84.403-122.798c-0.838-7.006,4.998-10.595,10.459-10.138c-3.796,2.23-6.505,6.695-4.835,11.999    c15.246,48.489,47.771,84.599,84.186,117.484c0.696,0.631,1.403,1.256,2.099,1.882c0.702,0.626,1.398,1.262,2.099,1.887    c9.763,8.692,19.749,17.187,29.741,25.64c9.274,7.843,18.536,15.659,27.592,23.584c9.339,8.175,20.712-7.375,11.417-15.507    c-17.106-14.968-35-29.491-52.21-44.595c-0.702-0.615-1.387-1.246-2.089-1.866c-0.702-0.62-1.392-1.246-2.094-1.871    c19.091-13.07,34.756-26.853,38.655-45.471c3.361-16.056-2.252-34.669-17.149-56.893C188.973,66.319,77.369,19.825,24.376,0    C31.686,6.081,39.002,14.245,44.142,24.938z";
    
    // traslating the outer and inner elements to the most left and vertical centered
    leaf.transformOuter = "translate(-20, 10)";
    leaf.transformInner = "translate(-20, 10)";
    
    // text labels configs
    leaf.textPixels = leaf.config.textSize * leaf.config.height / 7;
    leaf.textMinAnchor = "start";
    leaf.textMaxAnchor = "middle";
    leaf.transformTextMin = "translate(255, 300)";
    leaf.transformTextMax = "translate(255, 35)";
    
    // instatiate the weather element for leaf element
    var we = new WeatherElement(selector, value, leaf);  
    
    we.createSVG().then(function() {                // create the svg
        we.createOuter().then(function() {          // create the outer path and text labels
            we.createWave().then(function() {       // create the wave path and defs
                we.createInner().then(function() {  // create the inner path and wave animation
                    // TODO: responsiveness in a better way
                    $(we.selector).width("50%");
                    $(we.selector).height("50%");
                    
                    leaf.update = we.update; // for updating the element
                });
            });
        });
    });
}

/** @function loadDefaultSettings
 *  Load the default settings to create the weather elements
 *  NOTE: not all of the properties are being used at this moment.
*/
function loadDefaultSettings() {
    return {
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.
        thickness: 0.05, // @TODO - This don't work as expected. - The outer circle thickness as a percentage of it's radius. 
        strokeThickness: 1, // @TODO - Apply this to external. Keep the internal gap.
        strokeColor: "#178BCA",
        outerColor: "none",
        fillGap: 0.05, // @TODO - This don't work as expected. - The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        innerColor: "#178BCA", // The color of the outer circle.
        waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1, // The number of full waves per width of the wave circle.
        waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveColor: "#178BCA", // The color of the fill wave.
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        //textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
        //valueCountUp: false, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        //displayPercent: false, // If true, a % symbol is displayed after the value.
        textColor: "#045681", // The color of the value text when the wave does not overlap it.
        waveTextColor: "#A4DBf8", // The color of the value text when the wave overlaps it.
        scale: 1, // scale
        liquidColor: "#178BCA",
        minTextColor: "#045681",
        maxTextColor: "#045681",
        liquidOpacity: 0.7
    };
}