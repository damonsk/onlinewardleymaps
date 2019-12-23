import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import Usage from './editor/Usage';
import Controls from './editor/Controls';
import Breadcrumb from './editor/Breadcrumb';
import MapView from './map/MapView';
import Meta from './editor/Meta';
import Editor from './editor/Editor';
import {renderSvg} from '../renderSwardley';
import Convert from '../convert';

function App(){


    const defaultMapObject = {
        title: '',
        elements: [],
        links: [],
        evolution: [],
        presentation: { style: 'plain' },
        methods: []
    };

    const PAGE_TITLE = 'OnlineWardleyMaps - Draw Wardley Maps in seconds using this free online tool';
    const apiEndpoint = 'https://s7u91cjmdf.execute-api.eu-west-1.amazonaws.com/dev/maps/';
    let loaded = false;
    const [currentUrl, setCurrentUrl] = useState('');
    const [metaText, setMetaText] = useState('');
    const [mapText, setMapText] = useState('');
    const [mapTitle, setMapTitle] = useState('Untitled Map');
    const [mapObject, setMapObject] = useState(defaultMapObject);
    const [mapDimensions, setMapDimensions] = useState({width: 500, height: 600});
    const [mapEvolutionStates, setMapEvolutionStates] = useState({genesis: "Genesis", custom:"Custom Built", product: "Product", commodity: "Commodity"});
    const [mapStyle, setMapStyle] = useState('plain');
    const mapRef = useRef(null);

    const getHeight = () => 600;
    const getWidth = function () {
        var textWidth = $('#htmPane').width();
        var width = $(window).width();
        var calcWidth = (width - textWidth - 120);
        return calcWidth;
    };

    const setMetaData = () =>{
        var i = $.map($('.draggable'), function (el) {
            return { name: $(el).attr('id'), x: $(el).attr('x'), y: $(el).attr('y') };
        })
        setMetaText(JSON.stringify(i));
    };

    const mutateMapText = (newText) => {
        setMapText(newText);
        updateMap(newText, metaText);
    };

    const updateMap = (newText, newMeta) => {

            generateMap(newText, newMeta);


    };

    const saveToRemoteStorage = function(hash) {
        $.ajax({
            type: "POST",
            url: apiEndpoint + "save",
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

    const loadFromRemoteStorage = function(){
        setCurrentUrl('(unsaved)');
        generateMap('', '');
        if (window.location.hash.length > 0 & loaded == false) {
            loaded = true;
            setCurrentUrl('(loading...)');
            var fetch = apiEndpoint + "fetch?id=" + window.location.hash.replace("#", "");
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

    function newMap(){
        setMapText('');
        setMetaText('');
        updateMap('','');
        window.location.hash = '';
        setCurrentUrl('(unsaved)');
    }

    function saveMap(){
        loaded = false;
        setCurrentUrl('(saving...)');
        saveToRemoteStorage(window.location.hash.replace("#", ""));
    }

    function downloadMap() {
        html2canvas(mapRef.current).then(canvas => {
            const base64image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = mapTitle;
            link.href = base64image;
            link.click();
        });
    }



    var selectedElement, offset;

    function getMousePosition(evt) {
        var CTM = document.getElementById('svgMap').getScreenCTM();
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }

    function startDrag(evt) {

        var target = evt.currentTarget;
        if (target.nodeName == "tspan") {
            target = target.parentElement;
        }

        if (target.classList.contains('draggable')) {
            selectedElement = target;
            offset = getMousePosition(evt);
            if (target.classList.contains('node')) {
                //set offset against transform x and y values from the SVG element
                const transforms = selectedElement.transform.baseVal.consolidate().matrix;
                offset.x -= transforms.e;
                offset.y -= transforms.f;
            }
            offset.x -= parseFloat(selectedElement.getAttributeNS(null, "x"));
            offset.y -= parseFloat(selectedElement.getAttributeNS(null, "y"));
        }
    }
    //write mouse coords here to update everything in endDrag.
    let coord;
    function drag(evt) {
        if (selectedElement) {
            evt.preventDefault();
            coord = getMousePosition(evt);
            $('tspan', $(selectedElement)).attr('x', coord.x - offset.x);
            if (selectedElement.classList.contains('node')) {
                $(selectedElement).attr("transform", `translate(${coord.x},${coord.y})`);
            } else {
                $(selectedElement).attr("x", coord.x - offset.x).attr("y", coord.y - offset.y);
                setMetaData()
            }
        }
    }

    function endDrag(evt) {
        mutateMapText(
            mapText
                .split("\n")
                .map(line => {
                    console.log('component ' +
                    selectedElement
                        .querySelector("text")
                        .childNodes[0].nodeValue
                        .replace(/\s/g, "") + "[")
                    if (
                        line
                            .replace(/\s/g, "") //Remove all whitespace from the line in case the user has been abusive with their spaces.
                            //get node name from the rendered text in the map
                            .indexOf(
                                "component" +
                                    selectedElement
                                        .querySelector("text")
                                        .childNodes[0].nodeValue.replace(
                                            /\s/g,
                                            ""
                                        ) +
                                    "[" //Ensure that we are at the end of the full component name by checking for a brace
                            ) !== -1
                    ) {
                        //Update the component line in map text with new coord values.
                        //For evolved components, we only update the evolved value
                        if (selectedElement.classList.contains("evolved")) {
                            return line.replace(
                                //Take only the string evolve and the number that follows
                                /\] evolve\s([\.0-9])+/g,
                                `] evolve ${(
                                    (1 / getWidth()) *
                                    coord.x
                                ).toFixed(2)}`
                            );
                        } else {
                            return line.replace(
                                /\[(.+?)\]/g, //Find everything inside square braces.
                                `[${1 -
                                    ((1 / getHeight()) * coord.y).toFixed(
                                        2
                                    )}, ${((1 / getWidth()) * coord.x).toFixed(
                                    2
                                )}]`
                            );
                        }
                    } else {
                        return line;
                    }
                })
                .join("\n")
        );

        setMetaData();
        selectedElement = null;
    }

    function generateMap(txt, meta) {
        loaded = false;
        try {
            var r = new Convert().parse(txt);
            setMapTitle(r.title);
            document.title = r.title + ' - ' + PAGE_TITLE;
            setMapObject(r);
            setMapDimensions({width: getWidth(), height: getHeight()});
            setMapStyle(r.presentation.style);
            setMapEvolutionStates({
                genesis: r.evolution[0].line1,
                custom:r.evolution[1].line1,
                product: r.evolution[2].line1,
                commodity: r.evolution[3].line1
            });
        } catch (err) {
            console.log('Invalid markup, could not render.');
        }
    };

    React.useEffect(() => {
        window.addEventListener('resize', () => generateMap(mapText, metaText));
        window.addEventListener('load', loadFromRemoteStorage);
        try {
            $('#map').on('mousemove', drag);
            $('g#map').html(renderSvg(new Convert().parse(mapText), getWidth(), getHeight()))
            $('.draggable').on('mousedown', startDrag)
                .on('mouseup', endDrag);
            if (metaText.length > 0) {
                var items = JSON.parse(meta);
                items.forEach(element => {
                    $('#' + element.name).attr('x', element.x).attr('y', element.y);
                    $('tspan', $('#' + element.name)).attr('x', element.x);
                });
            }

        } catch (err) {
            console.log('Invalid markup, could not render.');
        }

        return function cleanup() {
            window.removeEventListener('resize', () => generateMap(mapText, metaText));
            window.removeEventListener('load', loadFromRemoteStorage);
        }
    });

    return (
    <React.Fragment>
            <nav className="navbar navbar-dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <h3>Online Wardley Maps</h3>
                    </a>
                    <div id="controlsMenuControl">
                        <Controls mutateMapText={mutateMapText} newMapClick={newMap} saveMapClick={saveMap} downloadMapImage={downloadMap} />
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

                    <MapView
                            mapTitle={mapTitle}
                            mapObject={mapObject}
                            mapDimensions={mapDimensions}
                            mapEvolutionStates={mapEvolutionStates}
                            mapStyle={mapStyle}
                            mapRef={mapRef}
                            mapObject={mapObject} />
                </div>
            </div>
        </React.Fragment>
    )
}

export default App;
