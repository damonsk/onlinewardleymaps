import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import PropTypes from 'prop-types';
import LineNumberPositionUpdater from './positionUpdaters/LineNumberPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';
import AttitudeSymbol from '../symbols/AttitudeSymbol';

const Attitude = props => {
	const { attitude, mapDimensions } = props;
	const { height, width } = mapDimensions;
	const type = attitude.attitude;
	const positionCalc = new PositionCalculator();
	const positionUpdater = new LineNumberPositionUpdater(
		type,
		props.mapText,
		props.mutateMapText,
		[ExistingCoordsMatcher, NotDefinedCoordsMatcher]
	);
	const x = positionCalc.maturityToX(attitude.maturity, width);
	const y = positionCalc.visibilityToY(attitude.visibility, height);

	function endDrag(moved) {
		const visibility = positionCalc.yToVisibility(moved.y, height);
		const maturity = positionCalc.xToMaturity(moved.x, width);
		positionUpdater.update(
			{ param1: visibility, param2: maturity },
			'',
			attitude.line
		);
	}

	return (
		<>
			<Movable
				id={`attitude_${type}_movable`}
				onMove={endDrag}
				x={x}
				y={y}
				fixedY={false}
				fixedX={false}
			>
				<AttitudeSymbol
					id={`attitude_${type}`}
					attitude={type}
					height={attitude.height}
					width={attitude.width}
					textAnchor="middle"
					styles={props.mapStyleDefs.attitudes}
				/>
			</Movable>
		</>
	);
};

Attitude.propTypes = {
	attitude: PropTypes.object.isRequired,
	mapDimensions: PropTypes.object.isRequired,
	mapText: PropTypes.string.isRequired,
	mutateMapText: PropTypes.func.isRequired,
	mapStyleDefs: PropTypes.object.isRequired,
};

export default Attitude;
