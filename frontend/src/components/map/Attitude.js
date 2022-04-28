import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import PropTypes from 'prop-types';
import LineNumberPositionUpdater from './positionUpdaters/LineNumberPositionUpdater';
import { ExistingManyCoordsMatcher } from './positionUpdaters/ExistingManyCoordsMatcher';
import { NotDefinedManyCoordsMatcher } from './positionUpdaters/NotDefinedManyCoordsMatcher';
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
		[ExistingManyCoordsMatcher, NotDefinedManyCoordsMatcher]
	);
	const x = positionCalc.maturityToX(attitude.maturity, width);
	const x2 = positionCalc.maturityToX(attitude.maturity2, width);
	const y = positionCalc.visibilityToY(attitude.visibility, height);
	const y2 = positionCalc.visibilityToY(attitude.visibility2, height);

	function endDrag(moved) {
		const visibility = positionCalc.yToVisibility(moved.y, height);
		const maturity = positionCalc.xToMaturity(moved.x, width);
		let visibility2 = attitude.visibility2;
		let maturity2 = attitude.maturity2;
		if (attitude.visibility < visibility) {
			visibility2 = visibility - attitude.visibility + attitude.visibility2;
		}
		if (attitude.visibility > visibility) {
			visibility2 = visibility - attitude.visibility + attitude.visibility2;
		}
		if (attitude.maturity < maturity) {
			maturity2 = maturity - attitude.maturity + attitude.maturity2;
		}
		if (attitude.maturity > maturity) {
			maturity2 = maturity - attitude.maturity + attitude.maturity2;
		}

		positionUpdater.update(
			{
				param1: parseFloat(visibility).toFixed(2),
				param2: parseFloat(maturity).toFixed(2),
				param3: parseFloat(visibility2).toFixed(2),
				param4: parseFloat(maturity2).toFixed(2),
			},
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
					height={y2 - y}
					width={x2 - x}
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
