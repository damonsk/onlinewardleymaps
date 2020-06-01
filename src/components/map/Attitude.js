import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import PropTypes from 'prop-types';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';
import AttitudeSymbol from '../symbols/AttitudeSymbol';

const Attitude = props => {
	const { attitude } = props;
	const positionCalc = new PositionCalculator();
	const positionUpdater = new DefaultPositionUpdater(
		attitude,
		props.mapText,
		props.mutateMapText,
		[ExistingCoordsMatcher, NotDefinedCoordsMatcher]
	);
	const x = positionCalc.maturityToX(props.maturity, props.mapDimensions.width);
	const y = positionCalc.visibilityToY(
		props.visibility,
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
		positionUpdater.update({ param1: visibility, param2: maturity }, attitude);
	}

	return (
		<>
			<Movable
				id={`attitude_${attitude}_movable`}
				onMove={endDrag}
				x={x}
				y={y}
				fixedY={false}
				fixedX={false}
			>
				<AttitudeSymbol
					id={`attitude_${attitude}`}
					attitude={attitude}
					x="0"
					y="-10"
					textAnchor="middle"
					styles={props.mapStyleDefs.attitudes}
				/>
			</Movable>
		</>
	);
};

Attitude.propTypes = {
	anchor: PropTypes.object.isRequired,
	mapDimensions: PropTypes.object.isRequired,
	mapText: PropTypes.string.isRequired,
	mutateMapText: PropTypes.func.isRequired,
	mapStyleDefs: PropTypes.object.isRequired,
};

export default Attitude;
