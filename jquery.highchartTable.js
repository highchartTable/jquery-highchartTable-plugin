;

(function($) {
  $.fn.highchartTable = function() {
    
    var allowedGraphTypes = ['column', 'line', 'area', 'spline', 'pie'];

    var getCallable = function (table, attribute) {
      var callback = $(table).data(attribute);
      if (typeof callback != 'undefined') {
        var infosCallback = callback.split('.');
        var callable      = window[infosCallback[0]];
        for(var i = 1, infosCallbackLength = infosCallback.length; i < infosCallbackLength; i++) {
          callable = callable[infosCallback[i]];
        }
        return callable;
      }
    };

    this.each(function() {
      var table = $(this);
      var $table = $(table);
      var nbYaxis = 1;

      // Retrieve graph title from the table caption
      var captions   = $('caption', table);
      var graphTitle = captions.length ? $(captions[0]).text() : '';

      var graphContainer;
      if ($table.data('graph-container-before') != 1) {
        // Retrieve where the graph must be displayed from the graph-container attribute
        var graphContainerSelector = $table.data('graph-container');
        if (!graphContainerSelector) {
          throw "graph-container data attribute is mandatory";
        }

        if (graphContainerSelector[0] === '#' || graphContainerSelector.indexOf('..')===-1) {
          // Absolute selector path
          graphContainer = $(graphContainerSelector);
        } else {
          var referenceNode                 = table;
          var currentGraphContainerSelector = graphContainerSelector;

          while (currentGraphContainerSelector.indexOf('..')!==-1) {
            currentGraphContainerSelector = currentGraphContainerSelector.replace(/^.. /, '');
            referenceNode = referenceNode.parent();
          }

          graphContainer = $(currentGraphContainerSelector, referenceNode);
        }
        if (graphContainer.length !== 1) {
          throw "graph-container is not available in this DOM or available multiple times";
        }
        graphContainer = graphContainer[0];
      } else {
        $table.before('<div ></div>');
        graphContainer = $table.prev();
        graphContainer = graphContainer[0];
      }

      // Retrieve graph type from graph-type attribute
      var globalGraphType = $table.data('graph-type');
      if (!globalGraphType) {
        throw "graph-type data attribute is mandatory";
      }
      if ($.inArray(globalGraphType, allowedGraphTypes) == -1) {
        throw "graph-container data attribute must be one of " + allowedGraphTypes.join(', ');
      }

      var stackingType = $table.data('graph-stacking');
      if (!stackingType) {
        stackingType = 'normal';
      }

      var isGraphInverted = $table.data('graph-inverted') == 1;

      // Retrieve series titles
      var ths            = $('thead th', table);
      var columns        = [];
      var vlines         = [];
      var skippedColumns = 0;
      var graphIsStacked = false;
      ths.each(function(indexTh, th) {
        var columnScale = $(th).data('graph-value-scale');

        var serieGraphType = $(th).data('graph-type');
        if($.inArray(serieGraphType, allowedGraphTypes) == -1) {
          serieGraphType = globalGraphType;
        }

        var serieStackGroup = $(th).data('graph-stack-group');
        if(serieStackGroup) {
          graphIsStacked = true;
        }

        if (typeof $(th).data('graph-yaxis') != 'undefined' && $(th).data('graph-yaxis')  == '1') {
          nbYaxis = 2;
        }

        var isColumnSkipped = $(th).data('graph-skip') == 1;
        if (isColumnSkipped)
        {
          skippedColumns = skippedColumns + 1;
        }

        var object = {
          libelle:   $(th).text(),
          skip:      isColumnSkipped,
          indexTd:   indexTh - skippedColumns - 1,
          color:     $(th).data('graph-color'),
          visible:   !$(th).data('graph-hidden'),
          yAxis:     typeof $(th).data('graph-yaxis') != 'undefined' ? $(th).data('graph-yaxis') : 0,
          dashStyle: $(th).data('graph-dash-style') || 'solid'
        };

        if (typeof $(th).data('graph-vline-x') == 'undefined') {
          object.scale     = typeof columnScale != 'undefined' ? parseFloat(columnScale) : 1;
          object.graphType = serieGraphType;
          object.stack     = serieStackGroup;
          object.unit      = $(th).data('graph-unit');
          columns[indexTh] = object;
        } else {
          object.x      = $(th).data('graph-vline-x');
          object.height = $(th).data('graph-vline-height');
          object.name   = $(th).data('graph-vline-name');
          vlines[indexTh] = object;
        }
      });
      
      var series = [];
      $(columns).each(function(indexColumn, column) {
        if(indexColumn!=0 && !column.skip) {
          series.push({
            name:      column.libelle + (column.unit ? ' (' + column.unit + ')' : ''),
            data:      [],
            type:      column.graphType,
            stack:     column.stack,
            color:     column.color,
            visible:   column.visible,
            yAxis:     column.yAxis,
            dashStyle: column.dashStyle,
            marker: {
                enabled: false
            },
            dataLabels: {
              x:       isGraphInverted ? 15 : 0,
              enabled: $table.data('graph-datalabels-enabled') == 1,
              align:   typeof $table.data('graph-datalabels-align') != 'undefined' ? $table.data('graph-datalabels-align') : 'center'
            }
          });
        }
      });

      $(vlines).each(function(indexColumn, vline) {
        if (typeof vline != 'undefined' && !vline.skip) {
          series.push({
            name:    vline.libelle,
            data:    [{x: vline.x, y:0, name: vline.name}, {x:vline.x, y:vline.height, name: vline.name}],
            type:    'spline',
            color:   vline.color,
            visible: vline.visible,
            marker: {
              enabled: false
            }
          });
        }
      });

      var xValues = [];
      var rows = $('tbody:first tr', table);
      rows.each(function(indexRow, row) {
        if (!!$(row).data('graph-skip')) {
          return;
        }
        
        var tds = $('td', row);
        tds.each(function(indexTd, td) {
          var cellValue;
          var column = columns[indexTd];

          if (column.skip) {
            return;
          }
          if (indexTd==0) {
            cellValue = $(td).text();
            xValues.push(cellValue);
          } else {
            var rawCellValue = $(td).text();
            var serie  = series[column.indexTd];

            if (rawCellValue.length==0) {
              serie.data.push(null);
            } else {
              var cleanedCellValue = rawCellValue.replace(/ /g, '').replace(/,/, '.');
              cellValue = Math.round(parseFloat(cleanedCellValue) * column.scale * 100) / 100;

                var dataGraphX = $(td).data('graph-x');

                if ($table.data('graph-xaxis-type') == 'datetime') {
                  dataGraphX    = $('td', $(row)).first().text();
                  var dateInfos = dataGraphX.split('-');
                  var date      = parseDate(dateInfos);
                  dataGraphX    = date.getTime() - date.getTimezoneOffset()*60*1000;
                }
                
                var serieDataItem = {
                  name:   typeof $(td).data('graph-name') != 'undefined' ? $(td).data('graph-name') : rawCellValue,
                  y:      cellValue,
                  x:      dataGraphX //undefined if no x defined in table
                };
                
                var callablePoint = getCallable(table, 'graph-point-callback');
                if (callablePoint) {
                  serieDataItem.events = {
                    click: function () {
                        return callablePoint(this);
                      }
                  };
                }
              
                if (column.graphType === 'pie') {
                  if ($(td).data('graph-item-highlight')) {
                    serieDataItem.sliced = 1;
                  }
                }
                
                if (typeof $(td).data('graph-item-color') != 'undefined') {
                  serieDataItem.color = $(td).data('graph-item-color');
                }

              serie.data.push(serieDataItem);
            }
          }
        });

      });

      var yAxisConfig = [];
      var yAxisNum;
      for (yAxisNum=1 ; yAxisNum <= nbYaxis ; yAxisNum++) {
        var yAxisConfigCurrentAxis = {
          title: {
            text: typeof $table.data('graph-yaxis-'+yAxisNum+'-title-text') != 'undefined'  ? $table.data('graph-yaxis-'+yAxisNum+'-title-text') : "Valeur"
          },
          max:          typeof $table.data('graph-yaxis-'+yAxisNum+'-max') != 'undefined' ? $table.data('graph-yaxis-'+yAxisNum+'-max') : null,
          min:          typeof $table.data('graph-yaxis-'+yAxisNum+'-min') != 'undefined' ? $table.data('graph-yaxis-'+yAxisNum+'-min') : null,
          reversed:     $table.data('graph-yaxis-'+yAxisNum+'-reversed') == '1',
          opposite:     $table.data('graph-yaxis-'+yAxisNum+'-opposite') == '1',
          tickInterval: $table.data('graph-yaxis-'+yAxisNum+'-tick-interval') || null,
          labels: {
            rotation: $table.data('graph-yaxis-'+yAxisNum+'-rotation') || 0
          },
          startOnTick: $table.data('graph-yaxis-'+yAxisNum+'-start-on-tick') !== "0",
          endOnTick:   $table.data('graph-yaxis-'+yAxisNum+'-end-on-tick') !== "0"
        };

        var callableYAxisFormatter = getCallable(table, 'graph-yaxis-'+yAxisNum+'-formatter-callback');
        if (callableYAxisFormatter) {
          yAxisConfigCurrentAxis.labels.formatter = function () {
              return callableYAxisFormatter(this.value);
          };
        }

        yAxisConfig.push(yAxisConfigCurrentAxis);
      }

      var defaultColors = [
        '#4572A7',
        '#AA4643',
        '#89A54E',
        '#80699B',
        '#3D96AE',
        '#DB843D',
        '#92A8CD',
        '#A47D7C',
        '#B5CA92'
      ];
      var colors = [];

      var themeColors = typeof Highcharts.theme != 'undefined' && typeof Highcharts.theme.colors != 'undefined' ? Highcharts.theme.colors : [];

      for(var i=0; i<9; i++) {
        var dataname = 'graph-color-' + (i+1);
        colors.push(typeof $table.data(dataname) != 'undefined' ? $table.data(dataname) : typeof themeColors[i] != 'undefined' ? themeColors[i] : defaultColors[i]);
      }

      var highChartConfig = {
        colors: colors,
        chart: {
          renderTo:     graphContainer,
          inverted:     isGraphInverted, 
          marginTop:    $table.data('graph-margin-top'),
          marginRight:  $table.data('graph-margin-right') || 50,
          marginBottom: $table.data('graph-margin-bottom') || 70,
          marginLeft:   $table.data('graph-margin-left') || 80,
          spacingTop:   $table.data('graph-spacing-top') || 10,
          height:       $table.data('graph-height') || null
        },
        title: {
          text: graphTitle
        },
        subtitle: {
          text: $table.data('graph-subtitle-text') || ''
        },
        legend: {
          enabled:     $table.data('graph-legend-disabled') != '1',
          layout:      typeof $table.data('graph-legend-layout') != 'undefined' ? $table.data('graph-legend-layout') :  'horizontal',
          symbolWidth: $table.data('graph-legend-width') || 30,
          x:           $table.data('graph-legend-x') || 15,
          y:           $table.data('graph-legend-y') || 0
        },
        xAxis: {
          categories:             ($table.data('graph-xaxis-type') != 'datetime') ? xValues : undefined,
          type:                   ($table.data('graph-xaxis-type') == 'datetime') ? 'datetime' :  undefined,
          reversed:               $table.data('graph-xaxis-reversed') == '1',
          opposite:               $table.data('graph-xaxis-opposite') == '1',
          showLastLabel:          true,
          tickInterval:           $table.data('graph-xaxis-tick-interval') || null,
          dateTimeLabelFormats:   { //by default, we display the day and month on the datetime graphs
            second: '%e. %b',
            minute: '%e. %b',
            hour:   '%e. %b',
            day:    '%e. %b',
            week:   '%e. %b',
            month:  '%e. %b',
            year:   '%e. %b'
          },
          labels:
          {
            rotation: $table.data('graph-xaxis-rotation') || 0,
            align:    $table.data('graph-xaxis-align') || 'center'
          },
          startOnTick: $table.data('graph-xaxis-start-on-tick'),
          endOnTick:   $table.data('graph-xaxis-end-on-tick'),
          min: getXAxisMinMax(table, 'min'),
          max: getXAxisMinMax(table, 'max'),
          alternateGridColor: $table.data('graph-xaxis-alternateGridColor') || null,
          title: {
            text: $table.data('graph-xaxis-title-text') || null
          },
          gridLineWidth:     typeof $table.data('graph-xaxis-gridLine-width') != 'undefined' ? $table.data('graph-xaxis-gridLine-width') : 0,
          gridLineDashStyle: $table.data('graph-xaxis-gridLine-style') || 'ShortDot'
        },
        yAxis: yAxisConfig,
        tooltip: {
            formatter: function() {
              if ($table.data('graph-xaxis-type') == 'datetime') {
                return '<b>'+ this.series.name +'</b><br/>'+  Highcharts.dateFormat('%e. %b', this.x) +' : '+ this.y;
              } else {
                return '<strong>' + this.series.name + '</strong> : ' + this.point.name;
              }
            }
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          line: {
            dataLabels: {
              enabled: true
            },
            lineWidth: $table.data('graph-line-width') || 2
          },
          area: {
            lineWidth:   $table.data('graph-line-width') || 2,
            shadow:      typeof $table.data('graph-line-shadow') != 'undefined' ? $table.data('graph-line-shadow') : true,
            fillOpacity: typeof $table.data('graph-area-fillOpacity') != 'undefined' ? $table.data('graph-area-fillOpacity') : 0.75
          },
          pie: {
            allowPointSelect: true,
            dataLabels: {
              enabled: true
            },
            showInLegend: 0,
            size:         '80%'
          },
          series: {
            animation:       false,
            stickyTracking : false,
            stacking:        graphIsStacked ? stackingType : null,
            groupPadding:    typeof $table.data('graph-group-padding') != 'undefined' ? $table.data('graph-group-padding') : 0
          }
        },
        series: series,
        exporting: {
            filename: graphTitle.replace(/ /g, '_'),
            buttons: {
              exportButton: {
                menuItems: null,
                onclick: function() {
                  this.exportChart();
                }
              }
            }
          }
      };

      new Highcharts.Chart(highChartConfig);

      //for fluent api
      return this;
    });
  };
  
  var getXAxisMinMax = function(table, minOrMax) {
    var value = $(table).data('graph-xaxis-'+minOrMax);
    if (typeof value != 'undefined') {
      if ($(table).data('graph-xaxis-type') == 'datetime') {
        var dateInfos = value.split('-');
        var date      = parseDate(dateInfos);
        return date.getTime() - date.getTimezoneOffset()*60*1000;
      }
      return value;
    }
    return null;
  };

  var parseDate = function(dateInfos) {
    return new Date(parseInt(dateInfos[0], 10), parseInt(dateInfos[1], 10)-1, parseInt(dateInfos[2], 10));
  };
  
})(jQuery);
