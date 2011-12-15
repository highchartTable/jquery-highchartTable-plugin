;

(function($) {
  // définition du plugin jQuery
  $.fn.highchartTable = function() {
    
    this.each(function() {
      var table = $(this);

      // Récupération du titre du graphique à partir du caption
      var captions = $('caption', table);
      var graphTitle = captions.length ? $(captions[0]).text() : '';

      var graphContainer;
      if ($(table).data('graph-container-before') != 1)
      {
        // Récupération de la cible d'affichage du graphique
        var graphContainerSelector = $(table).data('graph-container');
        if (!graphContainerSelector) {
          throw "graph-container data attribute is mandatory";
        }

        if (graphContainerSelector[0] === '#' || graphContainerSelector.indexOf('..')===-1) {
          // Absolute selector path
          graphContainer = $(graphContainerSelector);
        } else {
          var referenceNode = table;
          var currentGraphContainerSelector = graphContainerSelector;
          while (currentGraphContainerSelector.indexOf('..')!==-1)
          {
            currentGraphContainerSelector = currentGraphContainerSelector.replace(/^.. /, '');
            referenceNode = referenceNode.parent();
          }

          graphContainer = $(currentGraphContainerSelector, referenceNode);
        }
        if (graphContainer.length !== 1) {
          throw "graph-container is not available in this DOM or available multiple times";
        }
        graphContainer = graphContainer[0];
      }
      else
      {
        $(table).before('<div ></div>');
        graphContainer = $(table).prev();
        graphContainer = graphContainer[0];
      }

      // Récupération du type de graphique
      var globalGraphType = $(table).data('graph-type');
      if (!globalGraphType) {
        throw "graph-type data attribute is mandatory";
      }
      if (globalGraphType!=='column' && globalGraphType!=='line' && globalGraphType!=='area' && globalGraphType!=='spline') {
        throw "graph-container data attribute must be column, line or area";
      }

      var stackingType = $(table).data('graph-stacking');
      if (!stackingType)
      {
        stackingType = 'normal';
      }

      var isGraphInverted = $(table).data('graph-inverted') == 1;

      // Récupération des titres des séries de données à afficher sur le graphique
      var ths = $('thead th', table);
      var columns = [];
      var vlines = [];
      var graphIsStacked = false;
      ths.each(function(indexTh, th) {
        var columnScale = $(th).data('graph-value-scale');

        var serieGraphType = $(th).data('graph-type');
        if(serieGraphType!=='column' && serieGraphType!=='line' && serieGraphType!=='area' && serieGraphType!=='spline')
        {
          serieGraphType = globalGraphType;
        }

        var serieStackGroup = $(th).data('graph-stack-group');
        if(serieStackGroup) {
          graphIsStacked = true;
        }

        if ($(th).data('graph-vline-x') == undefined) {
            columns[indexTh] = {
              libelle:   $(th).text(),
              scale:     columnScale != undefined ? parseFloat(columnScale) : 1,
              graphType: serieGraphType,
              stack:     serieStackGroup,
              color:     $(th).data('graph-color'),
              visible:   !$(th).data('graph-hidden'),
              unit:      $(th).data('graph-unit'),
              yAxis:     $(th).data('graph-yaxis') != undefined ? $(th).data('graph-yaxis') : 0,
              dashStyle: $(th).data('graph-dash-style') || 'solid'
            };
        } else {
            vlines[indexTh] = {
              libelle: $(th).text(),
              x:       $(th).data('graph-vline-x'),
              height:  $(th).data('graph-vline-height'),
              color:   $(th).data('graph-color'),
              visible: !$(th).data('graph-hidden'),
              name:    $(th).data('graph-vline-name'),
              yAxis:   $(th).data('graph-yaxis') != undefined ? $(th).data('graph-yaxis') : 0,
              dashStyle: $(th).data('graph-dash-style') || 'solid'
            };
        }
      });
      
      var series = [];
      $(columns).each(function(indexColumn, column) {
        if(indexColumn!=0) {
          series.push({
            name:    column.libelle + (column.unit ? ' (' + column.unit + ')' : ''),
            data:    [],
            type:    column.graphType,
            stack:   column.stack,
            color:   column.color,
            visible: column.visible,
            yAxis:   column.yAxis,
            dashStyle: column.dashStyle,
            marker: {
                enabled: false
            },
            dataLabels: {
              x:       isGraphInverted ? 15 : 0,
              enabled: $(table).data('graph-datalabels-enabled') == 1,
              align:   $(table).data('graph-datalabels-align') != undefined ? $(table).data('graph-datalabels-align') : 'center'
            }
          });
        }
      });

      $(vlines).each(function(indexColumn, vline) {
        if (vline != undefined) {
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
        if (!!$(row).data('graph-skip'))
        {
          return;
        }
        
        var tds = $('td', row);
        tds.each(function(indexTd, td) {
          var cellValue;
          if (indexTd==0) {
            cellValue = $(td).text();
            xValues.push(cellValue);
          } else {
            var rawCellValue = $(td).text();
            if (rawCellValue.length==0) {
              series[indexTd-1].data.push(null);
            } else {
              var cleanedCellValue = rawCellValue.replace(/ /g, '').replace(/,/, '.');
              cellValue = Math.round(parseFloat(cleanedCellValue) * columns[indexTd].scale * 100) / 100;

                var dataGraphX = $(td).data('graph-x');

                if ($(table).data('graph-xaxis-type') == 'datetime') {
                  dataGraphX    = $('td', $(row)).first().text();
                  var dateInfos = dataGraphX.split('-');
                  dataGraphX    = new Date(parseInt(dateInfos[0], 10), parseInt(dateInfos[1] -1, 10), parseInt(dateInfos[2])+1, 10).getTime();
                }

                series[indexTd-1].data.push({
                  name:   $(td).data('graph-name') != undefined ? $(td).data('graph-name') : rawCellValue,
                  y:      cellValue,
                  x:      dataGraphX, //undefined if no x defined in table
                  events: {
                    click: function () {
                      var callback = $(table).data('graph-point-callback');
                      if (callback == undefined) {
                        return;
                      }

                      var infosCallback = callback.split('.');
                      var callable = window[infosCallback[0]];
                      for(var i = 1, infosCallbackLength = infosCallback.length; i < infosCallbackLength; i++) {
                        callable = callable[infosCallback[i]];
                      }
                      callable(this);
                    }
                  }
                });

            }
          }
        });

      });

      var yAxisConfig = [];
      yAxisConfig.push({
        title: {
          text: $(table).data('graph-yaxis-1-title-text') != undefined  ? $(table).data('graph-yaxis-1-title-text') : "Valeur"
        },
        max: $(table).data('graph-yaxis-1-max') || null,
        min: $(table).data('graph-yaxis-1-min') || null,
        tickInterval: $(table).data('graph-yaxis-1-tick-interval') || null
      });

      if ($(table).data('graph-yaxis-2-title-text') != undefined)
      {
        yAxisConfig.push({
          title: {
            text: $(table).data('graph-yaxis-2-title-text') != undefined  ? $(table).data('graph-yaxis-2-title-text') : "Valeur"
          },
          reversed: $(table).data('graph-yaxis-2-reversed') == '1',
          opposite: $(table).data('graph-yaxis-2-opposite') == '1',
          max: $(table).data('graph-yaxis-2-max') || null,
          min: $(table).data('graph-yaxis-2-min') || null,
          tickInterval: $(table).data('graph-yaxis-2-tick-interval') || null
        });
      }

      var defaultColors = [
        '#4572A7', //bleu
        '#AA4643', //rouge
        '#89A54E', //vert
        '#80699B', //mauve
        '#3D96AE', //bleu clair
        '#DB843D', //orange
        '#92A8CD', //bleu encore plus clair
        '#A47D7C', //marron
        '#B5CA92' //vert clair
      ];
      var colors = [];

      for(var i=0; i<9; i++) {
        var dataname = 'graph-color-' + (i+1);
        colors.push($(table).data(dataname) != undefined ? $(table).data(dataname) : defaultColors[i]);
      }

      // Configuration de HighChart
      var highChartConfig = {
        colors: colors,
        chart: {
          renderTo: graphContainer,
          inverted: isGraphInverted
        },
        title: {
          text: graphTitle
        },
        legend: {
          enabled: $(table).data('graph-legend-disabled') != '1',
          layout: $(table).data('graph-legend-layout') != undefined ? $(table).data('graph-legend-layout') :  'horizontal',
          symbolWidth: $(table).data('graph-legend-width') || 30
        },
        xAxis: {
          categories: ($(table).data('graph-xaxis-type') != 'datetime') ? xValues : undefined,
          type: ($(table).data('graph-xaxis-type') == 'datetime') ? 'datetime' :  undefined,
          showLastLabel: true,
          dateTimeLabelFormats : { //par défaut on affiche numéro jour mois sur les graphs datetime
            second: '%e. %b',
            minute: '%e. %b',
            hour: '%e. %b',
            day: '%e. %b',
            week: '%e. %b',
            month: '%e. %b',
            year: '%e. %b'
          },
          labels:
          {
            rotation: $(table).data('graph-xaxis-rotation') || 0,
            align: $(table).data('graph-xaxis-align') || 'center'
          }
        },
        yAxis: yAxisConfig,
        tooltip: {
            formatter: function() {
              if ($(table).data('graph-xaxis-type') == 'datetime')
              {
                return '<b>'+ this.series.name +'</b><br/>'+  Highcharts.dateFormat('%e. %b', this.x) +' : '+ this.y;
              }
              else
              {
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
            }},

          series: {
            animation: false,
            stickyTracking : false,
            stacking: graphIsStacked ? stackingType : null
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

      // Affichage du graphique
      new Highcharts.Chart(highChartConfig);

      // Permettre le chaînage par jQuery
      return this;
    });
  };
})(jQuery);
