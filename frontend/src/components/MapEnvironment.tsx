import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import {Backdrop, Box, CircularProgress} from '@mui/material';
import html2canvas from 'html2canvas';
import React, {FunctionComponent, useEffect, useRef, useState, useCallback} from 'react';
import * as Defaults from '../constants/defaults';
import {UnifiedConverter} from '../conversion/UnifiedConverter';
import {useI18n} from '../hooks/useI18n';
import {useLegacyMapState, useUnifiedMapState} from '../hooks/useUnifiedMapState';
import {MapIteration} from '../repository/OwnApiWardleyMap';
import {MapAnnotationsPosition, MapSize} from '../types/base';
import {EditingProvider} from './EditingContext';
import {useFeatureSwitches} from './FeatureSwitchesContext';
import {UndoRedoProvider, useUndoRedo} from './UndoRedoProvider';

import {ComponentSelectionProvider} from './ComponentSelectionContext';
import Editor from './editor/Editor';
import {MapLayout} from './map/components/MapLayout';
import {useMapDimensions} from './map/hooks/useMapDimensions';
import {useMapParsing} from './map/hooks/useMapParsing';
import {useMapPersistence} from './map/hooks/useMapPersistence';
import {MapView} from './map/MapView';



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

interface MapEnvironmentWithUndoRedoProps extends MapEnvironmentProps {
    saveOutstanding: boolean;
    setSaveOutstanding: React.Dispatch<React.SetStateAction<boolean>>;
    mapIterations: MapIteration[];
    setMapIterations: React.Dispatch<React.SetStateAction<MapIteration[]>>;
    currentIteration: number;
    setCurrentIteration: React.Dispatch<React.SetStateAction<number>>;
    unifiedMapState: any; // Pass the unified state from parent
}

/**
 * Component that uses the UndoRedoProvider's enhanced mutateMapText
 */
const MapEnvironmentWithUndoRedo: FunctionComponent<MapEnvironmentWithUndoRedoProps> = ({
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
    saveOutstanding,
    setSaveOutstanding,
    mapIterations,
    setMapIterations,
    currentIteration,
    setCurrentIteration,
    unifiedMapState,
}) => {
    const featureSwitches = useFeatureSwitches();
    const mapRef = useRef<HTMLElement | null>(null);
    const {t} = useI18n();

    // Get the undo/redo context
    const undoRedoContext = useUndoRedo();

    // Use the unified state passed from parent
    const {state: mapState, actions: mapActions} = unifiedMapState;

    // Extract individual values for backward compatibility using legacy hook
    const legacyState = useLegacyMapState(unifiedMapState);

    // Remaining individual state that's not part of unified state
    const [currentUrl, setCurrentUrl] = useState('');
    const [mapTitle, setMapTitle] = useState('Untitled Map');
    const [rawMapTitle, setRawMapTitle] = useState('Untitled Map');
    const [invalid, setInvalid] = useState(false);
    const [mapAnnotationsPresentation, setMapAnnotationsPresentation] = useState<MapAnnotationsPosition>({
        maturity: 0,
        visibility: 0,
    });
    const [mapSize, setMapSize] = useState<MapSize>({width: 0, height: 0});
    const [mapStyle, setMapStyle] = useState('plain');
    const [errorLine, setErrorLine] = useState<number[]>([]);
    const [showLineNumbers, setShowLineNumbers] = useState(false);
    const [mapOnlyView, setMapOnlyView] = useState(false);
    const [actionInProgress, setActionInProgress] = useState(false);
    const [hideNav, setHideNav] = useState(false);

    // Enhanced mutateMapText function that records history for normal operations
    const mutateMapText = (
        newText: string,
        actionType?: Parameters<typeof undoRedoContext.recordChange>[1],
        description?: string,
        groupId?: string,
    ) => {
        // Record the change in history (if not an undo/redo operation)
        if (!undoRedoContext.isUndoRedoOperation) {
            undoRedoContext.recordChange(newText, actionType || 'editor-text', description || 'Map text changed', groupId);
        }

        // Apply the change using the parent's mapActions
        mapActions.setMapText(newText);

        // Parse the new map text and update the unified map state
        try {
            const unifiedConverter = new UnifiedConverter(featureSwitches);
            const unifiedMap = unifiedConverter.parse(newText);
            mapActions.setMap(unifiedMap);
        } catch (err) {
            console.log('Error parsing map text:', err);
        }

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

    const launchUrl = useCallback(
        (urlId: string) => {
            const mapUrl = legacyState.mapUrls.find(u => u.name === urlId);
            if (mapUrl) {
                window.open(mapUrl.url);
            }
        },
        [legacyState.mapUrls],
    );

    const toggleUsage = useCallback(() => {
        mapActions.setShowUsage(!mapState.showUsage);
    }, [mapActions, mapState.showUsage]);

    // Map persistence hook
    const mapPersistence = useMapPersistence({
        currentId,
        setCurrentId,
        mapPersistenceStrategy,
        setMapPersistenceStrategy,
        setShouldLoad,
        setCurrentUrl,
        setSaveOutstanding,
        saveOutstanding,
        setActionInProgress,
        mapIterations,
        setMapIterations,
        currentIteration,
        setCurrentIteration,
        mapText: legacyState.mapText,
        mutateMapText,
    });

    // Map parsing hook
    const {parsedMapData, getMapStyleDefs} = useMapParsing({
        mapText: legacyState.mapText,
        featureSwitches,
    });

    // Map dimensions hook
    const {getHeight, getWidth} = useMapDimensions({
        mapSize,
        mapOnlyView,
        hideNav,
        setMapDimensions: mapActions.setMapDimensions,
        setMapCanvasDimensions: mapActions.setMapCanvasDimensions,
    });





    useEffect(() => {
        if (parsedMapData.isValid && parsedMapData.legacy) {
            const r = parsedMapData.legacy;
            setErrorLine([]);
            setInvalid(false);
            setRawMapTitle(r.title);
            setMapAnnotationsPresentation(r.presentation.annotations);
            setMapStyle(r.presentation.style);
            setMapSize(r.presentation.size);
            mapActions.setMapEvolutionStates({
                genesis: {l1: r.evolution[0].line1, l2: r.evolution[0].line2},
                custom: {l1: r.evolution[1].line1, l2: r.evolution[1].line2},
                product: {l1: r.evolution[2].line1, l2: r.evolution[2].line2},
                commodity: {
                    l1: r.evolution[3].line1,
                    l2: r.evolution[3].line2,
                },
            });
            if (parsedMapData.errors.length > 0) {
                setErrorLine(parsedMapData.errors.map(e => e.line));
            }
            if (parsedMapData.unified) {
                mapActions.setMap(parsedMapData.unified);
            }
        }
    }, [parsedMapData, mapActions]);

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
            setMapTitle(rawMapTitle + ' [' + mapIterations[currentIteration].name + ']');
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
            name: mapState.showUsage ? t('editor.hideUsage', 'Hide Usage') : t('editor.showUsage', 'Show Usage'),
            icon: <HelpCenterIcon />,
            action: () => {
                toggleUsage();
            },
        },
    ];

    const shouldHideNav = useCallback(() => {
        setHideNav(!hideNav);
    }, [hideNav]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
            }}>
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
                }}>
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

            <Box sx={{flexGrow: 1, height: '100%', overflow: 'hidden'}}>
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
                                errorLine={errorLine}
                                showLineNumbers={showLineNumbers}
                            />
                        }
                        rightPanel={
                            <Box
                                className="map-view"
                                sx={{
                                    backgroundColor: legacyState.mapStyleDefs.containerBackground,
                                    width: '100%',
                                    height: '100%',
                                }}>
                                <EditingProvider>
                                    <ComponentSelectionProvider>
                                        <MapView
                                            wardleyMap={unifiedMapState.getUnifiedMap()}
                                            shouldHideNav={shouldHideNav}
                                            hideNav={hideNav}
                                            mapTitle={mapTitle}
                                            mapAnnotationsPresentation={mapAnnotationsPresentation}
                                            mapStyleDefs={legacyState.mapStyleDefs}
                                            mapCanvasDimensions={legacyState.mapCanvasDimensions}
                                            mapDimensions={legacyState.mapDimensions}
                                            mapEvolutionStates={legacyState.mapEvolutionStates}
                                            mapRef={mapRef}
                                            mapText={legacyState.mapText}
                                            mutateMapText={mutateMapText}
                                            evolutionOffsets={Defaults.EvoOffsets}
                                            launchUrl={launchUrl}
                                            setHighlightLine={legacyState.setHighlightLine}
                                            setNewComponentContext={legacyState.setNewComponentContext}
                                            showLinkedEvolved={legacyState.showLinkedEvolved}
                                        />
                                    </ComponentSelectionProvider>
                                </EditingProvider>
                            </Box>
                        }
                    />
                ) : (
                    <Box
                        className="map-view"
                        sx={{
                            backgroundColor: legacyState.mapStyleDefs.containerBackground,
                            width: '100%',
                            height: '100%',
                        }}>
                        <EditingProvider>
                            <ComponentSelectionProvider>
                                <MapView
                                    wardleyMap={unifiedMapState.getUnifiedMap()}
                                    shouldHideNav={shouldHideNav}
                                    hideNav={hideNav}
                                    mapTitle={mapTitle}
                                    mapAnnotationsPresentation={mapAnnotationsPresentation}
                                    mapStyleDefs={legacyState.mapStyleDefs}
                                    mapCanvasDimensions={legacyState.mapCanvasDimensions}
                                    mapDimensions={legacyState.mapDimensions}
                                    mapEvolutionStates={legacyState.mapEvolutionStates}
                                    mapRef={mapRef}
                                    mapText={legacyState.mapText}
                                    mutateMapText={mutateMapText}
                                    evolutionOffsets={Defaults.EvoOffsets}
                                    launchUrl={launchUrl}
                                    setHighlightLine={legacyState.setHighlightLine}
                                    setNewComponentContext={legacyState.setNewComponentContext}
                                    showLinkedEvolved={legacyState.showLinkedEvolved}
                                />
                            </ComponentSelectionProvider>
                        </EditingProvider>
                    </Box>
                )}
            </Box>

            <Dialog maxWidth={'lg'} open={mapState.showUsage} onClose={() => mapActions.setShowUsage(false)}>
                <DialogTitle>{t('editor.usage', 'Usage')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t(
                            'editor.usageDescription',
                            'Quick reference of all available map elements. You can add an example to your map by clicking the available links.',
                        )}
                    </DialogContentText>
                    <Box marginTop={2}>
                        <UsageInfo mapStyleDefs={legacyState.mapStyleDefs} mutateMapText={mutateMapText} mapText={legacyState.mapText} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => mapActions.setShowUsage(false)}>{t('common.close', 'Close')}</Button>
                </DialogActions>
            </Dialog>

            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: theme => theme.zIndex.drawer + 1,
                }}
                open={actionInProgress}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
};

/**
 * Main MapEnvironment component with integrated UndoRedoProvider
 */
const MapEnvironment: FunctionComponent<MapEnvironmentProps> = props => {
    const featureSwitches = useFeatureSwitches();

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
    const {actions: mapActions} = unifiedMapState;

    // Extract individual values for backward compatibility using legacy hook
    const legacyState = useLegacyMapState(unifiedMapState);

    // State for save and iterations that needs to be shared with UndoRedoProvider
    const [saveOutstanding, setSaveOutstanding] = useState(false);
    const [mapIterations, setMapIterations] = useState<MapIteration[]>([]);
    const [currentIteration, setCurrentIteration] = useState(-1);

    // Base mutateMapText function that handles save state and iterations
    // This is what the UndoRedoProvider will call for undo/redo operations
    const baseMutateMapText = (newText: string) => {
        // Update the map text directly using the actions
        mapActions.setMapText(newText);

        // Parse the new map text and update the unified map state
        try {
            const unifiedConverter = new UnifiedConverter(featureSwitches);
            const unifiedMap = unifiedConverter.parse(newText);
            mapActions.setMap(unifiedMap);
        } catch (err) {
            console.log('Error parsing map text:', err);
        }

        // Handle save state and iterations
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

    return (
        <UndoRedoProvider mutateMapText={baseMutateMapText} mapText={legacyState.mapText} maxHistorySize={50} debounceMs={300}>
            <MapEnvironmentWithUndoRedo
                {...props}
                saveOutstanding={saveOutstanding}
                setSaveOutstanding={setSaveOutstanding}
                mapIterations={mapIterations}
                setMapIterations={setMapIterations}
                currentIteration={currentIteration}
                setCurrentIteration={setCurrentIteration}
                unifiedMapState={unifiedMapState}
            />
        </UndoRedoProvider>
    );
};

export default MapEnvironment;
