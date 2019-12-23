import React from 'react';
import MapPositionCalculator from "../../MapPositionCalculator";

function EvolvingComponentLink(props){

    const mapCalc = new MapPositionCalculator();
    const x1 = () => mapCalc.maturityToX(props.startElement.maturity, props.mapDimensions.width);
    const x2 = () => mapCalc.maturityToX(props.endElement.maturity, props.mapDimensions.width);
    const y1 = () => mapCalc.visibilityToY(props.startElement.visibility, props.mapDimensions.height);
    const y2 = () => mapCalc.visibilityToY(props.endElement.visibility, props.mapDimensions.height);
    
    if (props.endElement.inertia) {

        var boundary = x1;
        if(props.startElement.maturity >= 0.25){
            boundary = 0.25;
        }
        if (props.startElement.maturity >= 0.5){
            boundary = 0.5;
        }
        if (props.startElement.maturity >= 0.75){
            boundary = 0.75;
        }
        var boundaryX = mapCalc.maturityToX(boundary, props.mapDimensions.width);
        //returnString = returnString + '<line x1="' + (boundaryX) + '" y1="' + (y2 - 10) + '" x2="' + (boundaryX) + '" y2="' + (y2 + 10) + '" stroke="black" stroke-width="6" />';
    }

    return (
        <g id={props.key}>
            <line 
                x1={x1()} 
                y1={y1()} 
                x2={x2()} 
                y2={y2()} 
                strokeDasharray="5 5"
                markerStart="url(#arrow)"
                stroke="red" />
            {props.endElement.inertia == false ? null 
                : <line x1={boundaryX} y1={(y2() - 10)} x2={boundaryX} y2={(y2() + 10)} stroke="black" stroke-width="6" />
            }

        </g>
    )
}

export default EvolvingComponentLink;