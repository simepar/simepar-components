![Alt text](simepar.png)
## Simepar Components

(C) Copyleft SIMEPAR - Sistema Meteorológico do Paraná. See LICENSE for more details

Page: https://simepar.github.io/simepar-components/

# Simepar Components

## What is it about?
Simpear Components is a JavaScript library that contains SVG Icons to represent weather data.

## Getting Started
On your HTML page, add the file cylinder.js as follows:

Note that in this example, the file is inside the folder js/
```html
<script src="js/cylinder.js"></script>
```

### How to Use

```javascript
var initialValue = 425;

var config = loadCylinderSettings();
/* custom configuration */
config.waveCount = 2;
config.minValue = 0;
config.maxValue = 1000; 

var cylinder = new CylinderElement("#container", initialValue, config);
```

#### Configuration parameters:
```javascript
// Default options

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