import React from 'react';
import MapPositionCalculator from '../../MapPositionCalculator';

function Inertia(props) {
	const mapCalc = new MapPositionCalculator();
	const x = () =>
		mapCalc.maturityToX(props.maturity, props.mapDimensions.width);
	const y = () =>
		mapCalc.visibilityToY(props.visibility, props.mapDimensions.height);

	//    React.useEffect(()xZ)

	return (
		<line
			x1={x()}
			y1={y() - 10}
			x2={x()}
			y2={y() + 10}
			stroke="black"
			strokeWidth="6"
		/>
	);
}

export default Inertia;
