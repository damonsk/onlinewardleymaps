import React from 'react';
import ComponentText from './ComponentText';
import MapPositionCalculator from '../../MapPositionCalculator';
import Movable from './Movable';
import Inertia from './Inertia';

function MapComponent(props) {
	var _mapHelper = new MapPositionCalculator();
	const x = () =>
		_mapHelper.maturityToX(props.element.maturity, props.mapDimensions.width);
	const y = () =>
		_mapHelper.visibilityToY(
			props.element.visibility,
			props.mapDimensions.height
		);

	function endDrag(moved) {
		props.mutateMapText(
			props.mapText
				.split('\n')
				.map(line => {
					if (
						props.element.evolved == undefined &&
						line
							.replace(/\s/g, '')
							.indexOf(
								'component' + props.element.name.replace(/\s/g, '') + '['
							) !== -1
					) {
						if (line.replace(/\s/g, '').indexOf('label[') > -1) {
							let parts = line.split('label');
							let newPart = parts[0].replace(
								/\[(.?|.+?)\]/g,
								`[${_mapHelper.yToVisibility(
									moved.y,
									props.mapDimensions.height
								)}, ${_mapHelper.xToMaturity(
									moved.x,
									props.mapDimensions.width
								)}]`
							);
							return newPart + 'label' + parts[1];
						} else {
							return line.replace(
								/\[(.?|.+?)\]/g,
								`[${_mapHelper.yToVisibility(
									moved.y,
									props.mapDimensions.height
								)}, ${_mapHelper.xToMaturity(
									moved.x,
									props.mapDimensions.width
								)}]`
							);
						}
					} else if (
						props.element.evolved == undefined &&
						line.replace(/\s/g, '') ===
							'component' + props.element.name.replace(/\s/g, '')
					) {
						return (
							line.trim() +
							' ' +
							`[${_mapHelper.yToVisibility(
								moved.y,
								props.mapDimensions.height
							)}, ${_mapHelper.xToMaturity(
								moved.x,
								props.mapDimensions.width
							)}]`
						);
					} else if (
						props.element.evolved &&
						line
							.replace(/\s/g, '')
							.indexOf('evolve' + props.element.name.replace(/\s/g, '')) !== -1
					) {
						return line.replace(
							/\s([0-9]?\.[0-9]+[0-9]?)+/g,
							` ${_mapHelper.xToMaturity(moved.x, props.mapDimensions.width)}`
						);
					} else {
						return line;
					}
				})
				.join('\n')
		);
	}

	return (
		<>
			<Movable
				id={'element_' + props.element.id}
				onMove={endDrag}
				x={x()}
				y={y()}
				fixedY={props.element.evolved}
				fixedX={false}
			>
				{props.element.pipeline == false ? (
					<circle
						id={'element_circle_' + props.element.id}
						cx="0"
						cy="0"
						strokeWidth={props.mapStyleDefs.component.strokeWidth}
						r={props.mapStyleDefs.component.radius}
						stroke={
							props.element.evolved
								? props.mapStyleDefs.component.evolved
								: props.mapStyleDefs.component.stroke
						}
						fill={
							props.element.evolved
								? props.mapStyleDefs.component.evolvedFill
								: props.mapStyleDefs.component.fill
						}
					/>
				) : (
					<rect
						id={'element_square_' + props.element.id}
						x="-5"
						y="-5"
						width="10"
						height="10"
						strokeWidth={props.mapStyleDefs.component.pipelineStrokeWidth}
						stroke={
							props.element.evolved
								? props.mapStyleDefs.component.evolved
								: props.mapStyleDefs.component.stroke
						}
						fill={
							props.element.evolved
								? props.mapStyleDefs.component.evolvedFill
								: props.mapStyleDefs.component.fill
						}
					/>
				)}
			</Movable>
			{(props.element.evolved == undefined || props.element.evolved == false) &&
			props.element.evolving == false &&
			props.element.inertia == true ? (
				<Inertia
					maturity={parseFloat(props.element.maturity) + 0.05}
					visibility={props.element.visibility}
					mapDimensions={props.mapDimensions}
				/>
			) : null}
			<g transform={'translate(' + x() + ',' + y() + ')'}>
				<ComponentText
					key={'component_text_' + props.element.id}
					mapStyleDefs={props.mapStyleDefs}
					element={props.element}
					mapText={props.mapText}
					mutateMapText={props.mutateMapText}
					setMetaText={props.setMetaText}
					metaText={props.metaText}
				/>
			</g>
		</>
	);
}

export default MapComponent;
