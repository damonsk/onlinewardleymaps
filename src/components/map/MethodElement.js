import React from 'react';
import MapPositionCalculator from '../../MapPositionCalculator';

function MethodElement(props) {
	const mapCalc = new MapPositionCalculator();
	const x = () =>
		mapCalc.maturityToX(props.element.maturity, props.mapDimensions.width);
	const y = () =>
		mapCalc.visibilityToY(props.element.visibility, props.mapDimensions.height);

	const defineStoke = function() {
		switch (props.method.method) {
			case 'outsource':
				return '#444444';
			case 'build':
				return '#000000';
			default:
				return '#D6D6D6';
		}
	};

	const defineFill = function() {
		switch (props.method.method) {
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
			id={'method_' + props.element.id}
			transform={'translate (' + x() + ',' + y() + ')'}
		>
			<circle
				id={'element_circle_' + props.element.id}
				cx="0"
				cy="0"
				r="20"
				fill={defineFill()}
				stroke={defineStoke()}
			/>
		</g>
	);
}

export default MethodElement;
