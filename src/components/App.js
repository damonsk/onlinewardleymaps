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
        try {
            generateMap(newText);  
        } catch (e) {
            console.log('Invalid markup, could not render.');
        }
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

    function generateMap(txt) {
        var r = new Convert().parse(txt);
        $('#title').text(r.title);
        $('#map').html(renderSvg(r, getWidth(), 600));

        $('.draggable').on('mousedown', startDrag)
            .on('mousemove', drag)
            .on('mouseup', endDrag);

        if (metaText.length > 0) {
            var items = JSON.parse(metaText);
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

    React.useEffect(() => {
        
        function hashChange(){
            if (window.location.hash.length > 0) {
                setCurrentUrl('loading...');
                var fetch = "https://s7u91cjmdf.execute-api.eu-west-1.amazonaws.com/dev/maps/fetch?id=" + window.location.hash.replace("#", "");
                $.getJSON(fetch, function (d) {
                    mutateMapText(d.text);
                    if (d.meta != null && d.meta != undefined) {
                        setMetaData(d.meta);
                    }
                    setCurrentUrl(window.location.href);
                    generateMap();
                });
            }
        }
        function handleResize(){
            generateMap(mapText);
        }
        window.addEventListener('resize', handleResize);
        window.addEventListener('load', hashChange);
        window.addEventListener('hashchange', hashChange);
    });

    return (
        <>
        <nav className="navbar navbar-dark"> 
            <div className="container-fluid">
                <a className="navbar-brand" href="#">
                    <h3>Online Wardley Maps</h3> 
                </a>
                <div id="controlsMenuControl">
                    <Controls mutateMapText={mutateMapText} />
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
                        <Usage />
                    </div>
                </div>
                <MapView />
            </div>
        </div>
        </>
    )
}

export default App;