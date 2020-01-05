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
	const evoOffsets = {
		custom: 3.5,
		product: 8,
		commodity: 14,
	};

	const plainStyleDef = {
		fontFamily: 'Arial,"Helvetica Neue",Helvetica,sans-serif',
		stroke: 'black',
		evolutionSeparationStroke: 'black',
		strokeWidth: '1',
		strokeDasharray: '2,2',
		component: {
			fill: 'white',
			stroke: 'black',
			evolved: 'red',
			evolvedFill: 'white',
			strokeWidth: '1',
			radius: 5,
			textColor: 'black',
			textOffset: 8,
			evolvedTextColor: 'red',
		},
		link: {
			stroke: 'grey',
			strokeWidth: 1,
			evolvedStroke: 'red',
			evolvedStrokeWidth: 1,
			flow: '#99c5ee9e',
			flowStrokeWidth: 10,
		},
		annotations: {
			stroke: '#595959',
			strokeWidth: 2,
			fill: 'white',
			text: 'black',
			boxStroke: '#595959',
			boxStrokeWidth: 1,
			boxFill: '#FFFFFF',
			boxTextColour: 'black',
		},
	};

	const handwrittenStyleDef = {
		fontFamily: '"Gloria Hallelujah", cursive',
		stroke: 'black',
		evolutionSeparationStroke: 'black',
		strokeWidth: '1',
		strokeDasharray: '2,2',
		component: {
			fill: 'white',
			stroke: 'black',
			evolved: 'red',
			evolvedFill: 'white',
			strokeWidth: '1',
			radius: 5,
			textColor: 'black',
			textOffset: 8,
			evolvedTextColor: 'red',
		},
		link: {
			stroke: 'grey',
			strokeWidth: 1,
			evolvedStroke: 'red',
			evolvedStrokeWidth: 1,
			flow: '#99c5ee9e',
			flowStrokeWidth: 10,
		},
		annotations: {
			stroke: '#595959',
			strokeWidth: 2,
			fill: 'white',
			text: 'black',
			boxStroke: '#595959',
			boxStrokeWidth: 1,
			boxFill: '#FFFFFF',
			boxTextColour: 'black',
		},
	};

	const wardleyStyleDef = {
		fontFamily: 'Consolas, Lucida Console, monospace',
		stroke: 'black',
		evolutionSeparationStroke: '#b8b8b8',
		strokeWidth: '1',
		strokeDasharray: '2,2',
		component: {
			fill: 'white',
			stroke: 'black',
			evolved: 'red',
			evolvedFill: 'white',
			strokeWidth: '1',
			radius: 5,
			textColor: 'black',
			textOffset: 8,
			evolvedTextColor: 'red',
		},
		link: {
			stroke: 'grey',
			strokeWidth: 1,
			evolvedStroke: 'red',
			evolvedStrokeWidth: 1,
			flow: '#99c5ee9e',
			flowStrokeWidth: 10,
		},
		annotations: {
			stroke: '#595959',
			strokeWidth: 2,
			fill: 'white',
			text: 'black',
			boxStroke: '#595959',
			boxStrokeWidth: 1,
			boxFill: '#FFFFFF',
			boxTextColour: 'black',
		},
	};

	const colourStyleDef = {
		fontFamily: 'Arial,"Helvetica Neue",Helvetica,sans-serif',
		stroke: '#c23667',
		evolutionSeparationStroke: '#b8b8b8',
		strokeWidth: '3',
		strokeDasharray: '2,2',
		component: {
			fill: 'white',
			stroke: '#8cb358',
			evolved: '#ea7f5b',
			evolvedFill: 'white',
			strokeWidth: '2',
			radius: 7,
			textColor: '#486b1a',
			textOffset: 8,
			evolvedTextColor: '#ea7f5b',
		},
		link: {
			stroke: '#5c5c5c',
			strokeWidth: 1,
			evolvedStroke: '#ea7f5b',
			evolvedStrokeWidth: 1,
			flow: '#99c5ee9e',
			flowStrokeWidth: 10,
		},
		annotations: {
			stroke: '#015fa5',
			strokeWidth: 2,
			fill: '#99c5ee',
			text: 'black',
			boxStroke: '#015fa5',
			boxStrokeWidth: 2,
			boxFill: '#99c5ee',
			boxTextColour: 'black',
		},
	};

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
		genesis: { l1: 'Genesis', l2: '' },
		custom: { l1: 'Custom Built', l2: '' },
		product: { l1: 'Product', l2: '(+rental)' },
		commodity: { l1: 'Commodity', l2: '(+utility)' },
	});
	const [mapStyle, setMapStyle] = useState('plain');
	const [mapStyleDefs, setMapStyleDefs] = useState(plainStyleDef);
	const [saveOutstanding, setSaveOutstanding] = useState('false');
	const mapRef = useRef(null);

	const getHeight = () => {
		var winHeight = window.innerHeight;
		var topNavHeight = document.getElementById('top-nav-wrapper').clientHeight;
		var titleHeight = document.getElementById('title').clientHeight;
		return winHeight - topNavHeight - titleHeight - 85;
	};
	const getWidth = function() {
		return document.getElementById('map').clientWidth - 50;
	};

	const mutateMapText = newText => {
		setMapText(newText);
		setSaveOutstanding(true);
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
				setSaveOutstanding(false);
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
				setSaveOutstanding(false);
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

			switch (r.presentation.style) {
				case 'colour':
				case 'color':
					setMapStyleDefs(colourStyleDef);
					break;
				case 'wardley':
					setMapStyleDefs(wardleyStyleDef);
					break;
				case 'handwritten':
					setMapStyleDefs(handwrittenStyleDef);
					break;
				default:
					setMapStyleDefs(plainStyleDef);
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
			<div id="top-nav-wrapper">
				<nav className="navbar navbar-dark">
					<div className="container-fluid">
						<a className="navbar-brand" href="#">
							<h3>Online Wardley Maps</h3>
						</a>
						<div id="controlsMenuControl">
							<Controls
								saveOutstanding={saveOutstanding}
								setMetaText={setMetaText}
								mutateMapText={mutateMapText}
								newMapClick={newMap}
								saveMapClick={saveMap}
								downloadMapImage={downloadMap}
							/>
						</div>
					</div>
				</nav>

				<Breadcrumb currentUrl={currentUrl} />
			</div>
			<div className="container-fluid">
				<div className="row">
					<div className="col editor">
						<Editor
							mapText={mapText}
							mutateMapText={mutateMapText}
							mapObject={mapObject}
							mapDimensions={mapDimensions}
						/>
						<div className="form-group">
							<Meta metaText={metaText} />
							<Usage mapText={mapText} mutateMapText={mutateMapText} />
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
						evolutionOffsets={evoOffsets}
					/>
				</div>
			</div>
			<footer className="bd-footer text-muted">
				<div className="container-fluid p-3 p-md-5">
					<p>
						Developed by{' '}
						<a
							href="https://twitter.com/damonsk"
							target="_blank" //eslint-disable-line react/jsx-no-target-blank
							without
							rel="noopener"
						>
							@damonsk
						</a>
						.
					</p>
					<p>
						Wardley Mapping courtesy of Simon Wardley, CC BY-SA 4.0. To learn
						more, see{' '}
						<a
							target="blank"
							href="https://medium.com/wardleymaps/on-being-lost-2ef5f05eb1ec"
						>
							Simon&apos;s book
						</a>
						.
					</p>
					<p>
						Source:{' '}
						<a
							href="https://github.com/damonsk/onlinewardleymaps"
							target="_blank" //eslint-disable-line react/jsx-no-target-blank
							rel="noopener"
						>
							https://github.com/damonsk/onlinewardleymaps
						</a>
					</p>
				</div>
			</footer>
		</React.Fragment>
	);
}

export default App;
