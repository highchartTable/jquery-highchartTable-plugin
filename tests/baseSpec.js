
describe("Base test", function() {

  var fixture;


  beforeEach(function() {
      var htmlContent = '    <table class="highchart" data-graph-container-before="1" data-graph-type="column" style="display:none">' +
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
  });


  it("Simple table", function() {

      var beforeRenderCalled = false;

      $('table')
          .bind('highchartTable.beforeRender', function(event, highChartConfig) {
              beforeRenderCalled = true;
              expect(highChartConfig.title.text).toBe("Example of title");
              expect(highChartConfig.series[0].type).toBe("column");
              expect(highChartConfig.series[0].data[0].name).toBe('8000');
              expect(highChartConfig.series[0].data[0].y).toBe(8000);
              expect(highChartConfig.series[0].data[1].name).toBe('12000');
              expect(highChartConfig.series[0].data[1].y).toBe(12000);
              expect(highChartConfig.series[0].data[2].name).toBe('18000');
              expect(highChartConfig.series[0].data[2].y).toBe(18000)
              expect(highChartConfig.yAxis[0].reversed).toBe(false);

              expect(highChartConfig.yAxis[0].reversed).toBe(false);
              expect(highChartConfig.yAxis[0].stackLabels.enabled).toBe(false);
              expect(highChartConfig.yAxis[0].min).toBeNull();
              expect(highChartConfig.yAxis[0].max).toBeNull();
              expect(highChartConfig.yAxis[0].title.text).toBeNull();
              expect(highChartConfig.yAxis[0].opposite).toBe(false);
              expect(highChartConfig.yAxis[0].tickInterval).toBe(null);
              expect(highChartConfig.yAxis[0].labels.rotation).toBe(0);
              expect(highChartConfig.yAxis[0].gridLineInterpolation).toBeNull();
              expect(highChartConfig.yAxis[0].startOnTick).toBe(true);
              expect(highChartConfig.yAxis[0].endOnTick).toBe(true);
              expect(highChartConfig.yAxis[0].labels.formatter).toBeUndefined();
          })
          .highchartTable()
      ;

      expect(beforeRenderCalled).toBe(true);
  });
});


