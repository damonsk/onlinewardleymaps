import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
} from '@mui/material';
import html2canvas from 'html2canvas';
import Router from 'next/router';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import * as Defaults from '../constants/defaults';
import * as MapStyles from '../constants/mapstyles';
import Converter from '../conversion/Converter';
import { UnifiedConverter } from '../conversion/UnifiedConverter';
import {
    useLegacyMapState,
    useUnifiedMapState,
} from '../hooks/useUnifiedMapState';
import { LoadMap } from '../repository/LoadMap';
import { MapIteration, OwnApiWardleyMap } from '../repository/OwnApiWardleyMap';
import { SaveMap } from '../repository/SaveMap';
import { MapAnnotationsPosition, MapSize } from '../types/base';
import { useFeatureSwitches } from './FeatureSwitchesContext';
import { ModKeyPressedProvider } from './KeyPressContext';
import QuickAdd from './actions/QuickAdd';
import { Breadcrumb } from './editor/Breadcrumb';
import Editor from './editor/Editor';
import { NewMapIterations } from './editor/MapIterations';
import { MapView } from './map/MapView';
import { LeftNavigation } from './page/LeftNavigation';
import NewHeader from './page/NewHeader';
import { UsageInfo } from './page/UseageInfo';

function debounce<T extends (...args: any[]) => void>(
    fn: T,
    ms: number,
): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout | null;

    return function (this: any, ...args: Parameters<T>): void {
        clearTimeout(timer!);
        timer = setTimeout(() => {
            timer = null;
            fn.apply(this, args);
        }, ms);
    };
}

const getHeight = () => {
    const winHeight = window.innerHeight;
    const topNavHeight =
        document.getElementById('top-nav-wrapper')?.clientHeight;
    const titleHeight = document.getElementById('title')?.clientHeight;
    return winHeight - (topNavHeight || 0) - (titleHeight || 0) - 95;
};
const getWidth = () => {
    const clientWidth = document.getElementById('map')?.clientWidth;
    return (clientWidth || 0) - 50;
};

interface MapEnvironmentProps {
    toggleMenu: () => void;
    toggleTheme: () => void;
    menuVisible: boolean;
    isLightTheme: boolean;
    mapPersistenceStrategy: string;
    setMapPersistenceStrategy: React.Dispatch<React.SetStateAction<string>>;
    shouldLoad: boolean;
    setShouldLoad: React.Dispatch<React.SetStateAction<boolean>>;
    currentId: string;
    setCurrentId: React.Dispatch<React.SetStateAction<string>>;
}

const MapEnvironment: FunctionComponent<MapEnvironmentProps> = ({
    toggleMenu,
    menuVisible,
    toggleTheme,
    isLightTheme,
    mapPersistenceStrategy,
    setMapPersistenceStrategy,
    shouldLoad,
    currentId,
    setCurrentId,
    setShouldLoad,
}) => {
    const featureSwitches = useFeatureSwitches();
    const mapRef = useRef<HTMLElement | null>(null);

    // Initialize unified map state
    const unifiedMapState = useUnifiedMapState({
        mapText: '',
        showUsage: false,
        isLoading: false,
        errors: [],
        mapDimensions: Defaults.MapDimensions,
        mapCanvasDimensions: Defaults.MapDimensions,
        mapStyleDefs: MapStyles.Plain,
        mapEvolutionStates: Defaults.EvolutionStages,
        highlightedLine: 0,
        newComponentContext: null,
        showLinkedEvolved: false,
    });

    // Extract state and actions from unified state
    const { state: mapState, actions: mapActions } = unifiedMapState;

    // Extract individual values for backward compatibility using legacy hook
    const legacyState = useLegacyMapState(unifiedMapState);

    // Remaining individual state that's not part of unified state
    const [currentUrl, setCurrentUrl] = useState('');
    const [mapTitle, setMapTitle] = useState('Untitled Map');
    const [rawMapTitle, setRawMapTitle] = useState('Untitled Map');
    const [invalid, setInvalid] = useState(false);
    const [mapAnnotationsPresentation, setMapAnnotationsPresentation] =
        useState<MapAnnotationsPosition>({ maturity: 0, visibility: 0 });
    const [mapIterations, setMapIterations] = useState<MapIteration[]>([]);
    const [mapSize, setMapSize] = useState<MapSize>({ width: 0, height: 0 });
    const [mapStyle, setMapStyle] = useState('plain');
    const [saveOutstanding, setSaveOutstanding] = useState(false);
    const [errorLine, setErrorLine] = useState<number[]>([]);
    const [showLineNumbers, setShowLineNumbers] = useState(false);
    const [mapOnlyView, setMapOnlyView] = useState(false);
    const [currentIteration, setCurrentIteration] = useState(-1);
    const [actionInProgress, setActionInProgress] = useState(false);
    const [hideNav, setHideNav] = useState(false);

    // Wrapper function for setting map text that also handles iterations and save state
    const mutateMapText = (newText: string) => {
        legacyState.mutateMapText(newText);
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

    const launchUrl = (urlId: string) => {
        const mapUrl = legacyState.mapUrls.find((u) => u.name === urlId);
        if (mapUrl) {
            window.open(mapUrl.url);
        }
    };

    const toggleUsage = () => {
        mapActions.setShowUsage(!mapState.showUsage);
    };

    const saveToRemoteStorage = async function (hash: string) {
        setActionInProgress(true);
        const mapToPersist: OwnApiWardleyMap = {
            mapText: legacyState.mapText,
            imageData: '',
            mapIterations,
            readOnly: false,
        };

        const followOnActions = async function (id: string) {
            if (currentId === '') {
                console.log('[followOnActions::switch]', {
                    mapPersistenceStrategy,
                    currentId,
                    id,
                });
                switch (mapPersistenceStrategy) {
                    case Defaults.MapPersistenceStrategy.Legacy:
                        window.location.hash = '#' + id;
                        break;
                }
            }

            setCurrentId(id);
            setActionInProgress(false);
            setCurrentUrl(window.location.href);
            setSaveOutstanding(false);

            console.log('saveToPrivateDataStore', {
                mapPersistenceStrategy,
            });
        };

        await SaveMap(
            mapPersistenceStrategy,
            mapToPersist,
            hash,
            followOnActions,
        );
    };

    const loadFromRemoteStorage = async function () {
        const followOnActions = (
            mapPersistenceStrategy: string,
            map: OwnApiWardleyMap,
        ) => {
            setMapPersistenceStrategy(mapPersistenceStrategy);
            setShouldLoad(false);
            legacyState.mutateMapText(map.mapText);
            if (map.mapIterations && map.mapIterations.length > 0) {
                setMapIterations(map.mapIterations);
                setCurrentIteration(0);
                legacyState.mutateMapText(map.mapIterations[0].mapText);
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

    function newMap(mapPersistenceStrategy: string) {
        legacyState.mutateMapText('');
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
        if (mapRef.current === null) return;
        const svgMapText =
            mapRef.current.getElementsByTagName('svg')[0].outerHTML;
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
            // eslint-disable-next-line
            .catch((_) => {
                tempElement.remove();
            });
    }

    function downloadMapAsSVG() {
        if (mapRef.current === null) return;
        const svgMapText = mapRef.current
            .getElementsByTagName('svg')[0]
            .outerHTML.replace(/&nbsp;/g, ' ')
            .replace(
                /<svg([^>]*)>/,
                '<svg xmlns="http://www.w3.org/2000/svg"$1>',
            );
        saveMapText(
            `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">${svgMapText}`,
            `${mapTitle}.svg`,
        );
    }

    const addIteration = () => {
        const iterations = [...mapIterations];
        iterations.push({
            name: `Iteration ${iterations.length + 1}`,
            mapText: legacyState.mapText,
        });
        setMapIterations(iterations);
    };

    const saveMapText = (data: string, fileName: string) => {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        const blob = new Blob([data], { type: 'data:attachment/xml' });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        window.addEventListener('beforeunload', (event: BeforeUnloadEvent) => {
            if (saveOutstanding) {
                event.preventDefault();
                event.returnValue = '';
            }
        });
    });

    useEffect(() => {
        try {
            setErrorLine([]);
            setInvalid(false);
            const r = new Converter(featureSwitches).parse(legacyState.mapText);
            console.log('MapEnvironment', r);
            setRawMapTitle(r.title);
            setMapAnnotationsPresentation(r.presentation.annotations);
            setMapStyle(r.presentation.style);
            setMapSize(r.presentation.size);
            mapActions.setMapEvolutionStates({
                genesis: { l1: r.evolution[0].line1, l2: r.evolution[0].line2 },
                custom: { l1: r.evolution[1].line1, l2: r.evolution[1].line2 },
                product: { l1: r.evolution[2].line1, l2: r.evolution[2].line2 },
                commodity: {
                    l1: r.evolution[3].line1,
                    l2: r.evolution[3].line2,
                },
            });
            if (r.errors.length > 0) {
                setErrorLine(r.errors.map((e) => e.line));
            }

            // CRITICAL FIX: Also update the unified map state
            const unifiedConverter = new UnifiedConverter(featureSwitches);
            const unifiedMap = unifiedConverter.parse(legacyState.mapText);
            mapActions.setMap(unifiedMap);
        } catch (err) {
            console.log('Error:', err);
        }
    }, [legacyState.mapText, featureSwitches, mapActions]);

    useEffect(() => {
        document.title = mapTitle + ' - ' + Defaults.PageTitle;
    }, [mapTitle]);

    useEffect(() => {
        mapActions.setMapDimensions({
            width: mapSize.width > 0 ? mapSize.width : 100 + getWidth(),
            height: mapSize.height > 0 ? mapSize.height : getHeight(),
        });
    }, [mapOnlyView, hideNav, mapSize, mapActions]);

    useEffect(() => {
        if (currentIteration > -1) {
            setMapTitle(
                rawMapTitle + ' [' + mapIterations[currentIteration].name + ']',
            );
        } else {
            setMapTitle(rawMapTitle);
        }
    }, [currentIteration, rawMapTitle, mapIterations]);

    useEffect(() => {
        switch (mapStyle) {
            case 'colour':
            case 'color':
                mapActions.setMapStyleDefs(MapStyles.Colour);
                break;
            case 'wardley':
                mapActions.setMapStyleDefs(MapStyles.Wardley);
                break;
            case 'dark':
                mapActions.setMapStyleDefs(MapStyles.Dark);
                break;
            case 'handwritten':
                mapActions.setMapStyleDefs(MapStyles.Handwritten);
                break;
            default:
                mapActions.setMapStyleDefs(MapStyles.Plain);
        }
    }, [mapStyle, mapActions]);

    useEffect(() => {
        if (shouldLoad) loadFromRemoteStorage();
    }, [shouldLoad]);

    useEffect(() => {
        const debouncedHandleResize = debounce(() => {
            const dimensions = {
                width: mapSize.width > 0 ? mapSize.width : 100 + getWidth(),
                height: mapSize.height > 0 ? mapSize.height : getHeight(),
            };
            mapActions.setMapDimensions(dimensions);
        }, 1);

        window.addEventListener('resize', debouncedHandleResize);
        debouncedHandleResize();

        return function cleanup() {
            window.removeEventListener('resize', debouncedHandleResize);
        };
    }, [mapSize, mapActions]);

    useEffect(() => {
        const newDimensions = {
            width: mapSize.width > 0 ? mapSize.width : 100 + getWidth(),
            height: mapSize.height > 0 ? mapSize.height : getHeight(),
        };
        mapActions.setMapDimensions(newDimensions);
        mapActions.setMapCanvasDimensions({
            width: getWidth(),
            height: getHeight(),
        });
    }, [mapOnlyView, hideNav, mapActions]);

    useEffect(() => {
        const initialLoad = () => {
            mapActions.setMapCanvasDimensions({
                width: getWidth(),
                height: getHeight(),
            });
        };

        const debouncedHandleCanvasResize = debounce(() => {
            mapActions.setMapCanvasDimensions({
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
    }, [mapActions]);

    const submenu = [
        {
            name: mapState.showUsage ? 'Hide Usage' : 'Show Usage',
            icon: <HelpCenterIcon />,
            action: () => {
                toggleUsage();
            },
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

            <Box
                id="top-nav-wrapper"
                sx={{ display: hideNav ? 'none' : 'block' }}
            >
                <NewHeader
                    mapOnlyView={mapOnlyView}
                    setMapOnlyView={setMapOnlyView}
                    currentUrl={currentUrl}
                    saveOutstanding={saveOutstanding}
                    mutateMapText={mutateMapText}
                    newMapClick={newMap}
                    saveMapClick={saveMap}
                    downloadMapImage={downloadMap}
                    showLineNumbers={showLineNumbers}
                    setShowLineNumbers={setShowLineNumbers}
                    showLinkedEvolved={legacyState.showLinkedEvolved}
                    setShowLinkedEvolved={legacyState.setShowLinkedEvolved}
                    downloadMapAsSVG={downloadMapAsSVG}
                    toggleMenu={toggleMenu}
                />

                <Breadcrumb currentUrl={currentUrl} />

                <NewMapIterations
                    mapIterations={mapIterations}
                    currentIteration={currentIteration}
                    setMapIterations={setMapIterations}
                    setMapText={legacyState.mutateMapText}
                    addIteration={addIteration}
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
                            wardleyMap={unifiedMapState.getUnifiedMap()}
                            hideNav={hideNav}
                            isLightTheme={isLightTheme}
                            highlightLine={legacyState.highlightedLine}
                            mapText={legacyState.mapText}
                            invalid={invalid}
                            mutateMapText={mutateMapText}
                            mapDimensions={legacyState.mapDimensions}
                            errorLine={errorLine}
                            showLineNumbers={showLineNumbers}
                        />
                    </Grid>
                )}
                <Grid
                    item
                    xs={12}
                    sm={mapOnlyView ? 12 : 8}
                    ml={mapOnlyView ? 2 : 0}
                    className="map-view"
                    sx={{
                        backgroundColor:
                            legacyState.mapStyleDefs.containerBackground,
                    }}
                >
                    <ModKeyPressedProvider>
                        <MapView
                            wardleyMap={unifiedMapState.getUnifiedMap()}
                            shouldHideNav={shouldHideNav}
                            hideNav={hideNav}
                            mapTitle={mapTitle}
                            mapAnnotationsPresentation={
                                mapAnnotationsPresentation
                            }
                            mapStyleDefs={legacyState.mapStyleDefs}
                            mapCanvasDimensions={
                                legacyState.mapCanvasDimensions
                            }
                            mapDimensions={legacyState.mapDimensions}
                            mapEvolutionStates={legacyState.mapEvolutionStates}
                            mapRef={mapRef}
                            mapText={legacyState.mapText}
                            mutateMapText={mutateMapText}
                            evolutionOffsets={Defaults.EvoOffsets}
                            launchUrl={launchUrl}
                            setHighlightLine={legacyState.setHighlightLine}
                            setNewComponentContext={
                                legacyState.setNewComponentContext
                            }
                            showLinkedEvolved={legacyState.showLinkedEvolved}
                        />
                    </ModKeyPressedProvider>
                </Grid>
            </Grid>

            <Dialog
                maxWidth={'lg'}
                open={mapState.showUsage}
                onClose={() => mapActions.setShowUsage(false)}
            >
                <DialogTitle>Usage </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Quick reference of all available map elements.You can
                        add an example to your map by clicking the available
                        links.
                    </DialogContentText>
                    <Box marginTop={2}>
                        <UsageInfo
                            mapStyleDefs={legacyState.mapStyleDefs}
                            mutateMapText={mutateMapText}
                            mapText={legacyState.mapText}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => mapActions.setShowUsage(false)}>
                        {' '}
                        Close{' '}
                    </Button>
                </DialogActions>
            </Dialog>

            <QuickAdd
                newComponentContext={legacyState.newComponentContext}
                mutateMapText={mutateMapText}
                setNewComponentContext={legacyState.setNewComponentContext}
                mapText={legacyState.mapText}
                mapStyleDefs={legacyState.mapStyleDefs}
            />

            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={actionInProgress}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </React.Fragment>
    );
};

export default MapEnvironment;
