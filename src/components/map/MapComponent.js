import React, { useEffect } from 'react';
import ComponentText from './ComponentText';
import MapPositionCalculator from '../../MapPositionCalculator';
var createReactClass = require('create-react-class');

function MapComponent(props) {
	var _mapHelper = new MapPositionCalculator();
	const x = () =>
		_mapHelper.maturityToX(props.element.maturity, props.mapDimensions.width);
	const y = () =>
		_mapHelper.visibilityToY(
			props.element.visibility,
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

	function endDrag(evt) {
		props.mutateMapText(
			props.mapText
				.split('\n')
				.map(line => {
					if (
						line
							.replace(/\s/g, '') //Remove all whitespace from the line in case the user has been abusive with their spaces.
							//get node name from the rendered text in the map
							.indexOf(
								'component' + props.element.name.replace(/\s/g, '') + '[' //Ensure that we are at the end of the full component name by checking for a brace
							) !== -1
					) {
						//Update the component line in map text with new coord values.
						//For evolved components, we only update the evolved value
						if (props.element.evolved) {
							return line.replace(
								//Take only the string evolve and the number that follows
								/\] evolve\s([\.0-9])+/g,
								`] evolve ${(
									(1 / props.mapDimensions.width) *
									position.x
								).toFixed(2)}`
							);
						} else {
							return line.replace(
								/\[(.+?)\]/g, //Find everything inside square braces.
								`[${1 -
									((1 / props.mapDimensions.height) * position.y).toFixed(
										2
									)}, ${((1 / props.mapDimensions.width) * position.x).toFixed(
									2
								)}]`
							);
						}
					} else {
						return line;
					}
				})
				.join('\n')
		);
	}

	useEffect(() => {
		position.x = x();
	}, [props.element.maturity]);
	useEffect(() => {
		position.y = y();
	}, [props.element.visibility]);

	useEffect(() => {
		position.y = y();
		position.x = x();
	}, [props.mapDimensions]);

	return (
		<g
			key={'element_' + props.element.id}
			className={'draggable node ' + (props.element.evolved ? 'evolved' : '')}
			id={'element_' + props.element.id}
			transform={
				'translate(' +
				position.x +
				',' +
				(props.element.evolved ? y() : position.y) +
				')'
			}
		>
			<circle
				id={'element_circle_' + props.element.id}
				onMouseDown={e => handleMouseDown(e)}
				onMouseUp={e => handleMouseUp(e)}
				cx="0"
				cy="0"
				r="5"
				stroke={props.element.evolved ? 'red' : 'black'}
				fill="white"
			/>

			<ComponentText
				element={props.element}
				mapText={props.mapText}
				mutateMapText={props.mutateMapText}
				setMetaText={props.setMetaText}
				metaText={props.metaText}
			/>
		</g>
	);
}

export default MapComponent;
