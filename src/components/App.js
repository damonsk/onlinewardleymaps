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
							<h3>Online Wardley Maps</h3>
							<a
								target="_blank"
								rel="noopener noreferrer"
								href="https://marketplace.visualstudio.com/items?itemName=damonsk.vscode-wardley-maps"
							>
								<img
									alt="Download Visual Studio Code Extension"
									src="https://img.shields.io/visual-studio-marketplace/v/damonsk.vscode-wardley-maps?style=flat&amp;label=Download Visual%20Studio%20Code%20Extension&amp;logo=visual-studio-code"
								/>
							</a>
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
			<div className="row usage no-gutters">
				<div className="col">
					<Usage mapText={mapText} mutateMapText={mutateMapText} />
				</div>
			</div>
			{/* </div> */}
			<footer className="bd-footer text-muted">
				<div className="container-fluid p-3 p-md-5">
					<p>
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://marketplace.visualstudio.com/items?itemName=damonsk.vscode-wardley-maps"
						>
							<img
								alt="Download Visual Studio Code Extension"
								src="https://img.shields.io/visual-studio-marketplace/v/damonsk.vscode-wardley-maps?style=flat&amp;label=Download Visual%20Studio%20Code%20Extension&amp;logo=visual-studio-code"
							/>
						</a>
					</p>
					<p>
						<a
							href="https://github.com/damonsk/onlinewardleymaps"
							target="_blank" //eslint-disable-line react/jsx-no-target-blank
							rel="noopener"
						>
							<svg
								className="gh-icon"
								height="24"
								viewBox="0 0 19 19"
								version="1.1"
								width="24"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
								></path>
							</svg>{' '}
							https://github.com/damonsk/onlinewardleymaps
						</a>
					</p>
					<p>
						<a
							href="https://twitter.com/owardleymaps"
							target="_blank" //eslint-disable-line react/jsx-no-target-blank
							rel="noopener"
						>
							<svg
								className="gh-icon"
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
							>
								<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
							</svg>{' '}
							@owardleymaps
						</a>
					</p>
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
				</div>
			</footer>

			<MigrationsModal mutateMapText={mutateMapText} migrations={migrations} />
		</React.Fragment>
	);
}

export default hot(App);
