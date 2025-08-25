import {MouseEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ReactSVGPanZoom, TOOL_NONE, UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
import {DEFAULT_RESIZE_CONSTRAINTS} from '../../constants/pstConfig';
import {MapElements} from '../../processing/MapElements';
import {MapTitleManager} from '../../services/MapTitleManager';
import {PSTCoordinates, PSTElement, ResizeHandle} from '../../types/map/pst';
import {processLinks} from '../../utils/mapProcessing';
import {
    calculateResizedBounds,
    constrainPSTBounds,
    convertBoundsToPSTCoordinates,
    convertPSTCoordinatesToBounds,
} from '../../utils/pstCoordinateUtils';
import {updatePSTInMapText} from '../../utils/pstElementUtils';
import {useEditing} from '../EditingContext';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import MapCanvasToolbar from './MapCanvasToolbar';
import MapGridGroup from './MapGridGroup';
import UnifiedMapContent from './UnifiedMapContent';
import {DebugOverlay} from './debug/DebugOverlay';
import {useCanvasState} from './hooks/useCanvasState';
import {useMapEventHandlers} from './hooks/useMapEventHandlers';
import {usePSTInteractions} from './hooks/usePSTInteractions';
import {UnifiedMapCanvasProps} from './types/MapCanvasProps';

// Debug mode for coordinate issues - set to false to disable debug indicators
const DEBUG_COORDINATES = false;

function UnifiedMapCanvas(props: UnifiedMapCanvasProps) {
    const featureSwitches = useFeatureSwitches();
    const {enableAccelerators, showMapToolbar, allowMapZoomMouseWheel} = featureSwitches;

    const {
        wardleyMap,
        mapText,
        mutateMapText,
        setHighlightLine,
        setNewComponentContext,
        showLinkedEvolved,
        launchUrl,
        mapDimensions,
        mapCanvasDimensions,
        mapStyleDefs,
        evolutionOffsets,
        mapEvolutionStates,
        mapAnnotationsPresentation,
    } = props;

    const {isAnyElementEditing, editingState} = useEditing();
    const Viewer = useRef<ReactSVGPanZoom>(null);

    // Computed values
    const mapElements = useMemo(() => {
        return new MapElements(wardleyMap);
    }, [wardleyMap]);

    const processedLinks = useMemo(() => {
        return processLinks(
            wardleyMap.links.map(link => ({
                start: link.start,
                end: link.end,
                line: link.line ?? 0,
                flow: link.flow ?? false,
                flowValue: link.flowValue ?? '',
                future: link.future ?? false,
                past: link.past ?? false,
                context: link.context ?? '',
            })),
            mapElements,
            wardleyMap.anchors.map(anchor => ({
                ...anchor,
                line: anchor.line ?? 0,
                evolved: anchor.evolved ?? false,
                inertia: anchor.inertia ?? false,
                increaseLabelSpacing: anchor.increaseLabelSpacing ?? 0,
                pseudoComponent: anchor.pseudoComponent ?? false,
                offsetY: anchor.offsetY ?? 0,
                evolving: anchor.evolving ?? false,
                decorators: anchor.decorators ?? {
                    buy: false,
                    build: false,
                    outsource: false,
                    ecosystem: false,
                    market: false,
                },
            })),
            showLinkedEvolved,
        );
    }, [wardleyMap.links, mapElements, wardleyMap.anchors, showLinkedEvolved]);

    // State for element clicks tracking
    const [mapElementsClicked, setMapElementsClicked] = useState<
        Array<{
            el: any;
            e: MouseEvent<Element>;
        }>
    >([]);

    // Use extracted hooks for state management
    const canvasState = useCanvasState({
        mapDimensions,
        mapCanvasDimensions,
        isEditing: editingState.isEditing,
    });

    const pstInteractions = usePSTInteractions({
        mapDimensions,
        mapText,
        mutateMapText,
        setTool: canvasState.setTool,
    });

    const {
        value,
        setValue,
        tool,
        setTool,
        enableZoomOnClick,
        scaleFactor,
        currentMousePosition,
        setCurrentMousePosition,
        lastClickPosition,
        setLastClickPosition,
        isInitialSizingComplete,
        setIsInitialSizingComplete,
        waitingForPanelRestore,
        setWaitingForPanelRestore,
        handleZoomChange,
    } = canvasState;

    const {
        hoveredPSTElement,
        resizingPSTElement,
        resizeHandle,
        resizePreviewBounds,
        keyboardModifiers,
        draggingPSTElement,
        dragPreviewBounds,
        handlePSTHover,
        handlePSTResizeStart,
        handlePSTResizeMove,
        handlePSTResizeEnd,
        handlePSTDragStart,
        handlePSTDragMove,
        handlePSTDragEnd,
    } = pstInteractions;

    // Use our custom hook for event handling
    const {handleMapClick, handleMapDoubleClick, handleMapMouseMove, handleMapMouseUp} = useMapEventHandlers({
        mapDimensions,
        panZoomValue: value,
        wardleyMap,
        selectedToolbarItem: props.selectedToolbarItem,
        onToolbarItemDrop: props.onToolbarItemDrop,
        onMouseMove: position => {
            setCurrentMousePosition(position);
            props.onMouseMove?.(position);
        },
        onMouseDown: props.onMouseDown,
        onMouseUp: props.onMouseUp,
        onComponentClick: props.onComponentClick,
        onMethodApplication: props.onMethodApplication,
        handleMapCanvasClick: props.handleMapCanvasClick,
        setNewComponentContext: props.setNewComponentContext,
        linkingState: props.linkingState,
        highlightedComponent: props.highlightedComponent,
        enableZoomOnClick,
    });

    // Handle element clicks for linking functionality, method application, and component conversion
    const clicked = useCallback(
        (ctx: {el: any; e: MouseEvent<Element> | null}) => {
            console.log('mapElementsClicked::clicked', ctx);
            setHighlightLine(ctx.el.line || 0);

            // Handle method application when a method tool is selected
            if (props.selectedToolbarItem?.toolType === 'method-application' && ctx.el) {
                const methodName = props.selectedToolbarItem.methodName;
                if (methodName && props.onMethodApplication) {
                    props.onMethodApplication(ctx.el, methodName);
                }
                return;
            }

            // Handle component conversion when component tool is selected
            if (props.selectedToolbarItem?.id === 'component' && ctx.el) {
                // Convert method components back to regular components
                if (props.onMethodApplication) {
                    props.onMethodApplication(ctx.el, 'component');
                }
                return;
            }

            // Handle component clicks for linking (existing functionality)
            if (props.onComponentClick) {
                props.onComponentClick(ctx.el);
                return;
            }
        },
        [mapElementsClicked, setHighlightLine, mutateMapText, mapText, props],
    );

    // Title update handler
    const handleTitleUpdate = useCallback(
        (newTitle: string) => {
            try {
                const result = MapTitleManager.updateMapTitle(mapText, newTitle);
                mutateMapText(result.updatedMapText);
            } catch (error) {
                console.error('Failed to update map title:', error);
            }
        },
        [mapText, mutateMapText],
    );

    useEffect(() => {
        if (Viewer.current) {
            const element = Viewer.current;
            if (element && element.setState) {
                element.setState(value);
            }
        }
    }, [value]);

    // Listen for panel restore completion
    useEffect(() => {
        const handlePanelResize = (event: CustomEvent) => {
            console.log('UnifiedMapCanvas: Received panelResize event', event.detail);
            setWaitingForPanelRestore(false);
        };

        // Check if we need to wait for panel restoration
        const checkPanelRestore = () => {
            if (typeof window !== 'undefined') {
                const savedWidth = localStorage.getItem('resizableSplitPane_leftWidth');
                if (savedWidth) {
                    console.log('UnifiedMapCanvas: Waiting for panel restore');
                    setWaitingForPanelRestore(true);
                }
            }
        };

        checkPanelRestore();
        window.addEventListener('panelResize', handlePanelResize as EventListener);

        return () => {
            window.removeEventListener('panelResize', handlePanelResize as EventListener);
        };
    }, [setWaitingForPanelRestore]);

    useEffect(() => {
        if (mapDimensions.width > 0 && mapDimensions.height > 0 && !waitingForPanelRestore) {
            console.log('Initial fit effect triggered', {
                width: mapDimensions.width,
                height: mapDimensions.height,
                canvasWidth: mapCanvasDimensions.width,
                canvasHeight: mapCanvasDimensions.height,
                components: wardleyMap.components.length,
                waitingForPanelRestore,
            });

            const performDelayedFit = () => {
                console.log('performDelayedFit called');
                if (Viewer.current && Viewer.current.fitSelection) {
                    // Check if map has actually rendered components
                    const mapContainer = document.getElementById('map');
                    const renderedComponents = mapContainer?.querySelectorAll('circle, rect');

                    console.log('Checking rendered components:', renderedComponents?.length);

                    if (renderedComponents && renderedComponents.length > 0) {
                        console.log('Components found, scheduling fit');
                        // Shorter delay since we've already waited for panel restore
                        setTimeout(() => {
                            if (Viewer.current && Viewer.current.fitSelection) {
                                console.log('EXECUTING INITIAL FIT TO SELECTION');
                                // Gentle fit with conservative margins
                                Viewer.current.fitSelection(
                                    -60, // Margin for value chain labels on left
                                    -70, // Margin for title at top
                                    mapDimensions.width + 80, // Margin for evolution labels on right
                                    mapDimensions.height + 90, // Margin for evolution labels at bottom
                                );
                                // Mark sizing as complete
                                setIsInitialSizingComplete(true);
                            }
                        }, 300); // Reduced delay since panel restore is already complete
                    } else {
                        console.log('Components not rendered yet, retrying...');
                        // Components not rendered yet, try again
                        setTimeout(performDelayedFit, 200);
                    }
                } else {
                    console.log('Viewer.current or fitSelection not available');
                }
            };

            // Start the fit process after a shorter delay
            const timer = setTimeout(performDelayedFit, 100);
            return () => clearTimeout(timer);
        } else {
            console.log('Initial fit conditions not met', {
                width: mapDimensions.width,
                height: mapDimensions.height,
                canvasWidth: mapCanvasDimensions.width,
                canvasHeight: mapCanvasDimensions.height,
                components: wardleyMap.components.length,
                waitingForPanelRestore,
            });
        }
    }, [mapDimensions.width, mapDimensions.height, mapCanvasDimensions.width, mapCanvasDimensions.height, waitingForPanelRestore, setIsInitialSizingComplete, wardleyMap.components.length]);

    // Style configuration
    const fill = {
        wardley: 'url(#wardleyGradient)',
        colour: 'white',
        plain: 'white',
        handwritten: 'white',
        dark: '#353347',
    };

    const svgBackground = mapStyleDefs.className === 'wardley' ? 'white' : fill[mapStyleDefs.className as keyof typeof fill] || 'white';

    const getCursorStyle = useCallback(() => {
        if (props.selectedToolbarItem) {
            if (props.selectedToolbarItem.toolType === 'drawing') {
                return 'crosshair';
            }
            return 'crosshair'; // For placement and method application tools
        }
        return 'default';
    }, [props.selectedToolbarItem]);

    // Handle case where no panel restore is needed
    useEffect(() => {
        if (!waitingForPanelRestore && typeof window !== 'undefined') {
            const savedWidth = localStorage.getItem('resizableSplitPane_leftWidth');
            if (!savedWidth) {
                // No saved width, no need to wait for panel restore
                setIsInitialSizingComplete(true);
            }
        }
    }, [waitingForPanelRestore]);

    // Fallback timeout to ensure loading state doesn't persist indefinitely
    useEffect(() => {
        const fallbackTimer = setTimeout(() => {
            if (!isInitialSizingComplete) {
                console.warn('UnifiedMapCanvas: Fallback timeout - forcing sizing complete');
                setIsInitialSizingComplete(true);
            }
        }, 3000); // 3 second fallback

        return () => clearTimeout(fallbackTimer);
    }, [isInitialSizingComplete]);

    return (
        <div id="map-canvas" style={{width: '100%', height: '100%', position: 'relative'}}>
            {!isInitialSizingComplete && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}>
                    <div
                        style={{
                            fontSize: '14px',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                border: '2px solid #f3f3f3',
                                borderTop: '2px solid #0085d0',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }}></div>
                        Loading map...
                    </div>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}
            <UncontrolledReactSVGPanZoom
                ref={Viewer}
                SVGBackground={svgBackground}
                background="white"
                tool={tool}
                width={mapCanvasDimensions.width || window.innerWidth - 100} // Use larger fallback width
                height={mapCanvasDimensions.height || window.innerHeight - 200} // Use larger fallback height
                detectAutoPan={false}
                detectWheel={allowMapZoomMouseWheel && !editingState.isEditing}
                miniatureProps={{
                    position: 'none',
                    background: '#eee',
                    width: 200,
                    height: 200,
                }}
                toolbarProps={{
                    position: 'none',
                }}
                preventPanOutside={false}
                onClick={handleMapClick}
                onDoubleClick={handleMapDoubleClick}
                onMouseMove={handleMapMouseMove}
                onMouseUp={handleMapMouseUp}
                onZoom={handleZoomChange}
                scaleFactorOnWheel={allowMapZoomMouseWheel ? 1.1 : 1}
                style={{
                    userSelect: 'none',
                    fontFamily: mapStyleDefs.fontFamily,
                    cursor: getCursorStyle(),
                    width: '100%',
                    height: '100%', // Use full height since toolbar is now fixed position
                    display: 'block',
                    opacity: isInitialSizingComplete ? 1 : 0,
                    transition: isInitialSizingComplete ? 'opacity 0.3s ease-in' : 'none',
                }}>
                <svg
                    className={[mapStyleDefs.className, 'mapCanvas'].join(' ')}
                    width={mapDimensions.width + 105}
                    height={mapDimensions.height + 137}
                    viewBox={`-35 -45 ${mapDimensions.width + 105} ${mapDimensions.height + 137}`}
                    id="svgMap"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    onContextMenu={e => {
                        // Only handle canvas context menu if clicking on the SVG background (not on components)
                        if (e.target === e.currentTarget && props.onCanvasContextMenu) {
                            e.preventDefault();
                            e.stopPropagation();
                            props.onCanvasContextMenu(e);
                        }
                    }}>
                    {/* Canvas background for context menu - must be first so it's behind everything */}
                    <rect
                        x="-35"
                        y="-45"
                        width={mapDimensions.width + 105}
                        height={mapDimensions.height + 137}
                        fill="transparent"
                        onContextMenu={e => {
                            if (props.onCanvasContextMenu) {
                                e.preventDefault();
                                e.stopPropagation();
                                props.onCanvasContextMenu(e);
                            }
                        }}
                        style={{pointerEvents: 'all'}}
                    />

                    <MapGridGroup
                        mapDimensions={mapDimensions}
                        mapStyleDefs={mapStyleDefs}
                        mapEvolutionStates={mapEvolutionStates}
                        evolutionOffsets={evolutionOffsets}
                        mapTitle={wardleyMap.title}
                        mapText={mapText}
                        onTitleUpdate={handleTitleUpdate}
                    />

                    <DebugOverlay enabled={DEBUG_COORDINATES} lastClickPosition={lastClickPosition} />
                    <UnifiedMapContent
                        mapElements={mapElements}
                        mapDimensions={mapDimensions}
                        mapStyleDefs={mapStyleDefs}
                        launchUrl={launchUrl}
                        mapAttitudes={wardleyMap.attitudes}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        scaleFactor={scaleFactor}
                        mapElementsClicked={mapElementsClicked}
                        links={processedLinks}
                        evolutionOffsets={evolutionOffsets}
                        enableNewPipelines={true}
                        setHighlightLine={setHighlightLine}
                        clicked={clicked}
                        enableAccelerators={enableAccelerators}
                        mapAccelerators={wardleyMap.accelerators.map((accelerator: any) => ({
                            ...accelerator,
                            type: accelerator.deaccelerator ? 'deaccelerator' : 'accelerator',
                            label: accelerator.label || {x: 0, y: 0},
                        }))}
                        mapNotes={wardleyMap.notes}
                        mapAnnotations={wardleyMap.annotations}
                        mapAnnotationsPresentation={mapAnnotationsPresentation}
                        mapMethods={wardleyMap.methods}
                        linkingState={props.linkingState}
                        sourceComponent={props.sourceComponent}
                        mousePosition={currentMousePosition}
                        highlightedComponent={props.highlightedComponent}
                        isDuplicateLink={props.isDuplicateLink}
                        isInvalidTarget={props.isInvalidTarget}
                        showCancellationHint={props.showCancellationHint}
                        isSourceDeleted={props.isSourceDeleted}
                        isTargetDeleted={props.isTargetDeleted}
                        isDrawing={props.isDrawing}
                        drawingStartPosition={props.drawingStartPosition}
                        drawingCurrentPosition={props.drawingCurrentPosition}
                        selectedToolbarItem={props.selectedToolbarItem}
                        methodHighlightedComponent={props.methodHighlightedComponent}
                        hoveredPSTElement={hoveredPSTElement}
                        resizingPSTElement={resizingPSTElement}
                        resizeHandle={resizeHandle}
                        resizePreviewBounds={resizePreviewBounds}
                        keyboardModifiers={keyboardModifiers}
                        onPSTHover={handlePSTHover}
                        onPSTResizeStart={handlePSTResizeStart}
                        onPSTResizeMove={handlePSTResizeMove}
                        onPSTResizeEnd={handlePSTResizeEnd}
                        draggingPSTElement={draggingPSTElement}
                        dragPreviewBounds={dragPreviewBounds}
                        onPSTDragStart={handlePSTDragStart}
                        onPSTDragMove={handlePSTDragMove}
                        onPSTDragEnd={handlePSTDragEnd}
                        onLinkClick={props.onLinkClick}
                        onLinkContextMenu={props.onLinkContextMenu}
                        isLinkSelected={props.isLinkSelected}
                    />
                </svg>
            </UncontrolledReactSVGPanZoom>
            {showMapToolbar && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px', // Reduced from 60px to 20px, saving 40px
                        left: '20px',
                        zIndex: 1000,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        padding: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0,0,0,0.1)',
                    }}>
                    <MapCanvasToolbar
                        shouldHideNav={props.shouldHideNav || (() => {})}
                        hideNav={props.hideNav || false}
                        tool={tool}
                        handleChangeTool={(_event, newTool) => setTool(newTool)}
                        _fitToViewer={() => {
                            if (Viewer.current) {
                                // Use conservative margins to avoid clipping
                                if (Viewer.current.fitSelection) {
                                    Viewer.current.fitSelection(
                                        -60, // Margin for value chain labels on left
                                        -70, // Margin for title at top
                                        mapDimensions.width + 80, // Margin for evolution labels on right
                                        mapDimensions.height + 90, // Margin for evolution labels at bottom
                                    );
                                }
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default UnifiedMapCanvas;
