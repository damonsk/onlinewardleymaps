import React from 'react';
import PositionCalculator from './PositionCalculator';

function Inertia(props) {
	const positionCalc = new PositionCalculator();
	const x = () =>
		positionCalc.maturityToX(props.maturity, props.mapDimensions.width);
	const y = () =>
		positionCalc.visibilityToY(props.visibility, props.mapDimensions.height);

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
