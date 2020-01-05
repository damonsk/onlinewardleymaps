import React, { useEffect } from 'react';
import MapPositionCalculator from '../../MapPositionCalculator';
import AnnotationText from './AnnotationText';

function AnnotationElement(props) {
	var _mapHelper = new MapPositionCalculator();
	const x = () =>
		_mapHelper.maturityToX(
			props.position.maturity,
			props.mapDimensions.width
		);
	const y = () =>
		_mapHelper.visibilityToY(
			props.position.visibility,
			props.mapDimensions.height
		);
	const [position, setPosition] = React.useState({
		x: x(),
		y: y(),
		coords: {},
	});

	const handleMouseMove = React.useRef(e => {
		setPosition(position => {
			const xDiff = position.coords.x - e.pageX;
			const yDiff = position.coords.y - e.pageY;
			return {
				x: position.x - xDiff,
				y: position.y - yDiff,
				coords: {
					x: e.pageX,
					y: e.pageY,
				},
			};
		});
	});

	const handleMouseDown = e => {
		const pageX = e.pageX;
		const pageY = e.pageY;

		setPosition(position =>
			Object.assign({}, position, {
				coords: {
					x: pageX,
					y: pageY,
				},
			})
		);
		document.addEventListener('mousemove', handleMouseMove.current);
	};

	const handleMouseUp = () => {
		document.removeEventListener('mousemove', handleMouseMove.current);
		setPosition(position =>
			Object.assign({}, position, {
				coords: {},
			})
		);
		endDrag();
	};

	function endDrag() {
		if(props.mapText.indexOf('annotations ') > -1){
			props.mutateMapText(	
				props.mapText
					.split('\n')
					.map(line => {
						if (
							line
								.replace(/\s/g, '')
								.indexOf(
									'annotations'
								) !== -1
						) {
							return line.replace(
								/\[(.+?)\]/g,
								`[${_mapHelper.yToVisibility(position.y, props.mapDimensions.height)}, ${_mapHelper.xToMaturity(position.x, props.mapDimensions.width)}]`
							);
						} else {
							return line;
						}
					})
					.join('\n')
			);		
		}
		else {
			props.mutateMapText(props.mapText + '\n' + 'annotations ['+ _mapHelper.yToVisibility(position.y, props.mapDimensions.height) + ', '+_mapHelper.xToMaturity(position.x, props.mapDimensions.width)+']');
		}
	}

	var redraw = function(){
		var elem = document.getElementById('annotationsBoxWrap'); 
		if(elem != undefined) elem.parentNode.removeChild(elem);
		
		var ctx = document.getElementById("annotationsBox"),
		SVGRect = ctx.getBBox();
		var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		rect.setAttribute("x", (SVGRect.x - 2));
		rect.setAttribute('id', 'annotationsBoxWrap');
		rect.setAttribute("y", (SVGRect.y - 2));
		rect.setAttribute('class', 'draggable');
		rect.setAttribute("width", (SVGRect.width + 4));
		rect.setAttribute("height", (SVGRect.height + 4));
		rect.setAttribute("stroke", props.mapStyleDefs.annotations.boxStroke);
		rect.setAttribute("stroke-width", props.mapStyleDefs.annotations.boxStrokeWidth);
		rect.setAttribute("fill", props.mapStyleDefs.annotations.boxFill);
		ctx.insertBefore(rect, document.getElementById('annotationsBoxTextContainer'));
	}

	useEffect(() => {
		setPosition(
			{
				x: x(),
				y: y(),
				coords: {},
			}
		);
		redraw();
	}, [props.position.maturity, props.position.visibility, props.mapDimensions, props.mapStyle, props.mapStyleDefs]);

	useEffect(()=> {
		redraw();
	}, [props.annotations])

	return (
		<>
		<g
			id={'annotationsBox'} 
			transform={'translate (' + position.x + ',' + position.y + ')'}
			onMouseDown={e => handleMouseDown(e)}
			onMouseUp={e => handleMouseUp(e)}
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
					return <AnnotationText annotation={a} key={i} parentIndex={i} mapStyleDefs={props.mapStyleDefs} />
				})}
			</text>
		</g>
	</>
	);
}

export default AnnotationElement;
