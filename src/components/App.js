import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import Usage from './editor/Usage';
import Controls from './editor/Controls';
import Breadcrumb from './editor/Breadcrumb';
import MapView from './map/MapView';
import Meta from './editor/Meta';
import Editor from './editor/Editor';
import Convert from '../convert';
import * as MapStyles from '../constants/mapstyles';
import * as Defaults from '../constants/defaults';

function App() {
	const OPERATING_MODE = 'browser';
	const [currentUrl, setCurrentUrl] = useState('');
	const [metaText, setMetaText] = useState('');
	const [mapText, setMapText] = useState('');
	const [mapTitle, setMapTitle] = useState('Untitled Map');
	const [mapComponents, setMapComponents] = useState([]);
	const [mapAnchors, setMapAnchors] = useState([]);
	const [mapLinks, setMapLinks] = useState([]);
	const [mapAnnotations, setMapAnnotations] = useState([]);
	const [mapMethods, setMapMethods] = useState([]);
	const [invalid, setInvalid] = useState(false);
	const [mapAnnotationsPresentation, setMapAnnotationsPresentation] = useState(
		[]
	);

	const [mapDimensions, setMapDimensions] = useState(Defaults.MapDimensions);
	const [mapEvolutionStates, setMapEvolutionStates] = useState(
		Defaults.EvolutionStages
	);
	const [mapStyle, setMapStyle] = useState('plain');
	const [mapYAxis, setMapYAxis] = useState({});
	const [mapStyleDefs, setMapStyleDefs] = useState(MapStyles.Plain);
	const [saveOutstanding, setSaveOutstanding] = useState(false);
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
	};

	const saveToRemoteStorage = function(hash) {
		fetch(Defaults.ApiEndpoint + 'save', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
			body: JSON.stringify({ id: hash, text: mapText, meta: metaText }),
		})
			.then(resp => resp.json())
			.then(data => {
				window.location.hash = '#' + data.id;
				setCurrentUrl(window.location.href);
				setSaveOutstanding(false);
			})
			.catch(function(error) {
				console.log('Request failed', error);
				setCurrentUrl('(could not save map, please try again)');
			});
	};

	const loadFromRemoteStorage = function() {
		if (window.location.hash.length > 0) {
			var mapId = window.location.hash.replace('#', '');

			if (window.location.hash.indexOf('#clone:') == 0)
				mapId = window.location.hash.replace('#clone:', '');

			setCurrentUrl('(loading...)');
			var fetchUrl = Defaults.ApiEndpoint + 'fetch?id=' + mapId;

			fetch(fetchUrl)
				.then(resp => resp.json())
				.then(d => {
					if (d.meta == undefined || d.meta == null) {
						d.meta = '';
					}
					setSaveOutstanding(false);
					setMapText(d.text);
					setMetaText(d.meta);
					setCurrentUrl(window.location.href);
					if (window.location.hash.indexOf('#clone:') == 0) {
						setCurrentUrl('(unsaved)');
						window.location.hash = '';
					}
				});
		}
	};

	function debounce(fn, ms) {
		let timer;
		return () => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				timer = null;
				fn.apply(this, arguments);
			}, ms);
		};
	}

	function newMap() {
		window.location.hash = '';
		setMapText('');
		setMetaText('');
		setCurrentUrl('(unsaved)');
		setSaveOutstanding(false);
	}

	function saveMap() {
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

	React.useEffect(() => {
		try {
			setInvalid(false);
			var r = new Convert().parse(mapText);
			setMapTitle(r.title);
			setMapAnnotations(r.annotations);
			setMapAnchors(r.anchors);
			setMapComponents(r.elements);
			setMapLinks(r.links);
			setMapMethods(r.methods);
			setMapStyle(r.presentation.style);
			setMapYAxis(r.presentation.yAxis);
			setMapAnnotationsPresentation(r.presentation.annotations);
			setMapEvolutionStates({
				genesis: { l1: r.evolution[0].line1, l2: r.evolution[0].line2 },
				custom: { l1: r.evolution[1].line1, l2: r.evolution[1].line2 },
				product: { l1: r.evolution[2].line1, l2: r.evolution[2].line2 },
				commodity: { l1: r.evolution[3].line1, l2: r.evolution[3].line2 },
			});
		} catch (err) {
			setInvalid(true);
			console.log('Invalid markup, could not render.');
		}
	}, [mapText]);

	React.useEffect(() => {
		document.title = mapTitle + ' - ' + Defaults.PageTitle;
	}, [mapTitle]);

	React.useEffect(() => {
		switch (mapStyle) {
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
	}, [mapStyle]);

	React.useEffect(() => {
		const debouncedHandleResize = debounce(() => {
			setMapDimensions({ width: getWidth(), height: getHeight() });
		}, 1000);

		const initialLoad = () => {
			loadFromRemoteStorage();
			setMapDimensions({ width: getWidth(), height: getHeight() });
		};

		window.addEventListener('resize', debouncedHandleResize);
		window.addEventListener('load', initialLoad);

		return function cleanup() {
			window.removeEventListener('resize', debouncedHandleResize);
			window.removeEventListener('load', initialLoad);
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
								currentUrl={currentUrl}
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
			{/* <div className="container-fluid"> */}
			<div className="row no-gutters">
				<div className="col-sm h-100 editor">
					<Editor
						operatingMode={OPERATING_MODE}
						mapText={mapText}
						invalid={invalid}
						mutateMapText={mutateMapText}
						mapComponents={mapComponents}
						mapAnchors={mapAnchors}
						mapDimensions={mapDimensions}
					/>
					<div className="form-group">
						<Meta metaText={metaText} />
					</div>
				</div>

				<div className="col-md-8 map-view">
					<MapView
						mapTitle={mapTitle}
						mapComponents={mapComponents}
						mapAnchors={mapAnchors}
						mapLinks={mapLinks}
						mapAnnotations={mapAnnotations}
						mapAnnotationsPresentation={mapAnnotationsPresentation}
						mapMethods={mapMethods}
						mapStyleDefs={mapStyleDefs}
						mapYAxis={mapYAxis}
						mapDimensions={mapDimensions}
						mapEvolutionStates={mapEvolutionStates}
						mapRef={mapRef}
						mapText={mapText}
						mutateMapText={mutateMapText}
						setMetaText={setMetaText}
						metaText={metaText}
						evolutionOffsets={Defaults.EvoOffsets}
					/>
				</div>
			</div>
			<div className="row usage no-gutters">
				<div className="col">
					<Usage mapText={mapText} mutateMapText={mutateMapText} />
				</div>
			</div>
			{/* </div> */}
			<footer className="bd-footer text-muted">
				<div className="container-fluid p-3 p-md-5">
					<p>
						Developed by{' '}
						<a
							href="https://twitter.com/damonsk"
							target="_blank" //eslint-disable-line react/jsx-no-target-blank
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
