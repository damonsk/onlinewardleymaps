import React from 'react';
import PositionCalculator from './PositionCalculator';
import Movable from './Movable';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';

function MapAccelerator(props) {
	const { element, mapDimensions, mapText, mutateMapText, children } = props;
	const positionCalc = new PositionCalculator();
	const x = positionCalc.maturityToX(element.maturity, mapDimensions.width);
	const y =
		positionCalc.visibilityToY(element.visibility, mapDimensions.height) +
		(element.offsetY ? element.offsetY : 0);

	const positionUpdater = new DefaultPositionUpdater(
		element.deaccelerator ? 'deaccelerator' : 'accelerator',
		mapText,
		mutateMapText,
		[NotDefinedCoordsMatcher, ExistingCoordsMatcher]
	);

	function endDrag(moved) {
		const visibility = positionCalc.yToVisibility(
			moved.y,
			mapDimensions.height
		);
		const maturity = positionCalc.xToMaturity(moved.x, mapDimensions.width);
		positionUpdater.update(
			{ param1: visibility, param2: maturity },
			element.name
		);
	}

	return (
		<>
			<Movable
				id={'accelerator_element_' + element.id}
				onMove={endDrag}
				x={x}
				y={y}
				fixedY={element.evolved}
				fixedX={false}
				shouldShowMoving={false}
				isModKeyPressed={false}
				scaleFactor={props.scaleFactor}
			>
				<>{children}</>
			</Movable>
		</>
	);
}

export default MapAccelerator;
