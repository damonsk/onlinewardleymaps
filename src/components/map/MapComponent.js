import React from 'react';
import MapPositionCalculator from "../../MapPositionCalculator";
var createReactClass = require('create-react-class');

function MapComponent(props){

    var _mapHelper = new MapPositionCalculator();
    const x = () => _mapHelper.maturityToX(props.element.maturity, props.mapDimensions.width);
    const y = () => _mapHelper.visibilityToY(props.element.visibility, props.mapDimensions.height);


    return ( 
        <g 
            key={props.key} 
            className={"draggable node " + (props.element.evolved ? "evolved" : "")} 
            id={"element_" + props.element.id}
            transform={"translate(" + x() + "," + y() + ")"}>

            <circle id={"element_circle_" + props.element.id} cx="0" cy="0" r="5" stroke={(props.element.evolved ? "red" : "black")} fill="white" />
            {props.element.name.length < 15 ? <text 
                id={"element_text_" + props.element.id} 
                className="draggable label" 
                x="10" 
                y="-5" 
                textAnchor="start" 
                fill={(props.element.evolved ? 'red' : 'black')}>{props.element.name}</text>
                : <text id={"element_text_" + props.element.id} 
                    x="10" 
                    y="-20" 
                    transform="translate(30, 10)" 
                    className="draggable label">
                        {props.element.name.trim().split(' ').map((text, i) => 
                            <tspan x="0" dy={((i > 0) ? 15 : 0)} textAnchor="middle">{text.trim()}</tspan>
                        )}
                    </text>
            }

        </g>
    )
}

export default MapComponent;