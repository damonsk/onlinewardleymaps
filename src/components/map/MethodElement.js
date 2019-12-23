import React from 'react';
import MapPositionCalculator from "../../MapPositionCalculator";

function MethodElement(props){

    const mapCalc = new MapPositionCalculator();
    const x = () => mapCalc.maturityToX(props.element.maturity, props.mapWidth);
    const y = () => mapCalc.visibilityToY(props.element.visibility, props.mapHeight);

    function defineStoke(){
        switch(props.method.method){
            case "outsourced": return "#444444";
            case "build": return "#000000";
            default: return "#D6D6D6";
        }
    }

    function defineFill(){
        switch(props.method.method){
            case "outsourced": return "#444444";
            case "build": return "#D6D6D6";
            default: return "#AAA5A9";
        }
    }

    render()(
        <g id={"method_" + props.element.id} transform={"translate (" + x() + "," + y() +")"}>
            <circle id={"element_circle_" + props.element.id} cx="0" cy="0" r="20" fill={defineFill()} stroke={defineStoke()} />
        </g>
    )
}

export default Breadcrumb;