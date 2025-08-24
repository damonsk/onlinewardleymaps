import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import {Backdrop, Box, CircularProgress} from '@mui/material';
import html2canvas from 'html2canvas';
import React, {FunctionComponent, useEffect, useRef, useState, useCallback} from 'react';
import * as Defaults from '../constants/defaults';
import * as MapStyles from '../constants/mapstyles';
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
        mapActions.setMapStyleDefs(getMapStyleDefs(mapStyle));
    }, [mapStyle, mapActions, getMapStyleDefs]);

    useEffect(() => {
        if (shouldLoad) mapPersistence.loadFromRemoteStorage();
    }, [shouldLoad, mapPersistence]);



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

    // Download functions that are still needed
    function downloadMap() {
        if (mapRef.current === null) return;
        const svgMapText = mapRef.current.getElementsByTagName('svg')[0].outerHTML;
        const tempElement = document.createElement('div');
        tempElement.innerHTML = svgMapText;
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        document.body.appendChild(tempElement);
        html2canvas(tempElement, {useCORS: true, allowTaint: true})
            .then(canvas => {
                const base64image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = mapTitle;
                link.href = base64image;
                link.click();
                tempElement.remove();
            })
            .catch(_ => {
                tempElement.remove();
            });
    }

    function downloadMapAsSVG() {
        if (mapRef.current === null) return;
        const svgMapText = mapRef.current
            .getElementsByTagName('svg')[0]
            .outerHTML.replace(/&nbsp;/g, ' ')
            .replace(/<svg([^>]*)>/, '<svg xmlns="http://www.w3.org/2000/svg"$1>');
        saveMapText(
            `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">${svgMapText}`,
            `${mapTitle}.svg`,
        );
    }

    const saveMapText = (data: string, fileName: string) => {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        const blob = new Blob([data], {type: 'data:attachment/xml'});
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const leftPanel = (
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
    );

    const rightPanel = (
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
    );

    return (
        <>
            <MapLayout
                toggleMenu={toggleMenu}
                menuVisible={menuVisible}
                submenu={submenu}
                toggleTheme={toggleTheme}
                isLightTheme={isLightTheme}
                hideNav={hideNav}
                shouldHideNav={shouldHideNav}
                mapOnlyView={mapOnlyView}
                setMapOnlyView={setMapOnlyView}
                currentUrl={currentUrl}
                saveOutstanding={saveOutstanding}
                mutateMapText={mutateMapText}
                newMapClick={mapPersistence.newMap}
                saveMapClick={mapPersistence.saveMap}
                downloadMapImage={downloadMap}
                showLineNumbers={showLineNumbers}
                setShowLineNumbers={setShowLineNumbers}
                showLinkedEvolved={legacyState.showLinkedEvolved}
                setShowLinkedEvolved={legacyState.setShowLinkedEvolved}
                downloadMapAsSVG={downloadMapAsSVG}
                mapIterations={mapIterations}
                currentIteration={currentIteration}
                setMapIterations={setMapIterations}
                setMapText={legacyState.mutateMapText}
                addIteration={mapPersistence.addIteration}
                setCurrentIteration={setCurrentIteration}
                leftPanel={leftPanel}
                rightPanel={rightPanel}
                showUsage={mapState.showUsage}
                setShowUsage={mapActions.setShowUsage}
                mapStyleDefs={legacyState.mapStyleDefs}
                mapText={legacyState.mapText}
            />

            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: theme => theme.zIndex.drawer + 1,
                }}
                open={actionInProgress}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
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
