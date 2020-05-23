import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import LineNumberPositionUpdater from './positionUpdaters/LineNumberPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';

function Note(props) {
	const positionCalc = new PositionCalculator();
	const positionUpdater = new LineNumberPositionUpdater(
		'note',
		props.mapText,
		props.mutateMapText,
		[ExistingCoordsMatcher, NotDefinedCoordsMatcher]
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
		positionUpdater.update(
			{ param1: visibility, param2: maturity },
			props.note.text,
			props.note.line
		);
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
			<ComponentTextSymbol
				id={'note_text_' + props.note.id}
				note={props.note.text}
				styles={props?.mapStyleDefs?.note}
				onClick={() => props.setHighlightLine(props.note.line)}
			/>
		</Movable>
	);
}

export default Note;
