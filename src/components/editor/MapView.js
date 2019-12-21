import React from 'react';

const MapView = (props) => (
    
    <div className="col-8">
        <h3 id="title">{props.mapTitle}</h3>
        <div id="map"></div>
    </div>
)

export default MapView;