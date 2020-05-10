import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import DefaultPositionUpdater from './DefaultPositionUpdater';

function Note(props) {
	const positionCalc = new PositionCalculator();
	const positionUpdater = new DefaultPositionUpdater(
		'note',
		positionCalc,
		props.mapText,
		props.mutateMapText
	);

	const x = () =>
		positionCalc.maturityToX(props.note.maturity, props.mapDimensions.width);
	const y = () =>
		positionCalc.visibilityToY(
			props.note.visibility,
			props.mapDimensions.height
		);

	function endDrag(moved) {
		positionUpdater.update(moved, props.note.text, props.mapDimensions);
	}

	return (
		<Movable
			id={'note_' + props.note.id}
			onMove={endDrag}
			x={x()}
			y={y()}
			fixedY={false}
			fixedX={false}
		>
			<text
				key={'note_text_' + props.note.id}
				id={'note_text_' + props.note.id}
				className="label"
				x="0"
				y="0"
				textAnchor="start"
				fontWeight="bold"
				fontSize="12px"
				fill={'#000'}
			>
				{props.note.text}
			</text>
		</Movable>
	);
}

export default Note;
