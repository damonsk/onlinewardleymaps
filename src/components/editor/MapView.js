import React from 'react';

const MapView = (props) => (

    <div className="col-8">
        {/* Wrapping div required to ensure that images aren't generated with a ton of whitespace */}
        <div ref={props.mapRef}>
            <h3 id="title">{props.mapTitle}</h3>
            <div id="map"></div>
        </div>
    </div>
)

export default MapView;