import React, { useState } from 'react';
import MapCanvas from './MapCanvas';
import CanvasSpeedDial from './CanvasSpeedDial';
import { featureSwitches } from '../../constants/featureswitches';
import ReactDOMServer from 'react-dom/server';

export default function MapView(props) {
	const [quickAddCursor, setQuickAddCursor] = useState('default');
	const [quickAddTemplate, setQuickAddTemplate] = useState(
		() => () => console.log('nullTemplate')
	);
	const [quickAddInProgress, setQuickAddInProgress] = useState(false);

	const fill = {
		wardley: 'url(#wardleyGradient)',
		colour: 'none',
		plain: 'none',
		handwritten: 'none',
		dark: '#353347',
	};

	const setQuickAdd = (quickAdd) => {
		setQuickAddInProgress(true);
		const i = svgToBase64Url(
			ReactDOMServer.renderToString(quickAdd.cursor),
			15,
			15
		);
		console.log('MapView::setQuickAdd::icon', i);
		setQuickAddCursor(i + ' 8 8, auto');
		setQuickAddTemplate(() => () => quickAdd.template);
	};

	function svgToBase64Url(svgString, width, height) {
		console.log(svgString);
		const base64SVG = btoa(
			`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${width}px" height="${height}px">${svgString}</svg>`
		);
		return `url('data:image/svg+xml;base64,${base64SVG}')`;
	}

	const handleMapCanvasClick = (pos) => {
		if (featureSwitches.enableQuickAdd == false) return;
		console.log('MapView::handleMapCanvasClick', pos);
		if (quickAddInProgress) {
			console.log(
				'MapView::handleMapCanvasClick::quickAddTemplate',
				quickAddTemplate
			);
			const componentString = quickAddTemplate()('text', pos.y, pos.x);
			props.mutateMapText(props.mapText + `\r\n${componentString}`);
			setQuickAddInProgress(false);
			setQuickAddCursor('default');
		}
	};

	return (
		<>
			<div
				ref={props.mapRef}
				className={props.mapStyleDefs.className}
				style={{
					background: fill[props.mapStyleDefs.className],
					position: 'relative',
					cursor: quickAddCursor,
				}}
			>
				{featureSwitches.enableQuickAdd && (
					<CanvasSpeedDial setQuickAdd={setQuickAdd} {...props} />
				)}
				<div id="map">
					<MapCanvas handleMapCanvasClick={handleMapCanvasClick} {...props} />
				</div>
			</div>
		</>
	);
}
