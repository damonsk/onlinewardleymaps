// Phase 4: Component Interface Modernization
// Modern UnifiedMapCanvas that accepts UnifiedWardleyMap directly
// This component reduces the prop drilling with a clean unified interface

import React, { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ReactSVGPanZoom, TOOL_NONE } from 'react-svg-pan-zoom';
import {
    EvolutionStages,
    MapCanvasDimensions,
    MapDimensions,
    Offsets,
} from '../../constants/defaults';
import { UnifiedMapElements } from '../../processing/UnifiedMapElements';
import { MapTheme } from '../../types/map/styles';
import { UnifiedWardleyMap } from '../../types/unified/map';
import { processLinks } from '../../utils/mapProcessing';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import { useModKeyPressedConsumer } from '../KeyPressContext';
import MapCanvasToolbar from './MapCanvasToolbar';
import MapGridGroup from './MapGridGroup';
import MapSVGContainer from './MapSVGContainer';
import ModernUnifiedMapContent from './ModernUnifiedMapContent';

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
    setNewComponentContext: React.Dispatch<
        React.SetStateAction<{ x: string; y: string } | null>
    >;
    launchUrl: (urlId: string) => void;
    showLinkedEvolved: boolean;

    // Annotations
    mapAnnotationsPresentation: any;

    // Optional handlers
    handleMapCanvasClick?: (pos: { x: number; y: number }) => void;
}

function ModernUnifiedMapCanvas(props: ModernUnifiedMapCanvasProps) {
    const featureSwitches = useFeatureSwitches();
    const { enableAccelerators, showMapToolbar, allowMapZoomMouseWheel } =
        featureSwitches;

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

    // Create UnifiedMapElements instance from the wardley map data
    const mapElements = useMemo(() => {
        return new UnifiedMapElements(wardleyMap);
    }, [wardleyMap]);

    // Process links using the UnifiedMapElements instance
    const processedLinks = useMemo(() => {
        return processLinks(
            wardleyMap.links.map((link) => ({
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
            wardleyMap.anchors.map((anchor) => ({
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
        SVGWidth: mapDimensions.width + 2,
        SVGHeight: mapDimensions.height + 4,
        miniatureOpen: false,
    });

    // Update scale factor when zoom value changes
    useEffect(() => {
        setScaleFactor(value.a);
    }, [value.a]);

    // For modern interface, we don't need the complex interaction handlers
    // We'll use a simplified approach that focuses on the map interactions we need
    const [mapElementsClicked, setMapElementsClicked] = useState<
        Array<{
            el: any;
            e: MouseEvent<Element>;
        }>
    >([]);

    const handleMapClick = (event: any) => {
        if (enableZoomOnClick && props.handleMapCanvasClick) {
            // Extract position from event and call the handler
            const pos = { x: event.x || 0, y: event.y || 0 };
            props.handleMapCanvasClick(pos);
        }
    };

    const handleMapDoubleClick = (event: any) => {
        if (enableZoomOnClick) {
            // Handle double click to add new component
            const pos = { x: event.x || 0, y: event.y || 0 };
            setNewComponentContext({
                x: pos.x.toString(),
                y: pos.y.toString(),
            });
        }
    };

    const handleMapMouseMove = () => {
        // Handle mouse move if needed
    };

    const clicked = function (ctx: { el: any; e: MouseEvent<Element> | null }) {
        console.log('mapElementsClicked::clicked', ctx);
        setHighlightLine(ctx.el.line || 0);
        if (isModKeyPressed === false) return;
        if (ctx.e === null) return;
        const s = [...mapElementsClicked, { el: ctx.el, e: ctx.e }];
        if (s.length === 2) {
            mutateMapText(
                mapText + '\r\n' + s.map((r) => r.el.name).join('->'),
            );
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

    return (
        <div id="map-canvas">
            <ReactSVGPanZoom
                ref={Viewer}
                width={mapCanvasDimensions.width}
                height={mapCanvasDimensions.height}
                value={value}
                onChangeValue={setValue}
                tool={tool}
                onChangeTool={setTool}
                miniatureProps={{
                    position: 'none',
                    background: '#fff',
                    width: 200,
                    height: 200,
                }}
                toolbarProps={{
                    position: 'none',
                }}
                detectAutoPan={false}
                preventPanOutside={false}
                onClick={handleMapClick}
                onDoubleClick={handleMapDoubleClick}
                onMouseMove={handleMapMouseMove}
                scaleFactorOnWheel={allowMapZoomMouseWheel ? 1.1 : 1}
            >
                <MapSVGContainer
                    viewerRef={Viewer}
                    tool={tool}
                    mapCanvasDimensions={mapCanvasDimensions}
                    mapDimensions={mapDimensions}
                    allowMapZoomMouseWheel={allowMapZoomMouseWheel}
                    showMiniMap={false}
                    mapStyleDefs={mapStyleDefs}
                    onDoubleClick={handleMapDoubleClick}
                    onZoom={(value) => setValue(value)}
                >
                    <MapGridGroup
                        mapDimensions={mapDimensions}
                        mapStyleDefs={mapStyleDefs}
                        mapEvolutionStates={mapEvolutionStates}
                        evolutionOffsets={evolutionOffsets}
                        mapTitle={wardleyMap.title}
                    />
                    <ModernUnifiedMapContent
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
                        mapAccelerators={wardleyMap.accelerators.map(
                            (accelerator: any) => ({
                                ...accelerator,
                                type: accelerator.deaccelerator
                                    ? 'deaccelerator'
                                    : 'accelerator',
                                label: accelerator.label || { x: 0, y: 0 },
                            }),
                        )}
                        mapNotes={wardleyMap.notes}
                        mapAnnotations={wardleyMap.annotations}
                        mapAnnotationsPresentation={mapAnnotationsPresentation}
                        mapMethods={wardleyMap.methods}
                    />
                </MapSVGContainer>
            </ReactSVGPanZoom>
            {showMapToolbar && (
                <MapCanvasToolbar
                    shouldHideNav={() => {}}
                    hideNav={false}
                    tool={tool}
                    handleChangeTool={(event, newTool) => setTool(newTool)}
                    _fitToViewer={() => {
                        if (Viewer.current) {
                            Viewer.current.fitSelection(
                                -35,
                                -45,
                                mapDimensions.width + 70,
                                mapDimensions.height + 92,
                            );
                        }
                    }}
                />
            )}
        </div>
    );
}

export default ModernUnifiedMapCanvas;
