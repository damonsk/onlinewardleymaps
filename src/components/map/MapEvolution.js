import React from 'react';

function MapEvolution(props) {
	var custMark = props.mapDimensions.width / 4 + 2;
	var prodMark = props.mapDimensions.width / 2 + 2;
	var commMark = (props.mapDimensions.width / 4) * 3 + 2;

	return (
		<g
			id="Evolution"
			transform={'translate(0,' + props.mapDimensions.height + ')'}
		>
			<line
				x1="0"
				y1="0"
				x2={props.mapDimensions.width}
				y2="0"
				stroke={props.mapStyleDefs.stroke}
				strokeWidth={props.mapStyleDefs.strokeWidth}
			/>
			<text x="0" y="1em" textAnchor="start">
				{props.mapEvolutionStates.genesis.l1}
			</text>
			<text x="0" y="2em" textAnchor="start">
				{props.mapEvolutionStates.genesis.l2}
			</text>
			<text x={custMark + 5} y="1em" textAnchor="start">
				{props.mapEvolutionStates.custom.l1}
			</text>
			<text x={custMark + 5} y="2em" textAnchor="start">
				{props.mapEvolutionStates.custom.l2}
			</text>
			<text x={prodMark + 5} y="1em" textAnchor="start">
				{props.mapEvolutionStates.product.l1}
			</text>
			<text x={prodMark + 5} y="2em" textAnchor="start">
				{props.mapEvolutionStates.product.l2}
			</text>
			<text x={commMark + 5} y="1em" textAnchor="start">
				{props.mapEvolutionStates.commodity.l1}
			</text>
			<text x={commMark + 5} y="2em" textAnchor="start">
				{props.mapEvolutionStates.commodity.l2}
			</text>
			<text
				x={props.mapDimensions.width}
				y="1.8em"
				textAnchor="end"
				fontWeight="bold"
			>
				Evolution
			</text>
		</g>
	);
}

export default MapEvolution;
