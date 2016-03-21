(function (H) {

	// create shortcuts
	var defaultOptions = H.getOptions(),
		defaultPlotOptions = defaultOptions.plotOptions,
		seriesTypes = H.seriesTypes;

	// Trendline functionality and default options.
	defaultPlotOptions.trendline = H.merge(defaultPlotOptions.line, {

		marker: {
			enabled: false
		},

		tooltip: {
			valueDecimals: 2
		}
	});

	seriesTypes.trendline = H.extendClass(seriesTypes.line, {
		
		type: 'trendline',
		animate: null,
		requiresSorting: false,
		processData: function() {
			var data;

			if (this.linkedParent) {
				data = [].concat(this.linkedParent.options.data)
				this.setData(this.runAlgorithm(), false);
			}

			H.Series.prototype.processData.call(this);
		},
		runAlgorithm: function () {

			var xData = this.linkedParent.xData,
				yData = this.linkedParent.yData,
				periods = this.options.periods || 100,		// Set this to what default? should be defaults for each algorithm.
				algorithm = this.options.algorithm || 'linear';

			return this[algorithm](xData, yData, periods);
		},


		/* Function that uses the calcMACD function to return the MACD line.
		 * 
		 * @return : the first index of the calcMACD return, the MACD.
		**/
		MACD: function (xData, yData, periods) {

			return calcMACD(xData, yData, periods)[0];
		},

		/* Function that uses the global calcMACD.
		 * 
		 * @return : the second index of the calcMACD return, the signalLine.
		**/
		signalLine: function (xData, yData, periods) {

			return calcMACD(xData, yData, periods)[1];
		},

		/* Function using the global SMA function.
		 * 
		 * @return : an array of SMA data.
		**/
		SMA: function (xData, yData, periods) {

			return SMA(xData, yData, periods);
		},


		/* Function using the global EMA function.
		 * 
		 * @return : an array of EMA data.
		**/
		EMA: function (xData, yData, periods) {

			return EMA(xData, yData, periods);
		}, 

        /* Function using the global RSI function.
         *
         * @return: an array of RSI data.
        **/
        RSI: function (xData, yData, periods) {
            return RSI(xData, yData, periods);
        },
		/* Function that uses the global linear function.
		 *
		 * @return : an array of EMA data
		**/
		linear: function (xData, yData, periods) {

			return linear(xData, yData, periods);
		}

	});

	// Setting default options for the Histogram type.
	defaultPlotOptions.histogram = H.merge(defaultPlotOptions.column, {

		borderWidth : 0,

		tooltip: {
			valueDecimals: 2
		}

	});


	seriesTypes.histogram = H.extendClass(seriesTypes.column, {
		
		type: 'histogram',
		animate: null,
		requiresSorting: false,
		processData: function() {
			var data;

			if (this.linkedParent) {
				data = [].concat(this.linkedParent.options.data)
				this.setData(this.runAlgorithm(), false);
			}

			H.Series.prototype.processData.call(this);
		},

		runAlgorithm: function () {

			var xData = this.linkedParent.xData,
				yData = this.linkedParent.yData,
				periods = this.options.periods || 100,		// Set this to what default? should be defaults for each algorithm.
				algorithm = this.options.algorithm || 'histogram';

			return this[algorithm](xData, yData, periods);
		},


		histogram: function (xData, yData, periods) {

			return calcMACD(xData, yData, periods)[2];
		},

	});


	// Global functions.

	/* Function that calculates the MACD (Moving Average Convergance-Divergence).
	 *
	 * @param yData : array of y variables.
	 * @param xData : array of x variables.
	 * @param periods : An optional array of the MACD periods in the order
     * [shortPeriod, longPeriod, signalPeriod ]
	 * @return : An array with 3 arrays. (0 : macd, 1 : signalline , 2 : histogram) 
	**/
	function calcMACD (xData, yData, periods) {

		var chart = this,
			shortPeriod = 12,
			longPeriod = 26,
			signalPeriod = 9,
			shortEMA,
			longEMA,
			MACD = [], 
			xMACD = [],
			yMACD = [],
			signalLine = [],
			histogram = [];
        if (Array.isArray(periods)) {
            if (periods.length >= 1) {
                shortPeriod = periods[0] || 12;
            }
            if (periods.length >= 2) {
                longPeriod = periods[1] || 26;
            }
            if (periods.length >=3 ) {
                signalPeriod = periods[2] || 9;
            }
        }
		// Calculating the short and long EMA used when calculating the MACD
		shortEMA = EMA(xData, yData, shortPeriod);
		longEMA = EMA(xData, yData, longPeriod);

		// subtract each Y value from the EMA's and create the new dataset (MACD)
		for (var i = 0; i < shortEMA.length; i++) {

			if (longEMA[i][1] == null) {

				MACD.push( [xData[i] , null]);

			} else {
				MACD.push( [ xData[i] , (shortEMA[i][1] - longEMA[i][1]) ] );
			}
		}

		// Set the Y and X data of the MACD. This is used in calculating the signal line.
		for (var i = 0; i < MACD.length; i++) {
			xMACD.push(MACD[i][0]);
			yMACD.push(MACD[i][1]);
		}

		// Setting the signalline (Signal Line: X-day EMA of MACD line).
		signalLine = EMA(xMACD, yMACD, signalPeriod);

		// Setting the MACD Histogram. In comparison to the loop with pure MACD this loop uses MACD x value not xData.
		for (var i = 0; i < MACD.length; i++) {

			if (MACD[i][1] == null) {

				histogram.push( [ MACD[i][0], null ] );
			
			} else {

				histogram.push( [ MACD[i][0], (MACD[i][1] - signalLine[i][1]) ] );

			}
		}

		return [MACD, signalLine, histogram];
	}

	/**
	 * Calculating a linear trendline.
	 * The idea of a trendline is to reveal a linear relationship between 
	 * two variables, x and y, in the "y = mx + b" form.
	 * @param yData : array of y variables.
	 * @param xData : array of x variables.
	 * @param periods : Only here for overloading purposes.
	 * @return an array containing the linear trendline. 
	**/
	function linear (xData, yData, periods) {

		var		lineData = [],
				step1,
				step2 = 0,
				step3 = 0,
				step3a = 0,
				step3b = 0,
				step4 = 0,
				step5 = 0,
				step5a = 0,
				step6 = 0,
				step7 = 0,
				step8 = 0,
				step9 = 0;


		// Step 1: The number of data points.
		step1 = xData.length;

		// Step 2: "step1" times the summation of all x-values multiplied by their corresponding y-values.
		// Step 3: Sum of all x-values times the sum of all y-values. 3a and b are used for storing data.
		// Step 4: "step1" times the sum of all squared x-values.
		// Step 5: The squared sum of all x-values. 5a stores data.
		// Step 6: Equation to calculate the slope of the regression line.
		// Step 7: The sum of all y-values.
		// Step 8: "step6" times the sum of all x-values (step5).
		// Step 9: The equation for the y-intercept of the trendline.
		for ( var i = 0; i < step1; i++) {
			step2 = (step2 + (xData[i] * yData[i]));
			step3a = (step3a + xData[i]);
			step3b = (step3b + yData[i]);
			step4 = (step4 + Math.pow(xData[i], 2));
			step5a = (step5a + xData[i]);
			step7 = (step7 + yData[i]);
		}
		step2 = (step1 * step2);
		step3 = (step3a * step3b);
		step4 = (step1 * step4);
		step5 = (Math.pow(step5a, 2));
		step6 = ((step2 - step3) / (step4 - step5));
		step8 = (step6 * step5a);
		step9 = ((step7 - step8) / step1);

		// Step 10: Plotting the trendline. Only two points are calulated.
		// The starting point.
		// This point will have values equal to the first X and Y value in the original dataset.
		lineData.push([xData[0] , yData[0]]);

		// Calculating the ending point.
		// The point X is equal the X in the original dataset.
		// The point Y is calculated using the function of a straight line and our variables found.
		step10 = ( ( step6 * xData[step1 - 1] ) + step9 );
		lineData.push([ ( xData[step1 - 1] ), step10 ]);

		return lineData;
	}


	/* Function based on the idea of an exponential moving average.
	 * 
	 * Formula: EMA = Price(t) * k + EMA(y) * (1 - k)
	 * t = today, y = yesterday, N = number of days in EMA, k = 2/(2N+1)
	 *
	 * @param yData : array of y variables.
	 * @param xData : array of x variables.
	 * @param periods : The amount of "days" to average from.
	 * @return an array containing the EMA.	
	**/
	function EMA (xData, yData, periods) {

		var t,
			y = false,
			n = periods,
			k = (2 / (n + 1)),
			ema,	// exponential moving average.
			emLine = [],
			periodArr = [],
			length = yData.length,
			pointStart = xData[0];

		// loop through data
		for (var i = 0; i < length; i++) {


			// Add the last point to the period arr, but only if its set.
			if (yData[i-1]) {
				periodArr.push(yData[i]);
			}
			

			// 0: runs if the periodArr has enough points.
			// 1: set currentvalue (today).
			// 2: set last value. either by past avg or yesterdays ema.
			// 3: calculate todays ema.
			if (n == periodArr.length) {


				t = yData[i];

				if (!y) {
					y = arrayAvg(periodArr);
				} else {
					ema = (t * k) + (y * (1 - k));
					y = ema;
				}

				emLine.push([xData[i] , y]);

				// remove first value in array.
				periodArr.splice(0,1);

			} else {

				emLine.push([xData[i] , null]);
			}

		}

		return emLine;
	}

	/* Function based on the idea of a simple moving average.
	 * @param yData : array of y variables.
	 * @param xData : array of x variables.
	 * @param periods : The amount of "days" to average from.
	 * @return an array containing the SMA.	
	**/
	function SMA (xData, yData, periods) {
		var periodArr = [],
			smLine = [],
			length = yData.length,
			pointStart = xData[0];

		// Loop through the entire array.
		for (var i = 0; i < length; i++) {

			// add points to the array.
			periodArr.push(yData[i]);

			// 1: Check if array is "filled" else create null point in line.
			// 2: Calculate average.
			// 3: Remove first value.
			if (periods == periodArr.length) {

				smLine.push([ xData[i] , arrayAvg(periodArr)]);
				periodArr.splice(0,1);

			}  else {
				smLine.push([ xData[i] , null]);
			}
		}
		return smLine;
	}

	/* Function based on the idea of Relative Strength Index.
	 * @param yData : array of y variables.
	 * @param xData : array of x variables.
	 * @param periods : The amount of "days" to calculate for.
	 * @return an array containing the RSI.
	**/
    function RSI (xData, yData, periods) {
        var periodArr = [],
            rsiLine = [],
            length = yData.length,
            pointStart = xData[0];
        var rsiPeriod = periods || 14;
        var gain = [], loss = [];
        var prevGain = -1;
        var prevLoss = -1;
        var avgGain = -1;
        var avgLoss = -1;
		// Loop through the entire array.
        for (var i = 0; i < length; ++i) {
			// add points to the array.
            periodArr.push(yData[i]);
			// 1: Check if array is "filled" else create null point in line.
			// 2: Calculate RSI value.
			// 3: Remove first value.
            if (i > 0) {
                var curGain = 0, curLoss = 0;
                var delta = yData[i] - yData[i - 1];
                delta = parseFloat(delta.toFixed(6));
                curGain = delta > 0 ? delta : 0;
                curLoss = delta < 0 ? Math.abs(delta) : 0;
                if (prevGain < 0 || prevLoss < 0) {
                    if (gain.length < rsiPeriod) {
                        gain.push(curGain);
                    }
                    if (loss.length < rsiPeriod) {
                        loss.push(curLoss);
                    }
                    if (gain.length == rsiPeriod) {
                        avgGain = 0;
                        for (var j = 0; j < gain.length; ++j) {
                            avgGain += gain[j];
                        }
                        avgGain /= rsiPeriod;
                    }
                    if (loss.length == rsiPeriod) {
                        avgLoss = 0;
                        for (var j = 0; j < loss.length; ++j) {
                            avgLoss += loss[j];
                        }
                        avgLoss /= rsiPeriod;
                    }
                } else {
                    avgGain = (prevGain * (rsiPeriod - 1) + curGain) / rsiPeriod;
                    avgLoss = (prevLoss * (rsiPeriod - 1) + curLoss) / rsiPeriod;
                }
            }
            if (rsiPeriod == periodArr.length) {
                var rsiValue = 0;
                if (avgGain == 0) {
                    rsiValue = 0;
                } else if (avgLoss == 0) {
                    rsiValue = 100;
                } else {
                    rsiValue = 100 - (100 / (1 + (avgGain / avgLoss)));
                }
                rsiLine.push([ xData[i], rsiValue]);
                periodArr.splice(0, 1);
                prevGain = avgGain;
                prevLoss = avgLoss;
            } else {
                rsiLine.push([xData[i], null]);
            }
        }
        console.log(JSON.stringify(rsiLine));
        return rsiLine;
    }

	/* Function that returns average of an array's values.
	 *
	**/
	function arrayAvg (arr) {
		var sum = 0,
			arrLength = arr.length,
			i = arrLength;

		while (i--) {
			sum = sum + arr[i];
		}

		return (sum / arrLength);
	}

}(Highcharts));
