import React, { useEffect, useCallback } from 'react';
import PositionCalculator from './PositionCalculator';
import AnnotationTextSymbol from '../symbols/AnnotationTextSymbol';
import Movable from './Movable';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import SingletonPositionUpdater from './positionUpdaters/SingletonPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import AnnotationBoxSymbol from '../symbols/AnnotationBoxSymbol';

function AnnotationElement(props) {
	const positionCalc = new PositionCalculator();
	const identifier = 'annotations';

	const defaultPositionUpdater = new DefaultPositionUpdater(
		identifier,
		props.mapText,
		props.mutateMapText,
		[ExistingCoordsMatcher]
	);
	const positionUpdater = new SingletonPositionUpdater(
		identifier,
		props.mapText,
		props.mutateMapText
	);
	positionUpdater.setSuccessor(defaultPositionUpdater);

	const x = () =>
		positionCalc.maturityToX(
			props.position.maturity,
			props.mapDimensions.width
		);
	const y = () =>
		positionCalc.visibilityToY(
			props.position.visibility,
			props.mapDimensions.height
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
		positionUpdater.update({ param1: visibility, param2: maturity }, '');
	}

	const redraw = useCallback(() => {
		let elem = document.getElementById('annotationsBoxWrap');
		if (elem !== null) elem.parentNode.removeChild(elem);

		let ctx = document.getElementById('movable_annotationsBox'),
			SVGRect = ctx.getBBox(),
			rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

		rect.setAttribute('x', SVGRect.x - 2);
		rect.setAttribute('id', 'annotationsBoxWrap');
		rect.setAttribute('y', SVGRect.y - 2);
		rect.setAttribute('class', 'draggable');
		rect.setAttribute('width', SVGRect.width + 4);
		rect.setAttribute('height', SVGRect.height + 4);
		rect.setAttribute('stroke', props.mapStyleDefs.annotation.boxStroke);
		rect.setAttribute(
			'stroke-width',
			props.mapStyleDefs.annotation.boxStrokeWidth
		);
		rect.setAttribute('fill', props.mapStyleDefs.annotation.boxFill);
		ctx.insertBefore(
			rect,
			document.getElementById('annotationsBoxTextContainer')
		);
	}, [props.mapStyleDefs]);

	useEffect(() => {
		redraw();
	}, [
		props.position.maturity,
		props.position.visibility,
		props.mapDimensions,
		props.mapStyleDefs,
		props.annotations,
		redraw,
	]);

	return (
		<Movable
			id={'annotationsBox'}
			onMove={endDrag}
			fixedY={false}
			fixedX={false}
			x={x()}
			y={y()}
		>
			<AnnotationBoxSymbol
				id={'annotationsBoxTextContainer'}
				dy={0}
				x={2}
				styles={props.mapStyleDefs.annotation}
			>
				{props.annotations.map((a, i) => (
					<AnnotationTextSymbol
						key={i}
						annotation={a}
						parentIndex={i}
						styles={props.mapStyleDefs.annotation}
					/>
				))}
			</AnnotationBoxSymbol>
		</Movable>
	);
}

export default AnnotationElement;
