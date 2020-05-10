import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';

function Note(props) {
	const positionCalc = new PositionCalculator();
	const positionUpdater = new DefaultPositionUpdater(
		'note',
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
		const visibility = positionCalc.yToVisibility(
			moved.y,
			props.mapDimensions.height
		);
		const maturity = positionCalc.xToMaturity(
			moved.x,
			props.mapDimensions.width
		);
		positionUpdater.update({ visibility, maturity }, props.note.text);
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
