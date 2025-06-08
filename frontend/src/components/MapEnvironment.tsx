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
import { ResizableSplitPane } from './common/ResizableSplitPane';

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
    const mapElement = document.getElementById('map');
    const clientHeight = mapElement?.clientHeight;
    
    // If map element doesn't exist or has no height, fall back to window calculation
    if (!clientHeight || clientHeight < 100) {
        const winHeight = window.innerHeight;
        const topNavHeight =
            document.getElementById('top-nav-wrapper')?.clientHeight;
        const titleHeight = document.getElementById('title')?.clientHeight;
        return winHeight - (topNavHeight || 0) - (titleHeight || 0) - 65; // Fallback calculation
    }
    
    // Use the actual map container height with margin for toolbar area
    // The toolbar is positioned absolutely at bottom: 20px, so we need some space for it
    return Math.max(clientHeight - 60, 400); // Increased margin to account for toolbar
};
const getWidth = () => {
    const mapElement = document.getElementById('map');
    const clientWidth = mapElement?.clientWidth;
    // If map element doesn't exist or has no width, use window width with some margin
    if (!clientWidth || clientWidth < 100) {
        return Math.max(window.innerWidth - 100, 800); // Fallback to reasonable minimum
    }
    return Math.max(clientWidth - 10, 600); // Minimal margin, ensure reasonable minimum
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

        // Handle standard window resize events (but not panel resizes)
        const handleWindowResize = (event: Event) => {
            // Only handle if it's not a programmatically dispatched event from panel resize
            if (!event.isTrusted) return;
            debouncedHandleResize();
        };

        window.addEventListener('resize', handleWindowResize);
        debouncedHandleResize();

        return function cleanup() {
            window.removeEventListener('resize', handleWindowResize);
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

        // Handle panel resize events specifically
        const handlePanelResize = (event: CustomEvent) => {
            // Update both map dimensions and canvas dimensions when panel resizes
            // This should work exactly like browser window resize
            setTimeout(() => {
                const newWidth = getWidth();
                const newHeight = getHeight();
                
                // Update map dimensions (like window resize does)
                const dimensions = {
                    width: mapSize.width > 0 ? mapSize.width : 100 + newWidth,
                    height: mapSize.height > 0 ? mapSize.height : newHeight,
                };
                mapActions.setMapDimensions(dimensions);
                
                // Update canvas dimensions
                mapActions.setMapCanvasDimensions({
                    width: newWidth,
                    height: newHeight,
                });
            }, 200); // Delay to ensure DOM has fully updated and map container has resized
        };

        // Handle standard window resize events (but not panel resizes)
        const handleWindowResize = (event: Event) => {
            // Only handle if it's not a programmatically dispatched event from panel resize
            if (!event.isTrusted) return;
            debouncedHandleCanvasResize();
        };

        window.addEventListener('load', initialLoad);
        window.addEventListener('resize', handleWindowResize);
        window.addEventListener('panelResize', handlePanelResize as EventListener);

        return function cleanup() {
            window.removeEventListener('resize', handleWindowResize);
            window.removeEventListener('load', initialLoad);
            window.removeEventListener('panelResize', handlePanelResize as EventListener);
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
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            <LeftNavigation
                toggleMenu={toggleMenu}
                menuVisible={menuVisible}
                submenu={submenu}
                toggleTheme={toggleTheme}
                isLightTheme={isLightTheme}
            />

            <Box
                id="top-nav-wrapper"
                sx={{
                    display: hideNav ? 'none' : 'block',
                    flexShrink: 0,
                }}
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

            <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
                {mapOnlyView === false ? (
                    <ResizableSplitPane
                        defaultLeftWidth={33}
                        minLeftWidth={20}
                        maxLeftWidth={60}
                        storageKey="wardleyMapEditor_splitPaneWidth"
                        isDarkTheme={!isLightTheme}
                        leftPanel={
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
                        }
                        rightPanel={
                            <Box
                                className="map-view"
                                sx={{
                                    backgroundColor:
                                        legacyState.mapStyleDefs
                                            .containerBackground,
                                    width: '100%',
                                    height: '100%',
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
                                        mapDimensions={
                                            legacyState.mapDimensions
                                        }
                                        mapEvolutionStates={
                                            legacyState.mapEvolutionStates
                                        }
                                        mapRef={mapRef}
                                        mapText={legacyState.mapText}
                                        mutateMapText={mutateMapText}
                                        evolutionOffsets={Defaults.EvoOffsets}
                                        launchUrl={launchUrl}
                                        setHighlightLine={
                                            legacyState.setHighlightLine
                                        }
                                        setNewComponentContext={
                                            legacyState.setNewComponentContext
                                        }
                                        showLinkedEvolved={
                                            legacyState.showLinkedEvolved
                                        }
                                    />
                                </ModKeyPressedProvider>
                            </Box>
                        }
                    />
                ) : (
                    <Box
                        className="map-view"
                        sx={{
                            backgroundColor:
                                legacyState.mapStyleDefs.containerBackground,
                            width: '100%',
                            height: '100%',
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
                                mapEvolutionStates={
                                    legacyState.mapEvolutionStates
                                }
                                mapRef={mapRef}
                                mapText={legacyState.mapText}
                                mutateMapText={mutateMapText}
                                evolutionOffsets={Defaults.EvoOffsets}
                                launchUrl={launchUrl}
                                setHighlightLine={legacyState.setHighlightLine}
                                setNewComponentContext={
                                    legacyState.setNewComponentContext
                                }
                                showLinkedEvolved={
                                    legacyState.showLinkedEvolved
                                }
                            />
                        </ModKeyPressedProvider>
                    </Box>
                )}
            </Box>

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
        </Box>
    );
};

export default MapEnvironment;
