![Alt text](simepar.png)
## Simepar Components

(C) Copyleft SIMEPAR - Sistema Meteorológico do Paraná. See LICENSE for more details

Page: https://simepar.github.io/simepar-components/

# Simepar Components

## What is it about?
Simpear Components is a JavaScript library that contains SVG Icons to represent weather data. Currently, the elements are: 
- Drop: used to represent **preciptation** and **relative humidity**;
- Ruler: used to represent **river level**;
- Thermometer: used to represent **temperature**;
- Leaf: used to represent **leaf wetness**.

## Getting Started
On your HTML page, add the file components.js as follows:

Note that in this example, the file is inside the folder js/
```html
<script src="js/flow.js"></script>
```

### How to Use

```javascript
var initialValue = 78;

var config = loadFlowSettings();
/* custom configuration */
config.strokeThickness = 8;
config.waveAnimateTime = 5000;
config.waveHeight = 0.05;
config.waveCount = 1;
config.minValue = 0;
config.maxValue = 100;
config.scale = 0.3; 

var flow = new FlowElement("#container", initialValue, config);
```

#### Configuration parameters:
```javascript
// Default Settings
// return of loadDefaultSettings
minValue: 0, // The gauge minimum value.
maxValue: 100, // The gauge maximum value.
thickness: 0.05, // The outer circle thickness as a percentage of it's radius. 
strokeThickness: 1, // The stroke thickness.
strokeColor: "#178BCA",
outerColor: "none",
fillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
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
liquidColor: "#178BCA", // the color of the liquid
minTextColor: "#045681", // the color of the text for the minimum value
maxTextColor: "#045681", // the color of the text for the maximum value
liquidOpacity: 0.7 // the liquid opacity
```

## Built With

* [jQuery] - JavaScript library designed to simplify the client-side scripting of HTML
* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [D3.js] - JavaScript library for producing dynamic, interactive data visualizations in web browsers

## License
This project is licensed under the BSD 2-clause - see the [LICENSE] file for details

## Acknowledgments
* This project is inpired by Curtis Bratton’s D3 Liquid Fill Gauge. You can find his project [here].
* The SVG Icons ([Drop], [Thermometer], [Ruler], and [Leaf]) used on this project are from [Flaticon]. 

[Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
[D3.js]: <https://d3js.org/>
[jQuery]: <http://jquery.com>
[LICENSE]: <https://github.com/simepar/Simepar-Components/blob/master/LICENSE>
[here]: <http://bl.ocks.org/brattonc/5e5ce9beee483220e2f6>
[Flaticon]: <http://flaticon.es>
[Drop]: <http://www.flaticon.es/icono-gratis/gota-solitaria_74702#term=drop&page=3&position=94>
[Thermometer]: <http://www.flaticon.es/icono-gratis/temperature_136750#term=thermometer&page=1&position=14>
[Ruler]: <http://www.flaticon.es/icono-gratis/measuring-tape_123448#term=ruler&page=1&position=75>
[Leaf]: <http://www.flaticon.es/icono-gratis/hoja-de-jardin_16335#term=leaf&page=4&position=36>