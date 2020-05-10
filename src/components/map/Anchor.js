import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import PropTypes from 'prop-types';

const Anchor = props => {
	const elementKey = (prefix, suffix) => {
		return `anchor_${prefix != undefined ? prefix + '_' : ''}${
			props.anchor.id
		}${suffix != undefined ? '_' + suffix : ''}`;
	};
	const positionCalc = new PositionCalculator();
	const x = () =>
		positionCalc.maturityToX(props.anchor.maturity, props.mapDimensions.width);
	const y = () =>
		positionCalc.visibilityToY(
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
							`[${positionCalc.yToVisibility(
								moved.y,
								props.mapDimensions.height
							)}, ${positionCalc.xToMaturity(
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
							`[${positionCalc.yToVisibility(
								moved.y,
								props.mapDimensions.height
							)}, ${positionCalc.xToMaturity(
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
				id={elementKey()}
				onMove={endDrag}
				x={x()}
				y={y()}
				fixedY={false}
				fixedX={false}
			>
				{props.anchor.name.length < 15 ? (
					<text
						key={elementKey('text')}
						id={elementKey('text')}
						data-testid={elementKey('text')}
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
						id={elementKey('text')}
						key={elementKey('text')}
						data-testid={elementKey('text')}
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
									key={elementKey('text_span', i)}
									id={elementKey('text_span', i)}
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
};

Anchor.propTypes = {
	anchor: PropTypes.object.isRequired,
	mapDimensions: PropTypes.object.isRequired,
	mapText: PropTypes.string.isRequired,
	mutateMapText: PropTypes.func.isRequired,
	mapStyleDefs: PropTypes.object.isRequired,
};

export default Anchor;
