import React, { useState, useRef } from 'react';
import { hot } from 'react-hot-loader/root';
import html2canvas from 'html2canvas';
import Usage from './editor/Usage';
import Controls from './editor/Controls';
import Subnav from './editor/Subnav';
import MapView from './map/MapView';
import Meta from './editor/Meta';
import Editor from './editor/Editor';
import Toolbar from './editor/Toolbar';
import Breadcrumb from './editor/Breadcrumb';
import Converter from '../conversion/Converter';
import Migrations from '../migrations/Migrations';
import * as MapStyles from '../constants/mapstyles';
import * as Defaults from '../constants/defaults';
import MigrationsModal from './MigrationModal';
import { Collapse } from 'react-bootstrap';
import { ModKeyPressedProvider } from './KeyPressContext';
import QuickAdd from './actions/QuickAdd';

// only use toolbar if set
const useToolbar = false;
// const isDev = process.env.NODE_ENV === 'development';

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

const getHeight = () => {
	var winHeight = window.innerHeight;
	var topNavHeight = document.getElementById('top-nav-wrapper').clientHeight;
	var titleHeight = document.getElementById('title').clientHeight;
	return winHeight - topNavHeight - titleHeight - 85;
};
const getWidth = () => {
	return document.getElementById('map').clientWidth - 50;
};

function App() {
	const [currentUrl, setCurrentUrl] = useState('');
	const [metaText, setMetaText] = useState('');
	const [mapText, setMapText] = useState('');
	const [mapTitle, setMapTitle] = useState('Untitled Map');
	const [mapComponents, setMapComponents] = useState([]);
	const [mapSubMaps, setMapSubMaps] = useState([]);
	const [mapMarkets, setMarkets] = useState([]);
	const [mapEcosystems, setEcosystems] = useState([]);
	const [mapEvolved, setMapEvolved] = useState([]);
	const [mapPipelines, setMapPipelines] = useState([]);
	const [mapAnchors, setMapAnchors] = useState([]);
	const [mapNotes, setMapNotes] = useState([]);
	const [mapUrls, setMapUrls] = useState([]);
	const [mapLinks, setMapLinks] = useState([]);
	const [mapAttitudes, setMapAttitudes] = useState([]);
	const [mapAnnotations, setMapAnnotations] = useState([]);
	const [mapMethods, setMapMethods] = useState([]);
	const [invalid, setInvalid] = useState(false);

	const [newComponentContext, setNewComponentContext] = useState(null);
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
	const [toggleToolbar, setToggleToolbar] = useState(true);

	const [highlightLine, setHighlightLine] = useState(0);
	const mapRef = useRef(null);
	const [mainViewHeight, setMainViewHeight] = useState(100);
	const [errorLine, setErrorLine] = useState(-1);
	const [showLineNumbers, setShowLineNumbers] = useState(false);
	const [showLinkedEvolved, setShowLinkedEvolved] = useState(false);

	const [migrations, setMigrations] = useState({
		original: '',
		changed: false,
		result: '',
		changeSets: [],
	});

	const [showUsage, setShowUsage] = useState(false);

	const mutateMapText = newText => {
		setMapText(newText);
		setSaveOutstanding(true);
	};

	const launchUrl = urlId => {
		if (mapUrls.find(u => u.name === urlId)) {
			const urlToLaunch = mapUrls.find(u => u.name === urlId).url;
			window.open(urlToLaunch);
		}
	};

	const saveToRemoteStorage = function(hash) {
	
	    fetch(Defaults.ApiEndpoint + 'save', {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json; charset=utf-8' },
	        body: JSON.stringify({ id: hash, text: mapText, meta: metaText }),
	    })
	    .then(resp => {
	        return resp.json();
	    })
	    .then(data => {
	        window.location.hash = '#' + data.id;
	        setCurrentUrl(window.location.href);
	        setSaveOutstanding(false);
	    })
	    .catch(function(error) {
	        setCurrentUrl('(could not save map, please try again)');
	    });
	};

	const loadFromRemoteStorage = function() {
		if (window.location.hash.length > 0) {
			var mapId = window.location.hash.replace('#', '');

			if (window.location.hash.indexOf('#clone:') === 0)
				mapId = window.location.hash.replace('#clone:', '');

			setCurrentUrl('(loading...)');
			var fetchUrl = Defaults.ApiEndpoint + 'fetch?id=' + mapId;

			fetch(fetchUrl)
				.then(resp => resp.json())
				.then(d => {
					if (d.meta === undefined || d.meta === null) {
						d.meta = '';
					}
					let mms = new Migrations(d.text).apply();
					if (mms.changed) {
						setMigrations(mms);
					}
					setSaveOutstanding(false);
					setMapText(d.text);
					setMetaText(d.meta);
					setCurrentUrl(window.location.href);
					if (window.location.hash.indexOf('#clone:') === 0) {
						setCurrentUrl('(unsaved)');
						setSaveOutstanding(true);
						window.location.hash = '';
					}
				});
		}
	};

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
			setErrorLine([]);
			setInvalid(false);
			var r = new Converter().parse(mapText);
			setMapTitle(r.title);
			setMapAnnotations(r.annotations);
			setMapAnchors(r.anchors);
			setMapNotes(r.notes);
			setMapComponents(r.elements);
			setMapSubMaps(r.submaps);
			setMarkets(r.markets);
			setEcosystems(r.ecosystems);
			setMapEvolved(r.evolved);
			setMapPipelines(r.pipelines);
			setMapLinks(r.links);
			setMapUrls(r.urls);
			setMapMethods(r.methods);
			setMapAttitudes(r.attitudes);
			setMapStyle(r.presentation.style);
			setMapYAxis(r.presentation.yAxis);
			setMapAnnotationsPresentation(r.presentation.annotations);
			setMapEvolutionStates({
				genesis: { l1: r.evolution[0].line1, l2: r.evolution[0].line2 },
				custom: { l1: r.evolution[1].line1, l2: r.evolution[1].line2 },
				product: { l1: r.evolution[2].line1, l2: r.evolution[2].line2 },
				commodity: { l1: r.evolution[3].line1, l2: r.evolution[3].line2 },
			});
			if (r.errors.length > 0) {
				setErrorLine(r.errors.map(e => e.line));
			}
		} catch (err) {
			console.log(`Error:`, err);
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
			setMainViewHeight(105 + getHeight());
		}, 1000);

		const initialLoad = () => {
			loadFromRemoteStorage();
			setMapDimensions({ width: getWidth(), height: getHeight() });
			setMainViewHeight(105 + getHeight());
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
						<span className="navbar-brand">
							<h3>Wardley Maps AI</h3>
						</span>

						<div id="controlsMenuControl">
							<Controls
								currentUrl={currentUrl}
								saveOutstanding={saveOutstanding}
								setMetaText={setMetaText}
								mutateMapText={mutateMapText}
								newMapClick={newMap}
								saveMapClick={saveMap}
								downloadMapImage={downloadMap}
								showLineNumbers={showLineNumbers}
								setShowLineNumbers={setShowLineNumbers}
								showLinkedEvolved={showLinkedEvolved}
								setShowLinkedEvolved={setShowLinkedEvolved}
							/>
						</div>
					</div>
				</nav>
				{useToolbar ? (
					<div className="navbar subnav">
						<Subnav
							currentUrl={currentUrl}
							toggleToolbar={toggleToolbar}
							setToggleToolbar={setToggleToolbar}
						/>
					</div>
				) : (
					<Breadcrumb currentUrl={currentUrl} />
				)}
			</div>
			<div
				className="row no-gutters main"
				style={{ height: mainViewHeight + 'px' }}
			>
				<div className="col-sm h-100 editor">
					<Editor
						highlightLine={highlightLine}
						mapText={mapText}
						invalid={invalid}
						mutateMapText={mutateMapText}
						mapComponents={mapComponents}
						mapAnchors={mapAnchors}
						mapDimensions={mapDimensions}
						mapMarkets={mapMarkets}
						mapSubMaps={mapSubMaps}
						errorLine={errorLine}
						showLineNumbers={showLineNumbers}
					/>
					<div className="form-group">
						<Meta metaText={metaText} />
					</div>
				</div>

				<div className="col-sm-8 map-view">
					<ModKeyPressedProvider>
						<MapView
							mapTitle={mapTitle}
							mapComponents={mapComponents}
							mapMarkets={mapMarkets}
							mapEcosystems={mapEcosystems}
							mapSubMaps={mapSubMaps}
							mapEvolved={mapEvolved}
							mapPipelines={mapPipelines}
							mapAnchors={mapAnchors}
							mapLinks={mapLinks}
							mapAttitudes={mapAttitudes}
							launchUrl={launchUrl}
							mapNotes={mapNotes}
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
							setHighlightLine={setHighlightLine}
							setNewComponentContext={setNewComponentContext}
							showLinkedEvolved={showLinkedEvolved}
						/>
					</ModKeyPressedProvider>
				</div>
				{useToolbar && (
					<Collapse in={toggleToolbar} dimension={'width'}>
						<div className="col-sm tool-bar">
							<div className="contents">
								<Toolbar
									mapText={mapText}
									mutateMapText={mutateMapText}
									mapStyleDefs={mapStyleDefs}
								/>
							</div>
						</div>
					</Collapse>
				)}
			</div>
			<QuickAdd
				newComponentContext={newComponentContext}
				mutateMapText={mutateMapText}
				setNewComponentContext={setNewComponentContext}
				mapText={mapText}
				mapStyleDefs={mapStyleDefs}
			/>
			<div className="row usageContainer no-gutters p-3 p-md-3">
				<div id="usageToggle" className="small">
					<span onClick={() => setShowUsage(!showUsage)}>
						Show Usage Instructions
					</span>
				</div>
				<br />
				{showUsage && (
					<div className="col">
						<Usage mapText={mapText} mutateMapText={mutateMapText} />
					</div>
				)}
			</div>
			{/* </div> */}
			<footer className="bd-footer text-muted">
				<div className="container-fluid p-3 p-md-3">
					<p>
						Originally developed by{' '}
						<a
							href="https://twitter.com/damonsk"
							target="_blank" //eslint-disable-line react/jsx-no-target-blank
							rel="noopener"
						>
							@damonsk
						</a>
						Modified for AI by{' '}
						<a
							href="https://twitter.com/mcraddock"
							target="_blank" //eslint-disable-line react/jsx-no-target-blank
							rel="noopener"
						>
							@mcraddock
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
				</div>
			</footer>

			<MigrationsModal mutateMapText={mutateMapText} migrations={migrations} />
		</React.Fragment>
	);
}

export default hot(App);
