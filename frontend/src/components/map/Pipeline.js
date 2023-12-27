import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';

import PipelineBoxSymbol from '../symbols/PipelineBoxSymbol';
import ComponentSymbol from '../symbols/ComponentSymbol';

function Pipeline(props) {
	const positionCalc = new PositionCalculator();
	const positionUpdater = new DefaultPositionUpdater(
		'pipeline',
		props.mapText,
		props.mutateMapText,
		[ExistingCoordsMatcher, NotDefinedCoordsMatcher]
	);

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
	const x1 = positionCalc.maturityToX(
		props.pipeline.maturity1,
		props.mapDimensions.width
	);
	const x2 = positionCalc.maturityToX(
		props.pipeline.maturity2,
		props.mapDimensions.width
	);
	const y =
		positionCalc.visibilityToY(
			props.pipeline.visibility,
			props.mapDimensions.height
		) + 2;

	return (
		<>
			<PipelineBoxSymbol
				id={'pipeline_box_' + props.pipeline.id}
				y={y}
				x1={x1}
				x2={x2}
				styles={props.mapStyleDefs.component}
			/>
			<Movable
				id={'pipeline_x1_' + props.pipeline.id}
				onMove={endDragX1}
				x={x1}
				y={y}
				fixedY={true}
				fixedX={false}
			>
				<ComponentSymbol
					id={'pipeline_circle_x1_' + props.pipeline.id}
					cx="10"
					cy="12"
					styles={props.mapStyleDefs.component}
					onClick={() => props.setHighlightLine(props.pipeline.line)}
				/>
			</Movable>
			<Movable
				id={'pipeline_x2_' + props.pipeline.id}
				onMove={endDragX2}
				x={x2}
				y={y}
				fixedY={true}
				fixedX={false}
			>
				<ComponentSymbol
					id={'pipeline_circle_x2_' + props.pipeline.id}
					cx={'-10'}
					cy="12"
					styles={props.mapStyleDefs.component}
					onClick={() => props.setHighlightLine(props.pipeline.line)}
				/>
			</Movable>
		</>
	);
}

export default Pipeline;
