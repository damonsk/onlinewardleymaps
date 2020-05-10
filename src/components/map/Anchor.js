import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import PropTypes from 'prop-types';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';

const Anchor = props => {
	const identity = 'anchor';
	const elementKey = (prefix, suffix) => {
		return `${identity}_${prefix != undefined ? prefix + '_' : ''}${
			props.anchor.id
		}${suffix != undefined ? '_' + suffix : ''}`;
	};
	const positionCalc = new PositionCalculator();
	const positionUpdater = new DefaultPositionUpdater(
		identity,
		props.mapText,
		props.mutateMapText,
		[ExistingCoordsMatcher, NotDefinedCoordsMatcher]
	);
	const x = () =>
		positionCalc.maturityToX(props.anchor.maturity, props.mapDimensions.width);
	const y = () =>
		positionCalc.visibilityToY(
			props.anchor.visibility,
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
			props.anchor.name
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
