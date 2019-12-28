import React from 'react';
import PropTypes from 'prop-types';

import MapPositionCalculator from '../../MapPositionCalculator';

function MethodElement({ element, mapDimensions, method }) {
	console.log(element);
	const mapCalc = new MapPositionCalculator();
	const x = () => mapCalc.maturityToX(element.maturity, mapDimensions.width);
	const y = () =>
		mapCalc.visibilityToY(element.visibility, mapDimensions.height);

	const defineStoke = function() {
		switch (method.method) {
			case 'outsource':
				return '#444444';
			case 'build':
				return '#000000';
			default:
				return '#D6D6D6';
		}
	};

	const defineFill = function() {
		switch (method.method) {
			case 'outsource':
				return '#444444';
			case 'build':
				return '#D6D6D6';
			default:
				return '#AAA5A9';
		}
	};

	return (
		<g
			id={'method_' + element.id}
			transform={'translate (' + x() + ',' + y() + ')'}
		>
			<circle
				id={'element_circle_' + element.id}
				cx="0"
				cy="0"
				r="20"
				fill={defineFill()}
				stroke={defineStoke()}
			/>
		</g>
	);
}

MethodElement.propTypes = {
	element: PropTypes.shape({
		id: PropTypes.string,
		maturity: PropTypes.number,
		visibility: PropTypes.number,
	}),
	mapDimensions: PropTypes.shape({
		width: PropTypes.number,
		height: PropTypes.number,
	}),
	method: PropTypes.shape({
		method: PropTypes.string,
	}),
};

export default MethodElement;
