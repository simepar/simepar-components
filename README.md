![Alt text](simepar.png)
## Simepar Components

(C) Copyleft SIMEPAR - Sistema Meteorológico do Paraná. See LICENSE for more details

Page: https://simepar.github.io/simepar-components/

# Simepar Components

## What is it about?
Simpear Components is a JavaScript library that contains SVG Icons to represent weather data.

## Getting Started
On your HTML page, add the file flow.js as follows:

Note that in this example, the file is inside the folder js/
```html
<script src="js/flow.js"></script>
```

### How to Use

```javascript
var initialValue = 425;

var config = loadFlowSettings();
/* custom configuration */
config.waveCount = 2;
config.minValue = 0;
config.maxValue = 1000; 

var flow = new FlowElement("#container", initialValue, config);
```

#### Configuration parameters:
```javascript
// Default options
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
valueCountUp: false,      // If true, the displayed value counts up from minimum value to it's final value upon loading. If false, the final value is displayed.
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
```

## Built With

* [jQuery] - JavaScript library designed to simplify the client-side scripting of HTML
* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [D3.js] - JavaScript library for producing dynamic, interactive data visualizations in web browsers

## License
This project is licensed under the BSD 2-clause - see the [LICENSE] file for details

## Acknowledgments
* This project is inpired by Curtis Bratton’s D3 Liquid Fill Gauge. You can find his project [here].

[Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
[D3.js]: <https://d3js.org/>
[jQuery]: <http://jquery.com>
[LICENSE]: <https://github.com/simepar/Simepar-Components/blob/master/LICENSE>
[here]: <http://bl.ocks.org/brattonc/5e5ce9beee483220e2f6>
[Flaticon]: <http://flaticon.es>