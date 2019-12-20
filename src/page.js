import Convert from './convert';
import { renderSvg } from './renderSwardley';
import { owmBuild } from './version';

var example = 'title Tea Shop' + '\r\n' + 'component Business [1, 0.65]' + '\r\n' + 'component Public [1, 0.79]' + '\r\n' + 'component Cup of Tea [0.8, 0.73]' + '\r\n' + 'component Cup [0.7, 0.88]' + '\r\n' + 'component Tea [0.6, 0.83]' + '\r\n' + 'component Hot Water [0.47, 0.8]' + '\r\n' + 'component Water [0.35, 0.83]' + '\r\n' + 'component Kettle [0.3, 0.3] evolve 0.78' + '\r\n' + 'component Power [0.1, 0.8]' + '\r\n' + 'Business->Cup of Tea' + '\r\n' + 'Public->Cup of Tea' + '\r\n' + 'Cup of Tea->Cup' + '\r\n' + 'Cup of Tea->Tea' + '\r\n' + 'Cup of Tea->Hot Water' + '\r\n' + 'Hot Water->Water' + '\r\n' + 'Hot Water->Kettle ' + '\r\n' + 'Kettle->Power';
function setMetaData() {

    var i = $.map($('.draggable'), function (el) {
        return { name: $(el).attr('id'), x: $(el).attr('x'), y: $(el).attr('y') };
    })
    $('#meta').val(JSON.stringify(i));
    $('#meta-alert').show();
}

$(function () {
    
    var htmEditor;
    ace.require("ace/ext/language_tools");
    ace.config.set('modePath', './scripts');
    htmEditor = ace.edit("htmEditor");
    htmEditor.getSession().setMode("ace/mode/owm");
    htmEditor.setTheme("ace/theme/chrimson");
    htmEditor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        showGutter: false,
        wrap: true
    });
    htmEditor.setShowPrintMargin(false);
    htmEditor.setHighlightActiveLine(false);

    $(htmEditor.textInput.getElement()).on('keyup', function () {
        generateMap();
    });

    var selectedElement, offset;

    function getMousePosition(evt) {
        var CTM = document.getElementById('svgMap').getScreenCTM();
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }

    function startDrag(evt) {

        var target = evt.target;
        if (target.nodeName == "tspan") {
            target = target.parentElement;
        }

        if (target.classList.contains('draggable')) {
            selectedElement = target;
            offset = getMousePosition(evt);
            offset.x -= parseFloat(selectedElement.getAttributeNS(null, "x"));
            offset.y -= parseFloat(selectedElement.getAttributeNS(null, "y"));
        }
    }
    function drag(evt) {
        if (selectedElement) {
            evt.preventDefault();
            var coord = getMousePosition(evt);
            $('tspan', $(selectedElement)).attr('x', coord.x - offset.x);
            $(selectedElement).attr("x", coord.x - offset.x).attr("y", coord.y - offset.y);
            setMetaData()
        }
    }
    function endDrag(evt) {
        setMetaData();
        selectedElement = null;
    }

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

    $(window).resize(function () {
        generateMap();
    });

    var getWidth = function () {
        var textWidth = $('#htmPane').width();
        var width = $(window).width();
        var calcWidth = (width - textWidth - 120);
        return calcWidth;
    };

    var generateMap = function () {
        var txt = htmEditor.session.getValue();
        var r = new Convert().parse(txt);

        $('#title').text(r.title);
        $('#map').html(renderSvg(r, getWidth(), 600));

        $('.draggable').on('mousedown', startDrag)
            .on('mousemove', drag)
            .on('mouseup', endDrag);

        if ($('#meta').val().length > 0) {
            $('#meta-alert').show();
            var items = JSON.parse($('#meta').val());
            items.forEach(element => {
                $('#' + element.name).attr('x', element.x).attr('y', element.y);
                $('tspan', $('#' + element.name)).attr('x', element.x);
            });
        }
        else {
            $('#meta-alert').hide();
            $('#meta').val('');
        }
    };

    $('#build').text(owmBuild);
    generateMap();

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