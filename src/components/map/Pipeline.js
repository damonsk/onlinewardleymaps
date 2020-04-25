import React from 'react';
import MapPositionCalculator from '../../MapPositionCalculator';
import Movable from './Movable';

function Pipeline(props) {
	var _mapHelper = new MapPositionCalculator();
	console.log(props.pipeline);
	const x1 = () =>
		_mapHelper.maturityToX(props.pipeline.maturity1, props.mapDimensions.width);
	const x2 = () =>
		_mapHelper.maturityToX(props.pipeline.maturity2, props.mapDimensions.width);
	const y = () =>
		_mapHelper.visibilityToY(
			props.pipeline.visibility,
			props.mapDimensions.height
		) + 2;

	function endDrag() {
		// props.mutateMapText(
		// 	props.mapText
		// 		.split('\n')
		// 		.map(line => {
		// 			if (
		// 				props.element.evolved == undefined &&
		// 				line
		// 					.replace(/\s/g, '')
		// 					.indexOf(
		// 						'component' + props.element.name.replace(/\s/g, '') + '['
		// 					) !== -1
		// 			) {
		// 				if (line.replace(/\s/g, '').indexOf('label[') > -1) {
		// 					let parts = line.split('label');
		// 					let newPart = parts[0].replace(
		// 						/\[(.?|.+?)\]/g,
		// 						`[${_mapHelper.yToVisibility(
		// 							moved.y,
		// 							props.mapDimensions.height
		// 						)}, ${_mapHelper.xToMaturity(
		// 							moved.x,
		// 							props.mapDimensions.width
		// 						)}]`
		// 					);
		// 					return newPart + 'label' + parts[1];
		// 				} else {
		// 					return line.replace(
		// 						/\[(.?|.+?)\]/g,
		// 						`[${_mapHelper.yToVisibility(
		// 							moved.y,
		// 							props.mapDimensions.height
		// 						)}, ${_mapHelper.xToMaturity(
		// 							moved.x,
		// 							props.mapDimensions.width
		// 						)}]`
		// 					);
		// 				}
		// 			} else if (
		// 				props.element.evolved == undefined &&
		// 				line.replace(/\s/g, '') ===
		// 					'component' + props.element.name.replace(/\s/g, '')
		// 			) {
		// 				return (
		// 					line.trim() +
		// 					' ' +
		// 					`[${_mapHelper.yToVisibility(
		// 						moved.y,
		// 						props.mapDimensions.height
		// 					)}, ${_mapHelper.xToMaturity(
		// 						moved.x,
		// 						props.mapDimensions.width
		// 					)}]`
		// 				);
		// 			} else if (
		// 				props.element.evolved &&
		// 				line
		// 					.replace(/\s/g, '')
		// 					.indexOf('evolve' + props.element.name.replace(/\s/g, '')) !== -1
		// 			) {
		// 				return line.replace(
		// 					/\s([0-9]?\.[0-9]+[0-9]?)+/g,
		// 					` ${_mapHelper.xToMaturity(moved.x, props.mapDimensions.width)}`
		// 				);
		// 			} else {
		// 				return line;
		// 			}
		// 		})
		// 		.join('\n')
		// );
	}

	return (
		<>
			<Movable
				id={'pipeline_' + props.pipeline.id}
				onMove={endDrag}
				x={x1()}
				y={y()}
				fixedY={true}
				fixedX={true}
			>
				<g x={x1()} y={y()}>
					<line
						x1={0}
						y1={0}
						x2={x2() - x1()}
						y2={0}
						strokeWidth={1}
						stroke={props.mapStyleDefs.component.stroke}
					/>
					<line
						x1={x2() - x1()}
						y1={0}
						x2={x2() - x1()}
						y2={22}
						strokeWidth={1}
						stroke={props.mapStyleDefs.component.stroke}
					/>
					<line
						x1={x2() - x1()}
						y1={22}
						x2={0}
						y2={22}
						strokeWidth={1}
						stroke={props.mapStyleDefs.component.stroke}
					/>
					<line
						x1={0}
						y1={22}
						x2={0}
						y2={0}
						strokeWidth={1}
						stroke={props.mapStyleDefs.component.stroke}
					/>
					<line
						x1={10}
						y1={12}
						x2={x2() - x1() - 25}
						y2={12}
						strokeWidth={1}
						stroke={props.mapStyleDefs.component.stroke}
						strokeDasharray="2 2"
						markerEnd="url(#pipelineArrow)"
					/>
					<circle
						id={'pipeline_circle_' + props.pipeline.id}
						cx="10"
						cy="12"
						strokeWidth={props.mapStyleDefs.component.strokeWidth}
						r={props.mapStyleDefs.component.radius}
						stroke={props.mapStyleDefs.component.stroke}
						fill={props.mapStyleDefs.component.fill}
					/>
					<circle
						id={'pipeline_circle_' + props.pipeline.id}
						cx={x2() - x1() - 10}
						cy="12"
						strokeWidth={props.mapStyleDefs.component.strokeWidth}
						r={props.mapStyleDefs.component.radius}
						stroke={props.mapStyleDefs.component.stroke}
						fill={props.mapStyleDefs.component.fill}
					/>
				</g>
			</Movable>
		</>
	);
}

export default Pipeline;
