import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';

function Pipeline(props) {
	const positionCalc = new PositionCalculator();
	const positionUpdater = new DefaultPositionUpdater(
		'pipeline',
		props.mapText,
		props.mutateMapText,
		[ExistingCoordsMatcher, NotDefinedCoordsMatcher]
	);
	const x1 = () =>
		positionCalc.maturityToX(
			props.pipeline.maturity1,
			props.mapDimensions.width
		);
	const x2 = () =>
		positionCalc.maturityToX(
			props.pipeline.maturity2,
			props.mapDimensions.width
		);
	const y = () =>
		positionCalc.visibilityToY(
			props.pipeline.visibility,
			props.mapDimensions.height
		) + 2;

	function endDragX1(moved) {
		positionUpdater.update(
			{
				param1: positionCalc.xToMaturity(moved.x, props.mapDimensions.width),
				param2: props.pipeline.maturity2,
			},
			props.pipeline.name
		);
	}

	function endDragX2(moved) {
		positionUpdater.update(
			{
				param1: props.pipeline.maturity1,
				param2: positionCalc.xToMaturity(moved.x, props.mapDimensions.width),
			},
			props.pipeline.name
		);
	}

	return (
		<>
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
					onClick={() => props.setHighlightLine(props.pipeline.line)}
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
					onClick={() => props.setHighlightLine(props.pipeline.line)}
				/>
			</Movable>
		</>
	);
}

export default Pipeline;
