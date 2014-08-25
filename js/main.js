$(document).ready(function() {
  $('.span-one-third table.highchart').highchartTable();
  $("table.zebra-striped").tablesorter({ sortList: [[0, 0]] });

    $('a[data-fiddle]').click(function(){
        ga('send', 'event', 'documentation', 'click', $('td:first', $(this).parents('tr')).text());
        var fiddleId = $(this).data('fiddle');
        $(this).attr('data-controls-modal', 'fiddle-modal-' + fiddleId);
        var content = '<div class="hide modal fade" id="fiddle-modal-' + fiddleId+ '">\
              <div class="modal-header">\
                <a href="#" class="close">x</a>\
                <h3>Example</h3>\
              </div>\
              <div class="modal-body">\
                  <iframe\
                    style="width: 100%; height: 500px"\
                    src="http://jsfiddle.net/' + fiddleId + '/embedded/result,html,js/">\
                  </iframe>\
              </div>\
            </div>';
        $('body').append(content);
        $(content).modal();
        $('fiddle-modal-' + fiddleId).remove();

    });

});
