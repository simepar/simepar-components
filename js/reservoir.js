/**
 * dam svg = <polygon points=""></polygon>
 * 
 * jusante (downstream): do mais alto para o mais baixo
 * montante (upstream): do mais baixo para o mais alto
 * 
 */

function ReservoirElement() {
    
    var re = this;
    
    // functions
    re.createSVG = createSVG;
    re.createDam = createDam;
    
    /////////////////////////////////////
    
    function createSVG(selector, config) {
        var deferred = $.Deferred();
        
        var container = d3.select(selector);
        var margin = { top: 5, right: 5, bottom: 5, left: 5 };
        
        // appends an svg to the div
        re.svg = container
            //.style("transform", "scale("+config.scale+")") // @TODO: check if it is really necessary
            .append("svg")
                .attr({ width: "100%", height: "100%" })

        // gets actual svg's width and height
        var width = parseInt(re.svg.style("width"));
        var height = parseInt(re.svg.style("height"));
        
        // updates svg's viewbox
        re.svg
            .attr("preserveAspectRatio", "xMinYMid meet")
            .attr("viewBox", "0 0 "+width+" "+height);
        
        // append a g element where all contents will be placed in
        re.svg.background = re.svg.append("g")
            .attr("transform", "translate("+margin.left+","+margin.top+")")
            .append("rect")
                .attr("id", "rectBackground")
                .attr({ stroke: "#000", fill: "none" })
                .attr({ width: width - margin.left - margin.right, height: height - margin.top - margin.bottom });
        
        deferred.resolve();
        return deferred.promise();
    }
    
    function createDam(config) {
        var deferred = $.Deferred();
        
        re.svg.background.append("polygon")
            .attr("points", "0.678,0 0.678,443.842 139.225,443.842 62.338,0")
            .attr("transform", we.element.transformOuter)
            .style("stroke-width", config.strokeThickness)
            .style("stroke", config.strokeColor)
            .style("fill", config.outerColor);
        
        deferred.resolve();
        return deferred.promise();
    }
    
    function loadDefaultSettings() {
        
    }
}

(function() {
    var re = new ReservoirElement();
    var config = re.loadDefaultSettings();
    
    config.width = 400;
    config.height = 200;
    config.scale = 1;
    re.createSVG("#div-reservoir", config);
    
    re.createDam(config);
})();