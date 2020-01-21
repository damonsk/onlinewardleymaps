import React from 'react';
import MapPositionCalculator from '../../MapPositionCalculator';
import Movable from './Movable';

function Anchor(props) {
	var _mapHelper = new MapPositionCalculator();
	const x = () =>
		_mapHelper.maturityToX(props.anchor.maturity, props.mapDimensions.width);
	const y = () =>
		_mapHelper.visibilityToY(
			props.anchor.visibility,
			props.mapDimensions.height
		);

	function endDrag(moved) {
		props.mutateMapText(
			props.mapText
				.split('\n')
				.map(line => {
					if (
						line
							.replace(/\s/g, '')
							.indexOf(
								'anchor' + props.anchor.name.replace(/\s/g, '') + '['
							) !== -1
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
						'anchor' + props.anchor.name.replace(/\s/g, '')
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
		<>
			<Movable
				id={'anchor_' + props.anchor.id}
				onMove={endDrag}
				x={x()}
				y={y()}
				fixedY={false}
				fixedX={false}
			>
				{props.anchor.name.length < 15 ? (
					<text
						key={'anchor_text_' + props.anchor.id}
						id={'anchor_text_' + props.anchor.id}
						className="label"
						x="0"
						y="-10"
						fontWeight="14px"
						textAnchor="middle"
						fill={props.mapStyleDefs.component.textColor}
					>
						{props.anchor.name}
					</text>
				) : (
					<text
						id={'anchor_text_' + props.anchor.id}
						key={'anchor_text_' + props.anchor.id}
						x="0"
						y="0"
						transform="translate(0, 0)"
						className="label"
						fill={props.mapStyleDefs.component.textColor}
					>
						{props.anchor.name
							.trim()
							.split(' ')
							.map((text, i) => (
								<tspan
									key={'anchor_text_span_' + props.anchor.id + '_' + i}
									id={'anchor_text_span_' + props.anchor.id + '_' + i}
									x={0}
									dy={i > 0 ? 15 : 0}
									textAnchor="middle"
								>
									{text.trim()}
								</tspan>
							))}
					</text>
				)}
			</Movable>
		</>
	);
}

export default Anchor;
