import React from 'react';
import InertiaSymbol from '../symbols/InertiaSymbol';
import PositionCalculator from './PositionCalculator';

function Inertia(props) {
	const positionCalc = new PositionCalculator();
	const x = () =>
		positionCalc.maturityToX(props.maturity, props.mapDimensions.width);
	const y = () =>
		positionCalc.visibilityToY(props.visibility, props.mapDimensions.height);

	return <InertiaSymbol x={x()} y={y()} />;
}

export default Inertia;
