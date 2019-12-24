import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import Usage from './editor/Usage';
import Controls from './editor/Controls';
import Breadcrumb from './editor/Breadcrumb';
import MapView from './map/MapView';
import Meta from './editor/Meta';
import Editor from './editor/Editor';
import Convert from '../convert';

function App() {
	const defaultMapObject = {
		title: '',
		elements: [],
		links: [],
		evolution: [],
		presentation: { style: 'plain' },
		methods: [],
		annotations: [],
	};

	const PAGE_TITLE =
		'OnlineWardleyMaps - Draw Wardley Maps in seconds using this free online tool';
	const apiEndpoint =
		'https://s7u91cjmdf.execute-api.eu-west-1.amazonaws.com/dev/maps/';
	let loaded = false;
	const [currentUrl, setCurrentUrl] = useState('');
	const [metaText, setMetaText] = useState('');
	const [mapText, setMapText] = useState('');
	const [mapTitle, setMapTitle] = useState('Untitled Map');
	const [mapObject, setMapObject] = useState(defaultMapObject);
	const [mapDimensions, setMapDimensions] = useState({
		width: 500,
		height: 600,
	});
	const [mapEvolutionStates, setMapEvolutionStates] = useState({
		genesis: 'Genesis',
		custom: 'Custom Built',
		product: 'Product',
		commodity: 'Commodity',
	});
	const [mapStyle, setMapStyle] = useState('plain');
	const mapRef = useRef(null);

	const getHeight = () => 600;
	const getWidth = function() {
		var textWidth = $('#htmPane').width();
		var width = $(window).width();
		var calcWidth = width - textWidth - 120;
		return calcWidth;
	};

	const mutateMapText = newText => {
		setMapText(newText);
		updateMap(newText, metaText);
	};

	const updateMap = (newText, newMeta) => {
		generateMap(newText, newMeta);
	};

	const saveToRemoteStorage = function(hash) {
		$.ajax({
			type: 'POST',
			url: apiEndpoint + 'save',
			data: JSON.stringify({ id: hash, text: mapText, meta: metaText }),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: function(data) {
				window.location.hash = '#' + data.id;
				setCurrentUrl(window.location.href);
			},
			failure: function() {
				setCurrentUrl('(could not save map, please try again)');
			},
		});
	};

	const loadFromRemoteStorage = function() {
		setCurrentUrl('(unsaved)');
		generateMap('', '');
		if ((window.location.hash.length > 0) & (loaded == false)) {
			loaded = true;
			setCurrentUrl('(loading...)');
			var fetch =
				apiEndpoint + 'fetch?id=' + window.location.hash.replace('#', '');
			$.getJSON(fetch, function(d) {
				if (d.meta == undefined || d.meta == null) {
					d.meta = '';
				}
				setMapText(d.text);
				setMetaText(d.meta);
				updateMap(d.text, d.meta);
				setCurrentUrl(window.location.href);
			});
		}
	};

	function newMap() {
		setMapText('');
		setMetaText('');
		updateMap('', '');
		window.location.hash = '';
		setCurrentUrl('(unsaved)');
	}

	function saveMap() {
		loaded = false;
		setCurrentUrl('(saving...)');
		saveToRemoteStorage(window.location.hash.replace('#', ''));
	}

	function downloadMap() {
		html2canvas(mapRef.current).then(canvas => {
			const base64image = canvas.toDataURL('image/png');
			const link = document.createElement('a');
			link.download = mapTitle;
			link.href = base64image;
			link.click();
		});
	}

	function generateMap(txt) {
		loaded = false;
		try {
			var r = new Convert().parse(txt);
			setMapTitle(r.title);
			document.title = r.title + ' - ' + PAGE_TITLE;
			setMapObject(r);
			setMapDimensions({ width: getWidth(), height: getHeight() });
			setMapStyle(r.presentation.style);
			setMapEvolutionStates({
				genesis: r.evolution[0].line1,
				custom: r.evolution[1].line1,
				product: r.evolution[2].line1,
				commodity: r.evolution[3].line1,
			});
		} catch (err) {
			console.log('Invalid markup, could not render.');
		}
	}

	React.useEffect(() => {
		window.addEventListener('resize', () =>
			setMapDimensions({ width: getWidth(), height: getHeight() })
		);
		window.addEventListener('load', loadFromRemoteStorage);

		return function cleanup() {
			window.removeEventListener('resize', () =>
				setMapDimensions({ width: getWidth(), height: getHeight() })
			);
			window.removeEventListener('load', loadFromRemoteStorage);
		};
	});

	return (
		<React.Fragment>
			<nav className="navbar navbar-dark">
				<div className="container-fluid">
					<a className="navbar-brand" href="#">
						<h3>Online Wardley Maps</h3>
					</a>
					<div id="controlsMenuControl">
						<Controls
							mutateMapText={mutateMapText}
							newMapClick={newMap}
							saveMapClick={saveMap}
							downloadMapImage={downloadMap}
						/>
					</div>
				</div>
			</nav>

			<Breadcrumb currentUrl={currentUrl} />

			<div className="container-fluid">
				<div className="row">
					<div className="col">
						<Editor mapText={mapText} mutateMapText={mutateMapText} />
						<div className="form-group">
							<Meta metaText={metaText} />
							<Usage mapText={mapText} mutateMapText={mutateMapText} />
						</div>
					</div>

					<MapView
						mapTitle={mapTitle}
						mapObject={mapObject}
						mapDimensions={mapDimensions}
						mapEvolutionStates={mapEvolutionStates}
						mapStyle={mapStyle}
						mapRef={mapRef}
						mapText={mapText}
						mutateMapText={mutateMapText}
						setMetaText={setMetaText}
						metaText={metaText}
					/>
				</div>
			</div>
		</React.Fragment>
	);
}

export default App;
