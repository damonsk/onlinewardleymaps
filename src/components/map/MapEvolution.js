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
				stroke="black"
			/>
			<text x="0" y="1em" textAnchor="start">
				{props.mapEvolutionStates.genesis}
			</text>
			<text x="0" y="2em" textAnchor="start">
				&nbsp;
			</text>
			<text x={custMark + 5} y="1em" textAnchor="start">
				{props.mapEvolutionStates.custom}
			</text>
			<text x={custMark + 5} y="2em" textAnchor="start">
				&nbsp;
			</text>
			<text x={prodMark + 5} y="1em" textAnchor="start">
				{props.mapEvolutionStates.product}
			</text>
			<text x={prodMark + 5} y="2em" textAnchor="start">
				&nbsp;
			</text>
			<text x={commMark + 5} y="1em" textAnchor="start">
				{props.mapEvolutionStates.commodity}
			</text>
			<text x={commMark + 5} y="2em" textAnchor="start">
				&nbsp;
			</text>
			<text
				x={props.mapDimensions.width}
				y="1.5em"
				textAnchor="end"
				fontWeight="bold"
			>
				Evolution
			</text>
		</g>
	);
}

export default MapEvolution;
