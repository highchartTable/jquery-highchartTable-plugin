
describe("Test yaxis ttributes", function() {

  var fixture;

  it("With numeric", function() {

      if ($.fn.jquery.substr(0, 1) == 2) {
          return;
      }

      graph_absInvertedFormatter = function (value) {
          return Math.abs(value) * -1;
      };

      var htmlContent = '    <table class="highchart" data-graph-container-before="1" data-graph-type="column" style="display:block"' +
          ' data-graph-yaxis-1-reversed="1" data-graph-yaxis-1-stacklabels-enabled="1" ' +
          ' data-graph-yaxis-1-min="1000" data-graph-yaxis-1-max="25000" ' +
          ' data-graph-yaxis-1-title-text="title example" ' +
          ' data-graph-yaxis-1-opposite="1" ' +
          ' data-graph-yaxis-1-tick-interval="1000" ' +
          ' data-graph-yaxis-1-rotation="90" ' +
          ' data-graph-yaxis-1-grid-line-interpolation="circle" ' +
          ' data-graph-yaxis-1-start-on-tick="0" ' +
          ' data-graph-yaxis-1-end-on-tick="0" ' +
          ' data-graph-yaxis-1-formatter-callback="graph_absInvertedFormatter" ' +
          '>' +
          '<caption>Example of title</caption>' +
          '<thead>' +
          '   <tr>' +
          '           <th>Month</th>' +
          '           <th>Sales</th>' +
          '       </tr>' +
          '   </thead>' +
          '   <tbody>' +
          '   <tr>' +
          '       <td>January</td>' +
          '       <td>8000</td>' +
          '   </tr>' +
          '   <tr>' +
          '   <td>February</td>' +
          '   <td>12000</td>' +
          '   </tr>' +
          '       <tr>' +
          '           <td>March</td>' +
          '           <td>18000</td>' +
          '       </tr>' +
          '   </tbody>' +
          ' </table>';

      $('body')
          .empty()
          .append(htmlContent)
      ;

      var beforeRenderCalled = false;

      $('table')
          .bind('highchartTable.beforeRender', function(event, highChartConfig) {
              beforeRenderCalled = true;
              expect(highChartConfig.yAxis[0].reversed).toBe(true);
              expect(highChartConfig.yAxis[0].stackLabels.enabled).toBe(true);
              expect(highChartConfig.yAxis[0].min).toBe(1000);
              expect(highChartConfig.yAxis[0].max).toBe(25000);
              expect(highChartConfig.yAxis[0].title.text).toBe("title example");
              expect(highChartConfig.yAxis[0].opposite).toBe(true);
              expect(highChartConfig.yAxis[0].tickInterval).toBe(1000);
              expect(highChartConfig.yAxis[0].labels.rotation).toBe(90);
              expect(highChartConfig.yAxis[0].gridLineInterpolation).toBe("circle");
              expect(highChartConfig.yAxis[0].startOnTick).toBe(false);
              expect(highChartConfig.yAxis[0].endOnTick).toBe(false);
              expect(highChartConfig.yAxis[0].labels.formatter).toBeDefined();

          })
          .highchartTable()
      ;

      expect(beforeRenderCalled).toBe(true);
  });


  it("Without numeric", function() {

      graph_absInvertedFormatter = function (value) {
          return Math.abs(value) * -1;
      };

      var htmlContent = '    <table class="highchart" data-graph-container-before="1" data-graph-type="column" style="display:block"' +
          ' data-graph-yaxis1-reversed="1" data-graph-yaxis1-stacklabels-enabled="1" ' +
          ' data-graph-yaxis1-min="1000" data-graph-yaxis1-max="25000" ' +
          ' data-graph-yaxis1-title-text="title example" ' +
          ' data-graph-yaxis1-opposite="1" ' +
          ' data-graph-yaxis1-tick-interval="1000" ' +
          ' data-graph-yaxis1-rotation="90" ' +
          ' data-graph-yaxis1-grid-line-interpolation="circle" ' +
          ' data-graph-yaxis1-start-on-tick="0" ' +
          ' data-graph-yaxis1-end-on-tick="0" ' +
          ' data-graph-yaxis1-formatter-callback="graph_absInvertedFormatter" ' +
          '>' +
          '<caption>Example of title</caption>' +
          '<thead>' +
          '   <tr>' +
          '           <th>Month</th>' +
          '           <th>Sales</th>' +
          '       </tr>' +
          '   </thead>' +
          '   <tbody>' +
          '   <tr>' +
          '       <td>January</td>' +
          '       <td>8000</td>' +
          '   </tr>' +
          '   <tr>' +
          '   <td>February</td>' +
          '   <td>12000</td>' +
          '   </tr>' +
          '       <tr>' +
          '           <td>March</td>' +
          '           <td>18000</td>' +
          '       </tr>' +
          '   </tbody>' +
          ' </table>';

      $('body')
          .empty()
          .append(htmlContent)
      ;



      var beforeRenderCalled = false;

      $('table')
          .bind('highchartTable.beforeRender', function(event, highChartConfig) {
              beforeRenderCalled = true;
              expect(highChartConfig.yAxis[0].reversed).toBe(true);
              expect(highChartConfig.yAxis[0].stackLabels.enabled).toBe(true);
              expect(highChartConfig.yAxis[0].min).toBe(1000);
              expect(highChartConfig.yAxis[0].max).toBe(25000);
              expect(highChartConfig.yAxis[0].title.text).toBe("title example");
              expect(highChartConfig.yAxis[0].opposite).toBe(true);
              expect(highChartConfig.yAxis[0].tickInterval).toBe(1000);
              expect(highChartConfig.yAxis[0].labels.rotation).toBe(90);
              expect(highChartConfig.yAxis[0].gridLineInterpolation).toBe("circle");
              expect(highChartConfig.yAxis[0].startOnTick).toBe(false);
              expect(highChartConfig.yAxis[0].endOnTick).toBe(false);
              expect(highChartConfig.yAxis[0].labels.formatter).toBeDefined();
          })
          .highchartTable()
      ;

      expect(beforeRenderCalled).toBe(true);
  });
});


