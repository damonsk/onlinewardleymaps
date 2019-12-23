import React from 'react';
import MapPositionCalculator from "../../MapPositionCalculator";
var createReactClass = require('create-react-class');

function ComponentLink(props){

    const mapCalc = new MapPositionCalculator();
    const x1 = () => mapCalc.maturityToX(props.startElement.maturity, props.mapDimensions.width);
    const x2 = () => mapCalc.maturityToX(props.endElement.maturity, props.mapDimensions.width);
    const y1 = () => mapCalc.visibilityToY(props.startElement.visibility, props.mapDimensions.height);
    const y2 = () => mapCalc.visibilityToY(props.endElement.visibility, props.mapDimensions.height);

    function defineStoke(){
        return ((props.startElement.evolved || props.endElement.evolved) ? 'red' : 'grey');
    }

    const isFlow = () => {
        return (props.link.flow && (
            (props.link.future == props.link.past) // both
            || (props.link.past == true && props.endElement.evolving == false && props.startElement.evolving == true)
            || (props.link.past == true && props.endElement.evolving == true && props.startElement.evolving == false)
    
            || (props.link.future == true && props.startElement.eolving == true)
            || (props.link.future == true && props.startElement.evolved == true)
            || (props.link.future == true && props.endElement.evolved == true)
        ));
    }

    return (
        <>
        <line x1={x1()} y1={y1()} x2={x2()} y2={y2()} stroke={defineStoke()} />
        {isFlow() ? <FlowLink />  : null }
        </>
    )
}

var FlowLink = createReactClass({
    render: function() {
        <>
        <g key={props.key} id={"flow_" + props.endElement.name} transform={"translate(" + x2() + "," + y2() + ")"}>
            {props.link.flowValue.length > 0 
                ? 
                <text class="draggable label" id={"flow_text_" + props.startElement.id + "_"+ props.endElement.id} x="10" y="-30" textAnchor="start" fill="#03a9f4">
                    {prop.link.flowValue}
                </text>
                : null
            }
        </g>
        <line x1={x1()} y1={y1()} x2={x2()} y2={y2()} stroke-width="10" stroke="#99c5ee9e" />
        </>
    }
});

export default ComponentLink;