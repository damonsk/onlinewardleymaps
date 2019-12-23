import React from 'react';
import MapPositionCalculator from "../../MapPositionCalculator";

function ComponentLink(props){

    const mapCalc = new MapPositionCalculator();
    const x1 = () => mapCalc.maturityToX(props.startElement.maturity, props.mapWidth);
    const x2 = () => mapCalc.maturityToX(props.endElement.maturity, props.mapWidth);
    const y1 = () => mapCalc.visibilityToY(props.startElement.visibility, props.mapHeight);
    const y2 = () => mapCalc.visibilityToY(props.endElement.visibility, props.mapHeight);

    function defineStoke(){
        return ((props.startElement.evolved || props.endElement.evolved) ? 'red' : 'grey');
    }

    const isFlow = () => {
        return (link.flow && (
            (link.future == link.past) // both
            || (link.past == true && endElement.evolving == false && startElement.evolving == true)
            || (link.past == true && endElement.evolving == true && startElement.evolving == false)
    
            || (link.future == true && startElement.eolving == true)
            || (link.future == true && startElement.evolved == true)
            || (link.future == true && endElement.evolved == true)
        ));
    }

    render()(
        <>
        <line x1={x1()} y1={y1()} x2={x2()} y2={y2} stroke={defineStoke()} />
        {isFlow() ? <FlowLink />  : null }
        </>
    )
}

var FlowLink = createReactClass({
    render: function() {
        <>
        <g id={"flow_" + props.endElement.name} transform={"translate(" + x2() + "," + y2() + ")"}>
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