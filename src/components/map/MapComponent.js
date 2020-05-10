import React from 'react';
import ComponentText from './ComponentText';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import Inertia from './Inertia';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { ExistingSingleCoordMatcher } from './positionUpdaters/ExistingSingleCoordMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';

function MapComponent(props) {
	const positionCalc = new PositionCalculator();
	const x = () =>
		positionCalc.maturityToX(props.element.maturity, props.mapDimensions.width);
	const y = () =>
		positionCalc.visibilityToY(
			props.element.visibility,
			props.mapDimensions.height
		);

	const notEvolvedNoLabelMatcher = {
		matcher: (line, identifier, type) => {
			return (
				props.element.evolved == undefined &&
				ExistingCoordsMatcher.matcher(line, identifier, type) &&
				!ExistingCoordsMatcher.matcher(line, '', 'label')
			);
		},
		action: (line, moved) => {
			return ExistingCoordsMatcher.action(line, moved);
		},
	};

	const notEvolvedWithLabelMatcher = {
		matcher: (line, identifier, type) => {
			return (
				props.element.evolved == undefined &&
				ExistingCoordsMatcher.matcher(line, identifier, type) &&
				ExistingCoordsMatcher.matcher(line, '', 'label')
			);
		},
		action: (line, moved) => {
			const parts = line.split('label');
			const newPart = ExistingCoordsMatcher.action(parts[0], moved);
			return newPart + 'label' + parts[1];
		},
	};

	const evolvedMatcher = {
		matcher: (line, identifier) => {
			return (
				props.element.evolved &&
				ExistingSingleCoordMatcher.matcher(line, identifier, 'evolve')
			);
		},
		action: (line, moved) => {
			return ExistingSingleCoordMatcher.action(line, moved);
		},
	};

	const positionUpdater = new DefaultPositionUpdater(
		'component',
		props.mapText,
		props.mutateMapText,
		[
			notEvolvedNoLabelMatcher,
			notEvolvedWithLabelMatcher,
			evolvedMatcher,
			NotDefinedCoordsMatcher,
		]
	);

	function endDrag(moved) {
		const visibility = positionCalc.yToVisibility(
			moved.y,
			props.mapDimensions.height
		);
		const maturity = positionCalc.xToMaturity(
			moved.x,
			props.mapDimensions.width
		);
		positionUpdater.update(
			{ param1: visibility, param2: maturity },
			props.element.name
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
						onClick={() => props.setHighlightLine(props.element.line)}
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
						onClick={() => props.setHighlightLine(props.element.line)}
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
