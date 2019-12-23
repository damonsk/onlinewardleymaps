import React from 'react';

function MapGrid(props){
    return (
        <g id="valueChain" transform={"translate(0,"+props.mapDimensions.height+") rotate(270)"}>
            <line x1="0" y1="0" x2={props.mapDimensions.height} y2="0" stroke="black"/>
            <line x1="-2em" y1={(props.mapDimensions.width / 4)} x2={props.mapDimensions.height} y2={(props.mapDimensions.width / 4)} stroke="black" strokeDasharray="5,5"/>
            <line x1="-2em" y1={(props.mapDimensions.width / 2)} x2={props.mapDimensions.height} y2={(props.mapDimensions.width / 2)} stroke="black" strokeDasharray="5,5"/>
            <line x1="-2em" y1={(props.mapDimensions.width / 4 * 3)} x2={props.mapDimensions.height} y2={(props.mapDimensions.width / 4 * 3)} stroke="black" strokeDasharray="5,5"/>
            <text x="0" y="-0.2em" textAnchor="start">Invisible</text>
            <text x={(props.mapDimensions.height / 2)} y="-0.2em" textAnchor="middle" fontWeight="bold">Value Chain</text>
            <text x={props.mapDimensions.height} y="-0.2em" textAnchor="end">Visible</text>
        </g>
    )
}

export default MapGrid;