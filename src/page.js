
function setMetaData() {

    var i = $.map($('.draggable'), function (el) {
        return { name: $(el).attr('id'), x: $(el).attr('x'), y: $(el).attr('y') };
    })
    $('#meta').val(JSON.stringify(i));
    $('#meta-alert').show();
}

$(function () {
    
    

    

    

    var setUrl = function () {
        $('#url').text(window.location.href).attr('href', window.location.href);
    }

    $('#wardley-style').click(function () {
        $('#svgMap').attr('class', 'wardley');
    });

    $('#plain-style').click(function () {
        $('#svgMap').attr('class', '');
    });

    $('#showMeta').click(function () {
        $('#meta-container').toggle();
        $(this).text(function (i, text) {
            return text === "Show" ? "Hide" : "Show";
        })
        return false;
    });

    

    var generateMap = function(){
        console.log('old ref');
    }

    //generateMap();

    if (window.location.hash.length > 0) {
        $('#url').text('loading...');
        var fetch = "https://s7u91cjmdf.execute-api.eu-west-1.amazonaws.com/dev/maps/fetch?id=" + window.location.hash.replace("#", "");
        $.getJSON(fetch, function (d) {
            htmEditor.setValue(d.text);
            if (d.meta != null && d.meta != undefined) {
                $('#meta').val(d.meta);
                $('#meta-alert').show();
                $('#meta-container').hide();
            }
            else {
                $('#meta-alert').hide();
                $('#meta-container').hide();
            }
            setUrl();
            generateMap();
        });
    }

    $('#example-map').click(function () {
        htmEditor.setValue(example);
        generateMap();
        return false;
    })

    $('.add').click(function () {
        var before = htmEditor.getValue();
        before = before + '\n' + $(this).text().trim();
        htmEditor.setValue(before);
        generateMap();
        return false;
    });

    $('#new-map').click(function () {
        $('#url').text('saving...');
        htmEditor.setValue("");
        $('#meta').val('');
        $('#meta-container').hide();

        save('');
        generateMap();
        return false;
    });

    $('#save-map').click(function () {
        $('#url').text('saving...');
        var hash = window.location.hash.replace('#', '');
        save(hash);
        return false;
    });

    var save = function (hash) {
        $.ajax({
            type: "POST",
            url: "https://s7u91cjmdf.execute-api.eu-west-1.amazonaws.com/dev/maps/save",
            data: JSON.stringify({ id: hash, text: htmEditor.getValue(), meta: $('#meta').val() }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                window.location.hash = '#' + data.id;
                setUrl();
            },
            failure: function (errMsg) {
                console.log(errMsg);
            }
        });
    };





});