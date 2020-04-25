import React from 'react';
import MapPositionCalculator from '../../MapPositionCalculator';
import Movable from './Movable';

function Pipeline(props) {
	var _mapHelper = new MapPositionCalculator();
	const x1 = () =>
		_mapHelper.maturityToX(props.pipeline.maturity1, props.mapDimensions.width);
	const x2 = () =>
		_mapHelper.maturityToX(props.pipeline.maturity2, props.mapDimensions.width);
	const y = () =>
		_mapHelper.visibilityToY(
			props.pipeline.visibility,
			props.mapDimensions.height
		) + 2;

	function endDragX1(moved) {
		props.mutateMapText(
			props.mapText
				.split('\n')
				.map(line => {
					if (
						line
							.replace(/\s/g, '')
							.indexOf(
								'pipeline' + props.pipeline.name.replace(/\s/g, '') + '['
							) !== -1
					) {
						return line.replace(
							/\[(.?|.+?)\]/g,
							`[${_mapHelper.xToMaturity(
								moved.x,
								props.mapDimensions.width
							)}, ${props.pipeline.maturity2}]`
						);
					} else {
						return line;
					}
				})
				.join('\n')
		);
	}

	function endDragX2(moved) {
		props.mutateMapText(
			props.mapText
				.split('\n')
				.map(line => {
					if (
						line
							.replace(/\s/g, '')
							.indexOf(
								'pipeline' + props.pipeline.name.replace(/\s/g, '') + '['
							) !== -1
					) {
						return line.replace(
							/\[(.?|.+?)\]/g,
							`[${props.pipeline.maturity1}, ${_mapHelper.xToMaturity(
								moved.x,
								props.mapDimensions.width
							)}]`
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
			{/* <Movable
				id={'pipeline_' + props.pipeline.id}
				onMove={endDrag}
				x={x1()}
				y={y()}
				fixedY={true}
				fixedX={true}
			> */}

			<g transform={'translate(' + x1() + ',' + y() + ')'}>
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
					x2={x2() - x1() - 22}
					y2={12}
					strokeWidth={1}
					stroke={props.mapStyleDefs.component.stroke}
					strokeDasharray="2 2"
					markerEnd="url(#pipelineArrow)"
				/>
			</g>

			<Movable
				id={'pipeline_x1_' + props.pipeline.id}
				onMove={endDragX1}
				x={x1()}
				y={y()}
				fixedY={true}
				fixedX={false}
			>
				<circle
					id={'pipeline_circle_x1_' + props.pipeline.id}
					cx="10"
					cy="12"
					strokeWidth={props.mapStyleDefs.component.strokeWidth}
					r={props.mapStyleDefs.component.radius}
					stroke={props.mapStyleDefs.component.stroke}
					fill={props.mapStyleDefs.component.fill}
				/>
			</Movable>

			<Movable
				id={'pipeline_x2_' + props.pipeline.id}
				onMove={endDragX2}
				x={x2()}
				y={y()}
				fixedY={true}
				fixedX={false}
			>
				<circle
					id={'pipeline_circle_x2_' + props.pipeline.id}
					cx={'-10'}
					cy="12"
					strokeWidth={props.mapStyleDefs.component.strokeWidth}
					r={props.mapStyleDefs.component.radius}
					stroke={props.mapStyleDefs.component.stroke}
					fill={props.mapStyleDefs.component.fill}
				/>
			</Movable>
			{/* </Movable> */}
		</>
	);
}

export default Pipeline;
