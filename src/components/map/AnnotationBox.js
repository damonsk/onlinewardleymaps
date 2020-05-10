import React, { useEffect } from 'react';
import PositionCalculator from './PositionCalculator';
import AnnotationText from './AnnotationText';
import Movable from './Movable';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import SingletonPositionUpdater from './positionUpdaters/SingletonPositionUpdater';

function AnnotationElement(props) {
	const positionCalc = new PositionCalculator();
	const identifier = 'annotations';

	const defaultPositionUpdater = new DefaultPositionUpdater(
		identifier,
		props.mapText,
		props.mutateMapText
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
		positionUpdater.update({ visibility, maturity }, '');
	}

	var redraw = function() {
		let elem = document.getElementById('annotationsBoxWrap');
		if (elem != undefined) elem.parentNode.removeChild(elem);

		let ctx = document.getElementById('movable_annotationsBox'),
			SVGRect = ctx.getBBox(),
			rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

		rect.setAttribute('x', SVGRect.x - 2);
		rect.setAttribute('id', 'annotationsBoxWrap');
		rect.setAttribute('y', SVGRect.y - 2);
		rect.setAttribute('class', 'draggable');
		rect.setAttribute('width', SVGRect.width + 4);
		rect.setAttribute('height', SVGRect.height + 4);
		rect.setAttribute('stroke', props.mapStyleDefs.annotations.boxStroke);
		rect.setAttribute(
			'stroke-width',
			props.mapStyleDefs.annotations.boxStrokeWidth
		);
		rect.setAttribute('fill', props.mapStyleDefs.annotations.boxFill);
		ctx.insertBefore(
			rect,
			document.getElementById('annotationsBoxTextContainer')
		);
	};

	useEffect(() => {
		redraw();
	}, [
		props.position.maturity,
		props.position.visibility,
		props.mapDimensions,
		props.mapStyleDefs,
		props.annotations,
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
			<text id={'annotationsBoxTextContainer'}>
				<tspan
					className="label draggable"
					textAnchor="start"
					dy={0}
					x={2}
					fill={props.mapStyleDefs.annotations.boxTextColour}
					textDecoration="underline"
				>
					Annotations:
				</tspan>
				{props.annotations.map((a, i) => {
					return (
						<AnnotationText
							annotation={a}
							key={i}
							parentIndex={i}
							mapStyleDefs={props.mapStyleDefs}
						/>
					);
				})}
			</text>
		</Movable>
	);
}

export default AnnotationElement;
