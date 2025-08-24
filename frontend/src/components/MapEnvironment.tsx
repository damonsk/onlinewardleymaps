import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import {Backdrop, Box, CircularProgress} from '@mui/material';
import html2canvas from 'html2canvas';
import React, {FunctionComponent, useCallback, useEffect, useRef, useState} from 'react';
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
    // Helper function to get initial mapOnlyView state from localStorage
    const getInitialMapOnlyView = useCallback(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('onlinewardleymaps_mapOnlyView');
            if (saved !== null) {
                return saved === 'true'; // Convert string to boolean
            }
        }
        return false; // Default to Editor Mode (false = Editor Mode, true = Presentation Mode)
    }, []);

    const [mapOnlyView, setMapOnlyView] = useState(() => getInitialMapOnlyView());
    
    // Wrapper function to persist mapOnlyView state to localStorage
    const setMapOnlyViewWithPersistence = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
        const newValue = typeof value === 'function' ? value(mapOnlyView) : value;
        
        // Update state
        setMapOnlyView(newValue);
        
        // Persist to localStorage
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('onlinewardleymaps_mapOnlyView', newValue.toString());
            } catch (error) {
                // Ignore localStorage errors (e.g., private browsing mode)
                console.warn('Failed to save mapOnlyView to localStorage:', error);
            }
        }
    }, [mapOnlyView]);
    
    // Helper function to get initial showWysiwygToolbar state from localStorage
    const getInitialShowWysiwygToolbar = useCallback(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('onlinewardleymaps_showWysiwygToolbar');
            if (saved !== null) {
                return saved === 'true'; // Convert string to boolean
            }
        }
        return true; // Default to showing the toolbar
    }, []);

    // Helper function to get initial showMapIterations state from localStorage
    const getInitialShowMapIterations = useCallback(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('onlinewardleymaps_showMapIterations');
            if (saved !== null) {
                return saved === 'true'; // Convert string to boolean
            }
        }
        return true; // Default to showing the map iterations
    }, []);

    // Helper function to get initial toolbar snap state from localStorage
    const getInitialToolbarSnapped = useCallback(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('onlinewardleymaps_toolbarSnapped');
            if (saved !== null) {
                return saved === 'true'; // Convert string to boolean
            }
        }
        return false; // Default to not snapped
    }, []);

    const [showWysiwygToolbar, setShowWysiwygToolbar] = useState(() => getInitialShowWysiwygToolbar());
    
    // Wrapper function to persist showWysiwygToolbar state to localStorage
    const setShowWysiwygToolbarWithPersistence = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
        const newValue = typeof value === 'function' ? value(showWysiwygToolbar) : value;
        
        // Update state
        setShowWysiwygToolbar(newValue);
        
        // Persist to localStorage
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('onlinewardleymaps_showWysiwygToolbar', newValue.toString());
            } catch (error) {
                // Ignore localStorage errors (e.g., private browsing mode)
                console.warn('Failed to save showWysiwygToolbar to localStorage:', error);
            }
        }
    }, [showWysiwygToolbar]);

    const [showMapIterations, setShowMapIterations] = useState(() => getInitialShowMapIterations());
    
    // Wrapper function to persist showMapIterations state to localStorage
    const setShowMapIterationsWithPersistence = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
        const newValue = typeof value === 'function' ? value(showMapIterations) : value;
        
        // Update state
        setShowMapIterations(newValue);
        
        // Persist to localStorage
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('onlinewardleymaps_showMapIterations', newValue.toString());
            } catch (error) {
                // Ignore localStorage errors (e.g., private browsing mode)
                console.warn('Failed to save showMapIterations to localStorage:', error);
            }
        }
    }, [showMapIterations]);

    const [toolbarSnapped, setToolbarSnapped] = useState(() => getInitialToolbarSnapped());
    
    // Wrapper function to persist toolbarSnapped state to localStorage
    const setToolbarSnappedWithPersistence = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
        const newValue = typeof value === 'function' ? value(toolbarSnapped) : value;
        
        // Update state
        setToolbarSnapped(newValue);
        
        // Persist to localStorage
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('onlinewardleymaps_toolbarSnapped', newValue.toString());
            } catch (error) {
                // Ignore localStorage errors (e.g., private browsing mode)
                console.warn('Failed to save toolbarSnapped to localStorage:', error);
            }
        }
    }, [toolbarSnapped]);
    
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
    }, [mapOnlyView, hideNav, mapSize, mapActions, getWidth, getHeight]);

    useEffect(() => {
        if (currentIteration > -1) {
            setMapTitle(rawMapTitle + ' [' + mapIterations[currentIteration].name + ']');
        } else {
            setMapTitle(rawMapTitle);
        }
    }, [currentIteration, rawMapTitle, mapIterations]);

    useEffect(() => {
        mapActions.setMapStyleDefs(getMapStyleDefs(mapStyle));
    }, [mapStyle, getMapStyleDefs, mapActions]);

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

    // Helper function to wait for SVG element to be available
    const waitForSVGElement = (retries = 5, delay = 200): Promise<SVGSVGElement> => {
        return new Promise((resolve, reject) => {
            const checkForSVG = (attemptsLeft: number) => {
                // First try direct getElementById
                let svgElement = document.getElementById('svgMap');
                
                // If not found, look for ReactSVGPanZoom's SVG structure
                if (!svgElement) {
                    // Look for the main SVG that contains the map content
                    const mapCanvas = document.getElementById('map-canvas');
                    if (mapCanvas) {
                        // Find the SVG within the map canvas that has the transform group containing our content
                        const svgs = mapCanvas.querySelectorAll('svg');
                        for (const svg of svgs) {
                            // Look for SVG that contains a transform group with our map content
                            const transformGroup = svg.querySelector('g[transform*="matrix"] g rect[fill="transparent"]');
                            if (transformGroup) {
                                svgElement = svg as unknown as HTMLElement;
                                break;
                            }
                        }
                    }
                }
                
                // Fallback: look for any SVG with our expected map content
                if (!svgElement) {
                    const allSvgs = document.querySelectorAll('svg');
                    for (const svg of allSvgs) {
                        // Look for SVG containing map elements (components, anchors, etc.)
                        const hasMapContent = svg.querySelector('#mapContent, #grid, [id*="element_"], [id*="anchor_"]');
                        if (hasMapContent) {
                            svgElement = svg as unknown as HTMLElement;
                            break;
                        }
                    }
                }
                
                if (svgElement && svgElement.tagName.toLowerCase() === 'svg') {
                    console.log('Found SVG element for export:', {
                        id: svgElement.id || 'no-id',
                        width: svgElement.getAttribute('width'),
                        height: svgElement.getAttribute('height'),
                        hasMapContent: !!svgElement.querySelector('#mapContent, #grid')
                    });
                    resolve(svgElement as unknown as SVGSVGElement);
                    return;
                }
                
                if (attemptsLeft <= 0) {
                    console.error('SVG element search failed. Available SVGs:', {
                        allSvgs: Array.from(document.querySelectorAll('svg')).map(svg => ({
                            id: svg.id,
                            class: svg.className,
                            width: svg.getAttribute('width'),
                            height: svg.getAttribute('height'),
                            hasTransform: !!svg.querySelector('g[transform]'),
                            hasMapContent: !!svg.querySelector('#mapContent, #grid, [id*="element_"]')
                        }))
                    });
                    reject(new Error('SVG element with map content not found. Make sure the map is fully loaded.'));
                    return;
                }
                
                console.log(`Searching for SVG element... attempts remaining: ${attemptsLeft}`);
                setTimeout(() => checkForSVG(attemptsLeft - 1), delay);
            };
            
            checkForSVG(retries);
        });
    };

    // Download functions that are still needed
    function downloadMap() {
        waitForSVGElement().then(reactSvgElement => {
            // For ReactSVGPanZoom, we need to extract the actual map content
            // Find the transformed group that contains our map
            const transformedGroup = reactSvgElement.querySelector('g[transform*="matrix"]');
            if (!transformedGroup) {
                throw new Error('Could not find map content within ReactSVGPanZoom');
            }
            
            // Create a new SVG with just the map content
            const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            
            // Set dimensions based on the map content (looking for the fill area or grid)
            const fillArea = transformedGroup.querySelector('#fillArea, rect[fill*="Gradient"], rect[fill="white"]');
            let width = 800; // fallback
            let height = 600; // fallback
            
            if (fillArea) {
                width = parseInt(fillArea.getAttribute('width') || '800') + 70; // padding for labels
                height = parseInt(fillArea.getAttribute('height') || '600') + 90; // padding for labels
            }
            
            // Set up the new SVG
            newSvg.setAttribute('width', width.toString());
            newSvg.setAttribute('height', height.toString());
            newSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            newSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            
            // Clone the map content without the transform
            const mapContent = transformedGroup.cloneNode(true) as SVGGElement;
            mapContent.removeAttribute('transform'); // Remove the pan/zoom transform
            
            // Wrap in a group with proper positioning
            const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            contentGroup.setAttribute('transform', 'translate(35, 45)'); // Offset for proper positioning
            contentGroup.appendChild(mapContent);
            newSvg.appendChild(contentGroup);
            
            // Create a container for the SVG with proper sizing
            const tempElement = document.createElement('div');
            tempElement.style.position = 'absolute';
            tempElement.style.left = '-9999px';
            tempElement.style.top = '-9999px';
            tempElement.style.width = `${width}px`;
            tempElement.style.height = `${height}px`;
            tempElement.style.backgroundColor = 'white';
            tempElement.style.overflow = 'visible';
            tempElement.appendChild(newSvg);
            
            document.body.appendChild(tempElement);
            
            html2canvas(tempElement, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: 'white',
                scale: 2,
                width: width,
                height: height,
            }).then(canvas => {
                const base64image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `${mapTitle}.png`;
                link.href = base64image;
                link.click();
                tempElement.remove();
            }).catch(error => {
                console.error('Error generating PNG export:', error);
                alert(`Failed to export PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
                tempElement.remove();
            });
        }).catch(error => {
            console.error('Error finding SVG element:', error);
            alert(`Failed to export PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
        });
    }

    function downloadMapAsSVG() {
        waitForSVGElement().then(reactSvgElement => {
            // For ReactSVGPanZoom, we need to extract the actual map content
            // Find the transformed group that contains our map
            const transformedGroup = reactSvgElement.querySelector('g[transform*="matrix"]');
            if (!transformedGroup) {
                throw new Error('Could not find map content within ReactSVGPanZoom');
            }
            
            // Create a new SVG with just the map content
            const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            
            // Set dimensions based on the map content
            const fillArea = transformedGroup.querySelector('#fillArea, rect[fill*="Gradient"], rect[fill="white"]');
            let width = 800; // fallback
            let height = 600; // fallback
            
            if (fillArea) {
                width = parseInt(fillArea.getAttribute('width') || '800') + 70;
                height = parseInt(fillArea.getAttribute('height') || '600') + 90;
            }
            
            // Set up the new SVG
            newSvg.setAttribute('width', width.toString());
            newSvg.setAttribute('height', height.toString());
            newSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            newSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            
            // Clone the map content without the transform
            const mapContent = transformedGroup.cloneNode(true) as SVGGElement;
            mapContent.removeAttribute('transform'); // Remove the pan/zoom transform
            
            // Wrap in a group with proper positioning
            const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            contentGroup.setAttribute('transform', 'translate(35, 45)');
            contentGroup.appendChild(mapContent);
            newSvg.appendChild(contentGroup);
            
            const svgMapText = newSvg.outerHTML.replace(/&nbsp;/g, ' ');
            saveMapText(
                `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">${svgMapText}`,
                `${mapTitle}.svg`,
            );
        }).catch(error => {
            console.error('Error generating SVG export:', error);
            alert(`Failed to export SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
        });
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
                        showWysiwygToolbar={showWysiwygToolbar}
                        toolbarSnapped={toolbarSnapped}
                        onToolbarSnapChange={setToolbarSnappedWithPersistence}
                        mapOnlyView={mapOnlyView}
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
                setMapOnlyView={setMapOnlyViewWithPersistence}
                showWysiwygToolbar={showWysiwygToolbar}
                setShowWysiwygToolbar={setShowWysiwygToolbarWithPersistence}
                showMapIterations={showMapIterations}
                setShowMapIterations={setShowMapIterationsWithPersistence}
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
