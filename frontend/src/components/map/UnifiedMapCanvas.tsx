// Phase 4: Component Interface Modernization
// Modern UnifiedMapCanvas that accepts UnifiedWardleyMap directly
// This component reduces the prop drilling with a clean unified interface

import React, {MouseEvent, useEffect, useMemo, useRef, useState} from 'react';
import {ReactSVGPanZoom, TOOL_NONE, UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../constants/defaults';
import {MapElements} from '../../processing/MapElements';
import {MapTheme} from '../../types/map/styles';
import {UnifiedWardleyMap} from '../../types/unified/map';
import {processLinks} from '../../utils/mapProcessing';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import {useModKeyPressedConsumer} from '../KeyPressContext';
import MapCanvasToolbar from './MapCanvasToolbar';
import MapGridGroup from './MapGridGroup';
import PositionCalculator from './PositionCalculator';
import UnifiedMapContent from './UnifiedMapContent';

interface ModernUnifiedMapCanvasProps {
    // Core unified data
    wardleyMap: UnifiedWardleyMap;

    // Display configuration
    mapDimensions: MapDimensions;
    mapCanvasDimensions: MapCanvasDimensions;
    mapStyleDefs: MapTheme;
    mapEvolutionStates: EvolutionStages;
    evolutionOffsets: Offsets;

    // Text and mutations
    mapText: string;
    mutateMapText: (newText: string) => void;

    // Interaction handlers
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    setNewComponentContext: React.Dispatch<React.SetStateAction<{x: string; y: string} | null>>;
    launchUrl: (urlId: string) => void;
    showLinkedEvolved: boolean;

    // Navigation control
    shouldHideNav?: () => void;
    hideNav?: boolean;

    // Annotations
    mapAnnotationsPresentation: any;

    // Optional handlers
    handleMapCanvasClick?: (pos: {x: number; y: number}) => void;
}

function UnifiedMapCanvas(props: ModernUnifiedMapCanvasProps) {
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

    const isModKeyPressed = useModKeyPressedConsumer();
    const Viewer = useRef<ReactSVGPanZoom>(null);

    // Create MapElements instance from the wardley map data
    const mapElements = useMemo(() => {
        return new MapElements(wardleyMap);
    }, [wardleyMap]);

    // Process links using the UnifiedMapElements instance
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

    // We'll keep the value state for reference but won't use it with UncontrolledReactSVGPanZoom
    // This helps us track zoom level for other component needs
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

    // Handle zoom changes by updating our local scaleFactor state
    const handleZoomChange = (newValue: any) => {
        setValue(newValue);
        setScaleFactor(newValue.a); // a is the scale factor
    };

    // For modern interface, we don't need the complex interaction handlers
    // We'll use a simplified approach that focuses on the map interactions we need
    const [mapElementsClicked, setMapElementsClicked] = useState<
        Array<{
            el: any;
            e: MouseEvent<Element>;
        }>
    >([]);

    // Clear mapElementsClicked when mod key is released
    useEffect(() => {
        if (!isModKeyPressed && mapElementsClicked.length > 0) {
            setMapElementsClicked([]);
        }
    }, [isModKeyPressed, mapElementsClicked]);

    const handleMapClick = (event: any) => {
        if (enableZoomOnClick && props.handleMapCanvasClick) {
            // Extract position from event and call the handler
            const pos = {x: event.x || 0, y: event.y || 0};
            props.handleMapCanvasClick(pos);
        }
    };

    const handleMapDoubleClick = (event: any) => {
        if (enableZoomOnClick) {
            // Handle double click to add new component
            const svgPos = {x: event.x || 0, y: event.y || 0};

            // Convert SVG coordinates to maturity/visibility values
            const positionCalc = new PositionCalculator();
            const maturity = parseFloat(positionCalc.xToMaturity(svgPos.x, mapDimensions.width));
            const visibility = parseFloat(positionCalc.yToVisibility(svgPos.y, mapDimensions.height));

            console.log('Double-click coordinates:', {
                svgX: svgPos.x,
                svgY: svgPos.y,
                maturity,
                visibility,
            });

            // Pass maturity and visibility values directly
            setNewComponentContext({
                x: maturity.toFixed(2),
                y: visibility.toFixed(2),
            });
        }
    };

    const handleMapMouseMove = () => {
        // Handle mouse move if needed
    };

    const clicked = function (ctx: {el: any; e: MouseEvent<Element> | null}) {
        console.log('mapElementsClicked::clicked', ctx);
        setHighlightLine(ctx.el.line || 0);
        if (isModKeyPressed === false) return;
        if (ctx.e === null) return;
        const s = [...mapElementsClicked, {el: ctx.el, e: ctx.e}];
        if (s.length === 2) {
            mutateMapText(mapText + '\r\n' + s.map(r => r.el.name).join('->'));
            setMapElementsClicked([]);
        } else setMapElementsClicked(s);
    };

    useEffect(() => {
        if (Viewer.current) {
            const element = Viewer.current;
            if (element && element.setState) {
                element.setState(value);
            }
        }
    }, [value]);

    // Gentle initial fit that happens after all initialization is complete
    useEffect(() => {
        // Only run when we have valid dimensions and components to render
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
    }, [mapDimensions.width, mapDimensions.height]); // Removed wardleyMap.components.length dependency

    // Note: Panel resize is now handled by dimension updates in MapEnvironment
    // Dimension updates will automatically trigger re-render with proper scaling
    // No need for manual fitSelection calls on panel resize

    // Get the correct background fill based on the map style
    const fill = {
        wardley: 'url(#wardleyGradient)',
        colour: 'white',
        plain: 'white',
        handwritten: 'white',
        dark: '#353347',
    };

    const svgBackground = mapStyleDefs.className === 'wardley' ? 'white' : fill[mapStyleDefs.className as keyof typeof fill] || 'white';

    return (
        <div id="map-canvas" style={{width: '100%', height: '100%', position: 'relative'}}>
            {/* Use UncontrolledReactSVGPanZoom directly instead of nested components */}
            <UncontrolledReactSVGPanZoom
                ref={Viewer}
                SVGBackground={svgBackground}
                background="white"
                tool={tool}
                width={mapCanvasDimensions.width || window.innerWidth - 100} // Use larger fallback width
                height={mapCanvasDimensions.height || window.innerHeight - 200} // Use larger fallback height
                // Removed value and onChangeValue props to prevent infinite update loop
                // UncontrolledReactSVGPanZoom manages its state internally
                detectAutoPan={false}
                detectWheel={allowMapZoomMouseWheel}
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
                onZoom={handleZoomChange}
                scaleFactorOnWheel={allowMapZoomMouseWheel ? 1.1 : 1}
                style={{
                    userSelect: 'none',
                    fontFamily: mapStyleDefs.fontFamily,
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
                        handleChangeTool={(event, newTool) => setTool(newTool)}
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
