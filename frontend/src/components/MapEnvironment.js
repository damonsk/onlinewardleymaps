import * as MapStyles from '../constants/mapstyles';
import * as Defaults from '../constants/defaults';
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import MapView from './map/MapView';
import Editor from './editor/Editor';
import Breadcrumb from './editor/Breadcrumb';
import Converter from '../conversion/Converter';
import { ModKeyPressedProvider } from './KeyPressContext';
import QuickAdd from './actions/QuickAdd';
import NewHeader from './page/NewHeader';
import LeftNavigation from './page/LeftNavigation';
import NewMapIterations from './editor/MapIterations';
import UsageInfo from './page/UseageInfo';
import { SaveMap } from '../repository/SaveMap';
import { LoadMap } from '../repository/LoadMap';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, Grid } from '@mui/material';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import Router from 'next/router';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useFeatureSwitches } from './FeatureSwitchesContext';

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
	const winHeight = window.innerHeight;
	const topNavHeight = document.getElementById('top-nav-wrapper').clientHeight;
	return winHeight - topNavHeight - 60;
};
const getWidth = () => {
	return document.getElementById('map').clientWidth - 15;
};

const getWidthForMap = (mapOnlyView) => {
	return getWidth() + (mapOnlyView ? 130 : 60);
};

function Environment(props) {
	const featureSwitches = useFeatureSwitches();
	const {
		toggleMenu,
		menuVisible,
		toggleTheme,
		isLightTheme,
		mapPersistenceStrategy,
		setMapPersistenceStrategy,
		shouldLoad,
		currentId,
		setCurrentId,
		setShoudLoad,
	} = props;

	const mapRef = useRef(null);

	const [currentUrl, setCurrentUrl] = useState('');
	const [showUsage, setShowUsage] = useState(false);
	const [metaText, setMetaText] = useState('');
	const [mapText, setMapText] = useState('');
	const [mapTitle, setMapTitle] = useState('Untitled Map');
	const [rawMapTitle, setRawMapTitle] = useState('Untitled Map');
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
	const [mapAccelerators, setMapAccelerators] = useState([]);
	const [mapMethods, setMapMethods] = useState([]);
	const [invalid, setInvalid] = useState(false);
	const [newComponentContext, setNewComponentContext] = useState(null);
	const [mapAnnotationsPresentation, setMapAnnotationsPresentation] = useState(
		[]
	);
	const [mapIterations, setMapIterations] = useState([]);
	const [mapDimensions, setMapDimensions] = useState(Defaults.MapDimensions);
	const [mapCanvasDimensions, setMapCanvasDimensions] = useState(
		Defaults.MapDimensions
	);
	const [mapEvolutionStates, setMapEvolutionStates] = useState(
		Defaults.EvolutionStages
	);
	const [mapStyle, setMapStyle] = useState('plain');
	const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
	const [mapStyleDefs, setMapStyleDefs] = useState(MapStyles.Plain);
	const [saveOutstanding, setSaveOutstanding] = useState(false);
	const [highlightLine, setHighlightLine] = useState(0);

	const [errorLine, setErrorLine] = useState(-1);
	const [showLineNumbers, setShowLineNumbers] = useState(false);
	const [showLinkedEvolved, setShowLinkedEvolved] = useState(false);
	const [mapOnlyView, setMapOnlyView] = useState(false);
	const [currentIteration, setCurrentIteration] = useState(-1);
	const [actionInProgress, setActionInProgress] = useState(false);
	const [hideNav, setHideNav] = useState(false);

	const mutateMapText = (newText) => {
		setMapText(newText);
		setSaveOutstanding(true);
		if (currentIteration !== null && currentIteration > -1) {
			const newList = [...mapIterations];
			const item = newList[currentIteration];
			item.mapText = newText;
			newList.splice(currentIteration, 1);
			newList.splice(currentIteration, 0, item);
			setMapIterations(newList);
		}
	};

	const launchUrl = (urlId) => {
		if (mapUrls.find((u) => u.name === urlId)) {
			const urlToLaunch = mapUrls.find((u) => u.name === urlId).url;
			window.open(urlToLaunch);
		}
	};

	const toggleUsage = () => {
		setShowUsage(!showUsage);
	};

	const saveToRemoteStorage = async function (hash) {
		setActionInProgress(true);
		const mapToPersist = {
			mapText: mapText,
			name: mapTitle,
			imageData: '',
			mapIterations: mapIterations,
		};

		const followOnActions = async function (id, resultFromAction) {
			if (currentId === '') {
				console.log('[followOnActions::switch]', {
					mapPersistenceStrategy,
					currentId,
					id,
				});
				switch (mapPersistenceStrategy) {
					case Defaults.MapPersistenceStrategy.Private:
						Router.push('/private' + '/' + id, undefined, {
							shallow: true,
						});
						break;
					case Defaults.MapPersistenceStrategy.Legacy:
						window.location.hash = '#' + id;
						break;
					case Defaults.MapPersistenceStrategy.Public:
						window.location.hash = '#public:' + id;
						break;
					default:
					case Defaults.MapPersistenceStrategy.PublicUnauthenticated:
						Router.push('/public' + '/' + id, undefined, {
							shallow: true,
						});
						break;
				}
			}

			setCurrentId(id);
			setActionInProgress(false);
			setCurrentUrl(window.location.href);
			setSaveOutstanding(false);

			console.log('saveToPrivateDataStore', {
				mapPersistenceStrategy,
				resultFromAction,
			});
		};

		await SaveMap(mapPersistenceStrategy, mapToPersist, hash, followOnActions);
	};

	const loadFromRemoteStorage = async function () {
		const followOnActions = (mapPersistenceStrategy, map) => {
			setMapPersistenceStrategy(mapPersistenceStrategy);
			setShoudLoad(false);
			setMapText(map.mapText);
			if (map.mapIterations && map.mapIterations.length > 0) {
				setMapIterations(map.mapIterations);
				setCurrentIteration(0);
				setMapText(map.mapIterations[0].mapText);
			}
			setCurrentUrl(window.location.href);

			if (window.location.hash.indexOf('#clone:') === 0) {
				setCurrentUrl('(unsaved)');
				setSaveOutstanding(true);
				setCurrentId('');
				window.location.hash = '';
			}

			setSaveOutstanding(false);
			setActionInProgress(false);

			switch (mapPersistenceStrategy) {
				case Defaults.MapPersistenceStrategy.Legacy:
					break;
				default:
					setMapPersistenceStrategy(mapPersistenceStrategy);
					break;
			}
		};

		setActionInProgress(true);
		setCurrentUrl('(loading...)');
		console.log('--- Set Load Strategy: ', mapPersistenceStrategy);
		await LoadMap(mapPersistenceStrategy, followOnActions, currentId);
	};

	function newMap(mapPersistenceStrategy) {
		setMapText('');
		setMetaText('');
		setCurrentId('');
		setCurrentUrl('(unsaved)');
		setSaveOutstanding(false);
		setCurrentIteration(-1);
		setMapIterations([]);

		setMapPersistenceStrategy(mapPersistenceStrategy);
		Router.push({ pathname: '/' }, undefined, { shallow: true });
	}

	async function saveMap() {
		setCurrentUrl('(saving...)');
		saveToRemoteStorage(currentId);
	}

	function downloadMap() {
		const svgMapText = mapRef.current.getElementsByTagName('svg')[0].outerHTML;
		const tempElement = document.createElement('div');
		tempElement.innerHTML = svgMapText;
		tempElement.style.position = 'absolute';
		tempElement.style.left = '-9999px';
		document.body.appendChild(tempElement);
		html2canvas(tempElement, { useCORS: true, allowTaint: true })
			.then((canvas) => {
				const base64image = canvas.toDataURL('image/png');
				const link = document.createElement('a');
				link.download = mapTitle;
				link.href = base64image;
				link.click();
				tempElement.remove();
			})
			.catch((x) => {
				console.log(x);
				tempElement.remove();
			});
	}

	function downloadMapAsSVG() {
		const svgMapText = mapRef.current
			.getElementsByTagName('svg')[0]
			.outerHTML.replace(/&nbsp;/g, ' ')
			.replace(/<svg([^>]*)>/, '<svg xmlns="http://www.w3.org/2000/svg"$1>');
		saveMapText(
			`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">${svgMapText}`,
			`${mapTitle}.svg`
		);
	}

	const addIteration = () => {
		const iterations = [...mapIterations];
		iterations.push({
			name: `Iteration ${iterations.length + 1}`,
			mapText: mapText,
		});
		setMapIterations(iterations);
	};

	const saveMapText = (data, fileName) => {
		var a = document.createElement('a');
		document.body.appendChild(a);
		a.style = 'display: none';
		var blob = new Blob([data], { type: 'data:attachment/xml' }),
			url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = fileName;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	useEffect(() => {
		const handleBeforeUnload = (event) => {
			if (saveOutstanding) {
				event.preventDefault();
				event.returnValue = '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
	});

	useEffect(() => {
		try {
			setErrorLine([]);
			setInvalid(false);
			var r = new Converter(featureSwitches).parse(mapText);
			setRawMapTitle(r.title);
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
			setMapSize(r.presentation.size);
			setMapAccelerators(r.accelerators);
			setMapAnnotationsPresentation(r.presentation.annotations);
			setMapEvolutionStates({
				genesis: { l1: r.evolution[0].line1, l2: r.evolution[0].line2 },
				custom: { l1: r.evolution[1].line1, l2: r.evolution[1].line2 },
				product: { l1: r.evolution[2].line1, l2: r.evolution[2].line2 },
				commodity: { l1: r.evolution[3].line1, l2: r.evolution[3].line2 },
			});
			if (r.errors.length > 0) {
				setErrorLine(r.errors.map((e) => e.line));
			}
		} catch (err) {
			console.log(`Error:`, err);
		}
	}, [mapText]);

	useEffect(() => {
		document.title = mapTitle + ' - ' + Defaults.PageTitle;
	}, [mapTitle]);
	useEffect(() => {
		setMapDimensions({
			width: mapSize.width > 0 ? mapSize.width : getWidthForMap(mapOnlyView),
			height: mapSize.height > 0 ? mapSize.height : getHeight(),
		});
	}, [mapOnlyView, hideNav, mapSize]);

	useEffect(() => {
		console.log('[currentIteration, rawMapTitle, mapIterations]', [
			currentIteration,
			rawMapTitle,
			mapIterations,
		]);
		if (currentIteration > -1) {
			setMapTitle(
				rawMapTitle + ' [' + mapIterations[currentIteration].name + ']'
			);
		} else {
			setMapTitle(rawMapTitle);
		}
	}, [currentIteration, rawMapTitle, mapIterations]);

	useEffect(() => {
		switch (mapStyle) {
			case 'colour':
			case 'color':
				setMapStyleDefs(MapStyles.Colour);
				break;
			case 'wardley':
				setMapStyleDefs(MapStyles.Wardley);
				break;
			case 'dark':
				setMapStyleDefs(MapStyles.Dark);
				break;
			case 'handwritten':
				setMapStyleDefs(MapStyles.Handwritten);
				break;
			default:
				setMapStyleDefs(MapStyles.Plain);
		}
	}, [mapStyle]);

	useEffect(() => {
		if (shouldLoad) loadFromRemoteStorage();
	}, [shouldLoad]);

	useEffect(() => {
		const debouncedHandleResize = debounce(() => {
			const dimensions = {
				width: mapSize.width > 0 ? mapSize.width : getWidthForMap(mapOnlyView),
				height: mapSize.height > 0 ? mapSize.height : getHeight(),
			};
			setMapDimensions(dimensions);
		}, 1);

		window.addEventListener('resize', debouncedHandleResize);
		debouncedHandleResize();

		return function cleanup() {
			window.removeEventListener('resize', debouncedHandleResize);
		};
	}, [mapSize, mapOnlyView]);

	useEffect(() => {
		const newDimensions = {
			width: mapSize.width > 0 ? mapSize.width : getWidthForMap(mapOnlyView),
			height: mapSize.height > 0 ? mapSize.height : getHeight(),
		};
		setMapDimensions(newDimensions);
		setMapCanvasDimensions({
			width: getWidth(),
			height: getHeight(),
		});
	}, [mapOnlyView, hideNav]);

	useEffect(() => {
		const initialLoad = () => {
			setMapCanvasDimensions({
				width: getWidth(),
				height: getHeight(),
			});
		};

		const debouncedHandleCanvasResize = debounce(() => {
			setMapCanvasDimensions({
				width: getWidth(),
				height: getHeight(),
			});
		}, 500);

		window.addEventListener('load', initialLoad);
		window.addEventListener('resize', debouncedHandleCanvasResize);

		return function cleanup() {
			window.removeEventListener('resize', debouncedHandleCanvasResize);
			window.removeEventListener('load', initialLoad);
		};
	}, []);

	const submenu = [
		{
			name: showUsage ? 'Hide Usage' : 'Show Usage',
			icon: <HelpCenterIcon />,
			action: () => toggleUsage(),
		},
	];

	const shouldHideNav = () => {
		setHideNav(!hideNav);
	};

	return (
		<React.Fragment>
			<LeftNavigation
				toggleMenu={toggleMenu}
				menuVisible={menuVisible}
				submenu={submenu}
				toggleTheme={toggleTheme}
				isLightTheme={isLightTheme}
			/>

			<Box id="top-nav-wrapper" sx={{ display: hideNav ? 'none' : 'block' }}>
				<NewHeader
					mapOnlyView={mapOnlyView}
					setMapOnlyView={setMapOnlyView}
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
					downloadMapAsSVG={downloadMapAsSVG}
					toggleMenu={toggleMenu}
				/>

				<Breadcrumb
					currentUrl={currentUrl}
					mapPersistenceStrategy={mapPersistenceStrategy}
				/>

				<NewMapIterations
					mapIterations={mapIterations}
					setMapIterations={setMapIterations}
					setMapText={setMapText}
					addIteration={addIteration}
					currentIteration={currentIteration}
					setCurrentIteration={setCurrentIteration}
				/>
			</Box>

			<Grid container spacing={2} id="main" sx={{ marginTop: 0 }}>
				{mapOnlyView === false && (
					<Grid
						item
						xs={12}
						sm={4}
						sx={{
							paddingTop: '0!important',
							borderRight: '2px solid rgba(0, 0, 0, 0.12)',
						}}
					>
						<Editor
							hideNav={hideNav}
							isLightTheme={isLightTheme}
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
					</Grid>
				)}
				<Grid
					item
					xs={12}
					sm={mapOnlyView ? 12 : 8}
					marginLeft={mapOnlyView ? 2 : 0}
					className="map-view"
					sx={{ backgroundColor: mapStyleDefs.containerBackground }}
				>
					<ModKeyPressedProvider>
						<MapView
							shouldHideNav={shouldHideNav}
							hideNav={hideNav}
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
							mapAccelerators={mapAccelerators}
							launchUrl={launchUrl}
							mapNotes={mapNotes}
							mapAnnotations={mapAnnotations}
							mapAnnotationsPresentation={mapAnnotationsPresentation}
							mapMethods={mapMethods}
							mapStyleDefs={mapStyleDefs}
							mapDimensions={mapDimensions}
							mapCanvasDimensions={mapCanvasDimensions}
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
				</Grid>
			</Grid>

			<Dialog
				maxWidth={'lg'}
				open={showUsage}
				onClose={() => setShowUsage(false)}
			>
				<DialogTitle>Usage</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Quick reference of all available map elements. You can add an
						example to your map by clicking the available links.
					</DialogContentText>
					<Box marginTop={2}>
						<UsageInfo
							mapStyleDefs={mapStyleDefs}
							mutateMapText={mutateMapText}
							mapText={mapText}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowUsage(false)}>Close</Button>
				</DialogActions>
			</Dialog>

			<QuickAdd
				newComponentContext={newComponentContext}
				mutateMapText={mutateMapText}
				setNewComponentContext={setNewComponentContext}
				mapText={mapText}
				mapStyleDefs={mapStyleDefs}
			/>

			<Backdrop
				sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
				open={actionInProgress}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
		</React.Fragment>
	);
}

export default Environment;
