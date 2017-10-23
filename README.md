technical-indicators
====================

# ⛔️ DEPRECATED
This plugin is no longer maintained. Since v6.0, technical indicators are an [integrated part of Highstock](https://www.highcharts.com/docs/chart-and-series-types/technical-indicator-series). 

______________________________
This a Highcharts-plugin that allows the user to add technical indicators to their charts.

The contents of the plugin is located in the javascript file "technical-indicators.src.js". 
This plugin is published under the MIT license, and the license document is including in the repository.

### Installation
* Add the script tag pointing to "https://rawgit.com/laff/technical-indicators/master/technical-indicators.src.js".
* `id:`
Give your original dataset an id.
* `type:`
This is the series type needed to load the functionality. Either `trendline` or `histogram`.
* `linkedTo:`
Link each of the technical indicators (series) you wish to add, to the original dataset.
* `algorithm:`
Choose algorithm / name of the technical indicator you wish to use. `linear` is default.


### Algorithms
* `linear`: 
Demo here: http://jsfiddle.net/laff/etW3K/
* `SMA`:
Default `periods` is 100. Demo here: http://jsfiddle.net/laff/WaEBc/
* `EMA`:
Default `periods` is 100. Demo here: http://jsfiddle.net/laff/U6HMA/
* `MACD`:
The `periods` are set at 12, 26 and 9. `algorithm: 'signalLine'` and `algorithm: 'MACD'` are `type: 'trendline'`. The Histogram has its algorithm loaded by default when choosing `type: 'histogram'`. Demo here: http://jsfiddle.net/laff/SRfW6/
