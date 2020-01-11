import React, { useState, useRef } from 'react';
import MapView from './map/MapView';
import Meta from './editor/Meta';
import Editor from './editor/Editor';
import Convert from '../convert';
import * as MapStyles from '../constants/mapstyles';
import * as Defaults from '../constants/defaults';
import { owmBuild } from '../version';
import { ipcRenderer } from 'electron';

function OfflineApp() {
	const OPERATING_MODE = 'app';
	const PAGE_TITLE = 'Offline Wardley Map - ' + owmBuild;
	const [metaText, setMetaText] = useState('');
	const [mapText, setMapText] = useState('');
	const [mapTitle, setMapTitle] = useState('Untitled Map');
	const [mapObject, setMapObject] = useState(Defaults.DefaultMapObject);
	const [mapDimensions, setMapDimensions] = useState(Defaults.MapDimensions);
	const [mapEvolutionStates, setMapEvolutionStates] = useState(
		Defaults.EvolutionStages
	);
	const [mapStyle, setMapStyle] = useState('plain');
	const [mapStyleDefs, setMapStyleDefs] = useState(MapStyles.Plain);
	const mapRef = useRef(null);

	const getHeight = () => {
		var winHeight = window.innerHeight;
		return winHeight - 105;
	};
	const getWidth = function() {
		return document.getElementById('map').clientWidth - 50;
	};

	const mutateMapText = newText => {
		setMapText(newText);
		updateMap(newText, metaText);
	};

	const updateMap = (newText, newMeta) => {
		generateMap(newText, newMeta);
	};

	const saveToRemoteStorage = function(_, ev) {
		console.log(ev);
		ipcRenderer.send('save-file', { d: mapText });
	};

	//ipcRenderer.on('save-file', () => ipcRenderer.send('save-file-content', {d: mapText}) );

	const loadFromRemoteStorage = function() {
		alert('TODO');
	};

	// function newMap() {
	// 	setMapText('');
	// 	setMetaText('');
	// 	updateMap('', '');
	// 	window.location.hash = '';
	// 	setCurrentUrl('(unsaved)');
	// }

	// function saveMap() {
	// 	setCurrentUrl('(saving...)');
	// 	saveToRemoteStorage(window.location.hash.replace('#', ''));
	// }

	// function downloadMap() {
	// 	html2canvas(mapRef.current).then(canvas => {
	// 		const base64image = canvas.toDataURL('image/png');
	// 		const link = document.createElement('a');
	// 		link.download = mapTitle;
	// 		link.href = base64image;
	// 		link.click();
	// 	});
	// }

	function generateMap(txt) {
		try {
			var r = new Convert().parse(txt);
			setMapTitle(r.title);
			document.title = r.title + ' - ' + PAGE_TITLE;
			setMapObject(r);
			setMapDimensions({ width: getWidth(), height: getHeight() });
			setMapStyle(r.presentation.style);

			switch (r.presentation.style) {
				case 'colour':
				case 'color':
					setMapStyleDefs(MapStyles.Colour);
					break;
				case 'wardley':
					setMapStyleDefs(MapStyles.Wardley);
					break;
				case 'handwritten':
					setMapStyleDefs(MapStyles.Handwritten);
					break;
				default:
					setMapStyleDefs(MapStyles.Plain);
			}

			setMapEvolutionStates({
				genesis: { l1: r.evolution[0].line1, l2: r.evolution[0].line2 },
				custom: { l1: r.evolution[1].line1, l2: r.evolution[1].line2 },
				product: { l1: r.evolution[2].line1, l2: r.evolution[2].line2 },
				commodity: { l1: r.evolution[3].line1, l2: r.evolution[3].line2 },
			});
		} catch (err) {
			console.log('Invalid markup, could not render.');
		}
	}

	React.useEffect(() => {
		ipcRenderer.on('appCommand', saveToRemoteStorage);

		window.addEventListener('resize', () =>
			setMapDimensions({ width: getWidth(), height: getHeight() })
		);
		window.addEventListener('load', loadFromRemoteStorage);

		return function cleanup() {
			ipcRenderer.removeListener('appCommand', saveToRemoteStorage);

			window.removeEventListener('resize', () =>
				setMapDimensions({ width: getWidth(), height: getHeight() })
			);
			window.removeEventListener('load', loadFromRemoteStorage);
		};
	});

	return (
		<React.Fragment>
			<div className="container-fluid app">
				<div className="row">
					<div className="col editor">
						<Editor
							operatingMode={OPERATING_MODE}
							mapText={mapText}
							mutateMapText={mutateMapText}
							mapObject={mapObject}
							mapDimensions={mapDimensions}
						/>
						<div className="form-group">
							<Meta metaText={metaText} />
						</div>
					</div>

					<MapView
						mapTitle={mapTitle}
						mapObject={mapObject}
						mapStyleDefs={mapStyleDefs}
						mapDimensions={mapDimensions}
						mapEvolutionStates={mapEvolutionStates}
						mapStyle={mapStyle}
						mapRef={mapRef}
						mapText={mapText}
						mutateMapText={mutateMapText}
						setMetaText={setMetaText}
						metaText={metaText}
						evolutionOffsets={Defaults.EvoOffsets}
					/>
				</div>
			</div>
		</React.Fragment>
	);
}

export default OfflineApp;
