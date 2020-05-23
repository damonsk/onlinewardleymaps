import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import PropTypes from 'prop-types';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';

const Anchor = props => {
	const identity = 'anchor';
	const elementKey = (prefix, suffix) => {
		return `${identity}_${prefix !== undefined ? prefix + '_' : ''}${
			props.anchor.id
		}${suffix !== undefined ? '_' + suffix : ''}`;
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
				<ComponentTextSymbol
					id={elementKey('text')}
					text={props.anchor.name}
					x="0"
					y="-10"
					textAnchor="middle"
					evolved={props.anchor.evolved}
					fontSize={props.mapStyleDefs.anchor.fontSize}
					styles={props.mapStyleDefs.component}
					onClick={() => props.setHighlightLine(props.anchor.line)}
				/>
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
