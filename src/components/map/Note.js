import React from 'react';
import MapPositionCalculator from '../../MapPositionCalculator';
import Movable from './Movable';

function Note(props) {
	var _mapHelper = new MapPositionCalculator();
	const x = () =>
		_mapHelper.maturityToX(props.note.maturity, props.mapDimensions.width);
	const y = () =>
		_mapHelper.visibilityToY(props.note.visibility, props.mapDimensions.height);

	function endDrag(moved) {
		props.mutateMapText(
			props.mapText
				.split('\n')
				.map(line => {
					if (
						line
							.replace(/\s/g, '')
							.indexOf('note' + props.note.text.replace(/\s/g, '') + '[') !== -1
					) {
						return line.replace(
							/\[(.?|.+?)\]/g,
							`[${_mapHelper.yToVisibility(
								moved.y,
								props.mapDimensions.height
							)}, ${_mapHelper.xToMaturity(
								moved.x,
								props.mapDimensions.width
							)}]`
						);
					} else if (
						line.replace(/\s/g, '') ===
						'note' + props.note.text.replace(/\s/g, '')
					) {
						return (
							line.trim() +
							' ' +
							`[${_mapHelper.yToVisibility(
								moved.y,
								props.mapDimensions.height
							)}, ${_mapHelper.xToMaturity(
								moved.x,
								props.mapDimensions.width
							)}]`
						);
					} else {
						return line;
					}
				})
				.join('\n')
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
