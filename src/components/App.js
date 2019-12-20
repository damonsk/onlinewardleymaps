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
        generateMap(newText);
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

    

    React.useEffect(() => {
        function handleResize(){
            generateMap(mapText);
        }
        window.addEventListener('resize', handleResize)
      })

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

        <Breadcrumb />

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