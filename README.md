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
<script src="js/components.js"></script>
```

### How to Use

```javascript
var initialValue = 78;

var config = loadDefaultSettings();
/* custom configuration */
config.strokeThickness = 8;
config.waveAnimateTime = 5000;
config.waveHeight = 0.05;
config.waveCount = 1;
config.minValue = 0;
config.maxValue = 100;
config.scale = 0.3; 

var drop = new Drop("#container", initialValue, config);
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
