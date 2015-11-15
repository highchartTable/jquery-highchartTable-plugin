// Karma configuration
// Generated on Wed Nov 11 2015 19:12:34 GMT+0100 (CET)

module.exports = function(config) {

  var jqueryVersion = process.env.JQUERY_VERSION;
  var highchartsVersion = process.env.HIGHCHARTS_VERSION;

  // Browsers to run on Sauce Labs
  var customLaunchers = {
      'SL_Chrome': {
          base: 'SauceLabs',
          browserName: 'chrome'
      },
      'SL_InternetExplorer': {
          base: 'SauceLabs',
          browserName: 'internet explorer',
          version: '10'
      },
      'SL_FireFox': {
          base: 'SauceLabs',
          browserName: 'firefox',
          version: '37'
      }
  };

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'http://code.jquery.com/jquery-' + jqueryVersion + '.min.js',
      'http://code.highcharts.com/' + highchartsVersion + '/highcharts.js',
      'jquery.highchartTable.js',
      'tests/*Spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'saucelabs'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    sauceLabs: {
      testName: 'HighchartTable tests / jquery ' + jqueryVersion + ' / highcharts ' + highchartsVersion
    },

    captureTimeout: 120000,
    customLaunchers: customLaunchers,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: Object.keys(customLaunchers),


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity
  })
}
