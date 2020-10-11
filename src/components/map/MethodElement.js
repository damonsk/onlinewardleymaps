import React from 'react';
import PropTypes from 'prop-types';
import PositionCalculator from './PositionCalculator';
import MethodSymbol from '../symbols/MethodSymbol';

function MethodElement({ element, mapDimensions, method, mapStyleDefs }) {
	const positionCalc = new PositionCalculator();
	const x = positionCalc.maturityToX(element.maturity, mapDimensions.width);
	const y = positionCalc.visibilityToY(
		element.visibility,
		mapDimensions.height
	);
	return (
		<MethodSymbol
			id={'method_' + element.id}
			x={x}
			y={y}
			method={method}
			styles={mapStyleDefs.methods}
		/>
	);
}

MethodElement.propTypes = {
	element: PropTypes.shape({
		id: PropTypes.number,
		maturity: PropTypes.number,
		visibility: PropTypes.number,
	}),
	mapDimensions: PropTypes.shape({
		width: PropTypes.number,
		height: PropTypes.number,
	}),
	method: PropTypes.string,
};

export default MethodElement;
