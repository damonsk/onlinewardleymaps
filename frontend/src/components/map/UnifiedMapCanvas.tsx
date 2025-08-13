import React, {MouseEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ReactSVGPanZoom, TOOL_NONE, UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
import {MapElements} from '../../processing/MapElements';
import {processLinks} from '../../utils/mapProcessing';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import {useModKeyPressedConsumer} from '../KeyPressContext';
import {useEditing} from '../EditingContext';
import MapCanvasToolbar from './MapCanvasToolbar';
import MapGridGroup from './MapGridGroup';
import UnifiedMapContent from './UnifiedMapContent';
import {useMapEventHandlers} from './hooks/useMapEventHandlers';
import {DebugOverlay} from './debug/DebugOverlay';
import {UnifiedMapCanvasProps} from './types/MapCanvasProps';
import {findNearestComponent} from '../../utils/componentDetection';

// Debug mode for coordinate issues - set to false to disable debug indicators
const DEBUG_COORDINATES = false;

function UnifiedMapCanvas(props: UnifiedMapCanvasProps) {
    const featureSwitches = useFeatureSwitches();
    const {enableAccelerators, showMapToolbar, allowMapZoomMouseWheel} = featureSwitches;

    // State to track the last click position for debugging
    const [lastClickPosition, setLastClickPosition] = useState<{
        x: number;
        y: number;
        correctedX?: number;
        correctedY?: number;
    } | null>(null);

    // State to track current mouse position for linking preview
    const [currentMousePosition, setCurrentMousePosition] = useState<{x: number; y: number}>({x: 0, y: 0});

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

    const isModKeyPressed = useModKeyPressedConsumer();
    const {isAnyElementEditing} = useEditing();
    const Viewer = useRef<ReactSVGPanZoom>(null);

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

    const [enableZoomOnClick] = useState(true);
    const [tool, setTool] = useState(TOOL_NONE as any);
    const [scaleFactor, setScaleFactor] = useState(1);
    const [value, setValue] = useState({
        version: 2 as const,
        mode: TOOL_NONE as any,
        focus: false,
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
        viewerWidth: mapCanvasDimensions.width,
        viewerHeight: mapCanvasDimensions.height,
        SVGWidth: mapDimensions.width + 105,
        SVGHeight: mapDimensions.height + 137,
        miniatureOpen: false,
    });

    const [mapElementsClicked, setMapElementsClicked] = useState<
        Array<{
            el: any;
            e: MouseEvent<Element>;
        }>
    >([]);

    // Disable pan/zoom when editing is active
    useEffect(() => {
        if (isAnyElementEditing()) {
            setTool(TOOL_NONE);
        }
    }, [isAnyElementEditing]);

    useEffect(() => {
        if (!isModKeyPressed && mapElementsClicked.length > 0) {
            setMapElementsClicked([]);
        }
    }, [isModKeyPressed, mapElementsClicked]);

    const handleZoomChange = (newValue: any) => {
        setValue(newValue);
        setScaleFactor(newValue.a); // a is the scale factor
    };

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

            // Original linking functionality (fallback for old behavior)
            if (isModKeyPressed === false) return;
            if (ctx.e === null) return;
            const s = [...mapElementsClicked, {el: ctx.el, e: ctx.e}];
            if (s.length === 2) {
                mutateMapText(mapText + '\r\n' + s.map(r => r.el.name).join('->'));
                setMapElementsClicked([]);
            } else setMapElementsClicked(s);
        },
        [
            isModKeyPressed,
            mapElementsClicked,
            setHighlightLine,
            mutateMapText,
            mapText,
            props.selectedToolbarItem,
            props.onMethodApplication,
            props.onComponentClick,
        ],
    );

    useEffect(() => {
        if (Viewer.current) {
            const element = Viewer.current;
            if (element && element.setState) {
                element.setState(value);
            }
        }
    }, [value]);

    useEffect(() => {
        if (mapDimensions.width > 0 && mapDimensions.height > 0) {
            console.log('Initial fit effect triggered', {
                width: mapDimensions.width,
                height: mapDimensions.height,
                components: wardleyMap.components.length,
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
                        // Wait for any localStorage restoration or other initialization to complete
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
                            }
                        }, 1500); // Wait for localStorage restoration to complete
                    } else {
                        console.log('Components not rendered yet, retrying...');
                        // Components not rendered yet, try again
                        setTimeout(performDelayedFit, 300);
                    }
                } else {
                    console.log('Viewer.current or fitSelection not available');
                }
            };

            // Start the fit process after a delay
            const timer = setTimeout(performDelayedFit, 800);
            return () => clearTimeout(timer);
        } else {
            console.log('Initial fit conditions not met', {
                width: mapDimensions.width,
                height: mapDimensions.height,
                components: wardleyMap.components.length,
            });
        }
    }, [mapDimensions.width, mapDimensions.height]);

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

    return (
        <div id="map-canvas" style={{width: '100%', height: '100%', position: 'relative'}}>
            <UncontrolledReactSVGPanZoom
                ref={Viewer}
                SVGBackground={svgBackground}
                background="white"
                tool={tool}
                width={mapCanvasDimensions.width || window.innerWidth - 100} // Use larger fallback width
                height={mapCanvasDimensions.height || window.innerHeight - 200} // Use larger fallback height
                detectAutoPan={false}
                detectWheel={allowMapZoomMouseWheel && !isAnyElementEditing()}
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
                }}>
                <svg
                    className={[mapStyleDefs.className, 'mapCanvas'].join(' ')}
                    width={mapDimensions.width + 105}
                    height={mapDimensions.height + 137}
                    viewBox={`-35 -45 ${mapDimensions.width + 105} ${mapDimensions.height + 137}`}
                    id="svgMap"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink">
                    <MapGridGroup
                        mapDimensions={mapDimensions}
                        mapStyleDefs={mapStyleDefs}
                        mapEvolutionStates={mapEvolutionStates}
                        evolutionOffsets={evolutionOffsets}
                        mapTitle={wardleyMap.title}
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
