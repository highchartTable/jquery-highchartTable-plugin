
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

      $('#fixture').remove();
      $('body').append(htmlContent);
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
              expect(highChartConfig.series[0].data[2].y).toBe(18000);
          })
          .highchartTable()
      ;

      expect(beforeRenderCalled).toBe(true);
  });
});


