import React, { useState } from 'react';
import Usage from './editor/Usage';
import Controls from './editor/Controls';
import Breadcrumb from './editor/Breadcrumb';
import MapView from './editor/MapView';
import Meta from './editor/Meta';
import Editor from './editor/Editor';
import {renderSvg} from '../renderSwardley';
import Convert from '../convert';

function App(){

    let loaded = false;
    const [currentUrl, setCurrentUrl] = useState('');
    const [metaText, setMetaText] = useState('');

    const setMetaData = () =>{
        var i = $.map($('.draggable'), function (el) {
            return { name: $(el).attr('id'), x: $(el).attr('x'), y: $(el).attr('y') };
        })
        setMetaText(JSON.stringify(i));
    }
    const [mapText, setMapText] = useState('');

    const mutateMapText = (newText) => {
        setMapText(newText);
        updateMap(newText, metaText);
    };

    const updateMap = (newText, newMeta) => {
        try {
            generateMap(newText, newMeta);  
        } catch (e) {
            console.log('Invalid markup, could not render.');
        }
    };

    function NewMap(){
        setMapText('');
        setMetaText('');
        updateMap('','');
        window.location.hash = '';
        setCurrentUrl('(unsaved)');
    }

    function SaveMap(){
        loaded = false;
        setCurrentUrl('(saving...)');
        var hash = window.location.hash.replace("#", "");
        save(hash);
    }

    const save = function(hash) {
        $.ajax({
            type: "POST",
            url: "https://s7u91cjmdf.execute-api.eu-west-1.amazonaws.com/dev/maps/save",
            data: JSON.stringify({ id: hash, text: mapText, meta: metaText }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                window.location.hash = '#' + data.id;
                setCurrentUrl(window.location.href);
            },
            failure: function (errMsg) {
                setCurrentUrl('(could not save map, please try again)')
            }
        });
    };

    var selectedElement, offset;

    function getMousePosition(evt) {
        var CTM = document.getElementById('svgMap').getScreenCTM();
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }

    var getWidth = function () {
        var textWidth = $('#htmPane').width();
        var width = $(window).width();
        var calcWidth = (width - textWidth - 120);
        return calcWidth;
    };

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

    function generateMap(txt, meta) {
        loaded = false;
        var r = new Convert().parse(txt);
        $('#title').text(r.title);
        $('#map').html(renderSvg(r, getWidth(), 600));
        $('.draggable').on('mousedown', startDrag)
            .on('mousemove', drag)
            .on('mouseup', endDrag);
        if (meta.length > 0) {
            var items = JSON.parse(meta);
            items.forEach(element => {
                $('#' + element.name).attr('x', element.x).attr('y', element.y);
                $('tspan', $('#' + element.name)).attr('x', element.x);
            });
        }
    };

    React.useEffect(() => {
        
        function loadMap(){
            setCurrentUrl('(unsaved)');
            generateMap('', '');
            if (window.location.hash.length > 0 & loaded == false) {
                loaded = true;
                setCurrentUrl('(loading...)');
                var fetch = "https://s7u91cjmdf.execute-api.eu-west-1.amazonaws.com/dev/maps/fetch?id=" + window.location.hash.replace("#", "");
                $.getJSON(fetch, function (d) {
                    if (d.meta == undefined || d.meta == null) {
                        d.meta = "";
                    }
                    setMapText(d.text);
                    setMetaText(d.meta);
                    updateMap(d.text, d.meta);
                    setCurrentUrl(window.location.href);
                });
            }
        }
        function handleResize(){
            generateMap(mapText);
        }
        window.addEventListener('resize', handleResize);
        window.addEventListener('load',  loadMap);
    });

    return (
        <>
        <nav className="navbar navbar-dark"> 
            <div className="container-fluid">
                <a className="navbar-brand" href="#">
                    <h3>Online Wardley Maps</h3> 
                </a>
                <div id="controlsMenuControl">
                    <Controls mutateMapText={mutateMapText} newMapClick={NewMap} saveMapClick={SaveMap} />
                </div>
            </div>
        </nav>

        <Breadcrumb currentUrl={currentUrl} />

        <div className="container-fluid">
            <div className="row">
                <div className="col">
                    <Editor mapText={mapText} mutateMapText={mutateMapText} />
                    <div className="form-group">
                        <Meta metaText={metaText} />
                        <Usage mapText={mapText} mutateMapText={mutateMapText} />
                    </div>
                </div>
                <MapView />
            </div>
        </div>
        </>
    )
}

export default App;