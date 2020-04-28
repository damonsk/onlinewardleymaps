import React from 'react';
import MapPositionCalculator from '../../MapPositionCalculator';
import InertiaSymbol from '../symbols/InertiaSymbol';

function Inertia(props) {
	const mapCalc = new MapPositionCalculator();
	const x = () =>
		mapCalc.maturityToX(props.maturity, props.mapDimensions.width);
	const y = () =>
		mapCalc.visibilityToY(props.visibility, props.mapDimensions.height);

	//    React.useEffect(()xZ)

	return <InertiaSymbol x={x()} y={y()} />;
}

export default Inertia;
