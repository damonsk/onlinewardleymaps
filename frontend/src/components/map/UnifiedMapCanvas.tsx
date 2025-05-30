import React, {
    MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { ReactSVGPanZoom } from 'react-svg-pan-zoom';
import { useMapInteractions } from '../../hooks/useMapInteractions';
import { processLinks } from '../../utils/mapProcessing';

// Import unified system
import { UnifiedConverter } from '../../conversion/UnifiedConverter';
import { UnifiedMapElements } from '../../processing/UnifiedMapElements';
import { MapElement } from '../../types/base';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import { useModKeyPressedConsumer } from '../KeyPressContext';
import MapCanvasToolbar from './MapCanvasToolbar';
import MapGridGroup from './MapGridGroup';
import { MapSVGContainer } from './MapSVGContainer';
import { MapViewProps } from './MapView';
import UnifiedMapContent from './UnifiedMapContent';

// Add any missing properties that aren't in MapViewProps but are needed by MapCanvas
interface UnifiedMapCanvasProps extends MapViewProps {
    handleMapCanvasClick?: (pos: { x: number; y: number }) => void;
}

/**
 * UnifiedMapCanvas - Updated version that uses the unified type system
 * This eliminates the need for conversion functions and simplifies the data flow
 */
function UnifiedMapCanvas(props: UnifiedMapCanvasProps) {
    const featureSwitches = useFeatureSwitches();
    const {
        enableAccelerators,
        enableNewPipelines,
        showMapToolbar,
        showMiniMap,
        allowMapZoomMouseWheel,
    } = featureSwitches;

    const {
        mapText,
        mutateMapText,
        setHighlightLine,
        setNewComponentContext,
        showLinkedEvolved,
        launchUrl,
        mapDimensions,
        mapCanvasDimensions,
        mapStyleDefs,
        shouldHideNav,
        mapTitle,
        evolutionOffsets,
        mapEvolutionStates,
        mapAnnotationsPresentation,
    } = props;

    console.log('UnifiedMapCanvas', props);
    const isModKeyPressed = useModKeyPressedConsumer();
    const Viewer = useRef<ReactSVGPanZoom>(null);

    // Create unified converter and process map text directly
    const unifiedConverter = useMemo(() => {
        return new UnifiedConverter(featureSwitches);
    }, [featureSwitches]);

    // Parse map text into unified types - no conversion needed!
    const unifiedMap = useMemo(() => {
        try {
            return unifiedConverter.parse(mapText);
        } catch (error) {
            console.error('Error parsing map text:', error);
            // Return empty map if parsing fails
            return {
                title: '',
                components: [],
                anchors: [],
                submaps: [],
                markets: [],
                ecosystems: [],
                evolved: [],
                pipelines: [],
                links: [],
                annotations: [],
                notes: [],
                methods: [],
                attitudes: [],
                accelerators: [],
                evolution: [],
                presentation: {
                    style: '',
                    annotations: { visibility: 0, maturity: 0 },
                    size: { width: 0, height: 0 },
                },
                urls: [],
                errors: [],
            };
        }
    }, [mapText, unifiedConverter]);

    // Create unified map elements processor - simplified!
    const mapElements = useMemo(() => {
        return new UnifiedMapElements(unifiedMap);
    }, [unifiedMap]);

    const mousePositionRef = useRef({ x: 0, y: 0 });
    // const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    const {
        tool,
        scaleFactor,
        handleZoom,
        handleChangeTool,
        newElementAt,
        setScaleFactor,
    } = useMapInteractions({
        setNewComponentContext,
        mapDimensions,
    });

    const [mapElementsClicked, setMapElementsClicked] = useState<
        Array<{
            el: MapElement;
            e: MouseEvent<Element>;
        }>
    >([]);

    useEffect(() => {
        if (isModKeyPressed === false) {
            setMapElementsClicked([]);
        }
        console.log('mapElementsClicked::isModKeyPressed', isModKeyPressed);
    }, [isModKeyPressed]);

    const clicked = function (ctx: {
        el: MapElement;
        e: MouseEvent<Element> | null;
    }) {
        console.log('mapElementsClicked::clicked', ctx);
        setHighlightLine(ctx.el.line);
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
        console.log('mapElementsClicked', mapElementsClicked);
    }, [mapElementsClicked]);

    const handleMouseMove = useCallback((event: MouseEvent) => {
        mousePositionRef.current = { x: event.clientX, y: event.clientY };
    }, []);

    // Process links with new mapElements
    const links = useMemo(() => {
        // Convert unified links to legacy format for processLinks function
        const legacyMapLinks = unifiedMap.links.map((link) => ({
            ...link,
            // Ensure required properties are present for MapLinks interface
            flow: link.flow ?? false,
            future: link.future ?? false,
            past: link.past ?? false,
            context: link.context ?? '',
            flowValue: link.flowValue ?? '',
        }));

        return processLinks(
            legacyMapLinks,
            mapElements as any,
            unifiedMap.anchors as any,
            showLinkedEvolved,
        );
    }, [unifiedMap.links, mapElements, unifiedMap.anchors, showLinkedEvolved]);

    const fitToViewer = () => {
        if (Viewer.current) {
            Viewer.current.fitSelection(
                -35,
                -45,
                mapDimensions.width + 70,
                mapDimensions.height + 92,
            );
        }
    };

    useEffect(() => {
        if (Viewer.current) {
            fitToViewer();
        }
    }, []);

    return (
        <React.Fragment>
            <MapSVGContainer
                viewerRef={Viewer}
                tool={tool}
                mapCanvasDimensions={mapCanvasDimensions}
                mapDimensions={mapDimensions}
                allowMapZoomMouseWheel={allowMapZoomMouseWheel}
                showMiniMap={showMiniMap}
                mapStyleDefs={mapStyleDefs}
                onDoubleClick={newElementAt}
                onZoom={handleZoom}
                onZoomReset={() => setScaleFactor(1)}
                onMouseMove={handleMouseMove}
            >
                <defs>
                    <filter id="dropshadow" width="200%" height="200%">
                        <feDropShadow
                            dx="0"
                            dy="0"
                            stdDeviation="5"
                            floodColor="#000"
                            floodOpacity="0.5"
                        />
                    </filter>
                </defs>

                <MapGridGroup
                    mapStyleDefs={mapStyleDefs}
                    mapDimensions={mapDimensions}
                    mapTitle={mapTitle}
                    evolutionOffsets={evolutionOffsets}
                    mapEvolutionStates={mapEvolutionStates}
                />

                <UnifiedMapContent
                    mapAttitudes={unifiedMap.attitudes}
                    mapDimensions={mapDimensions}
                    mapStyleDefs={mapStyleDefs}
                    mapText={mapText}
                    mutateMapText={mutateMapText}
                    scaleFactor={scaleFactor}
                    mapElementsClicked={mapElementsClicked}
                    links={links}
                    mapElements={mapElements}
                    evolutionOffsets={evolutionOffsets}
                    enableNewPipelines={enableNewPipelines}
                    setHighlightLine={setHighlightLine}
                    clicked={(ctx: {
                        el: MapElement;
                        e: MouseEvent<Element> | null;
                    }) => clicked(ctx)}
                    enableAccelerators={enableAccelerators}
                    mapAccelerators={unifiedMap.accelerators.map((acc) => ({
                        ...acc,
                        type: 'accelerator' as const,
                        label: { x: 0, y: 0 },
                    }))}
                    mapNotes={unifiedMap.notes}
                    mapAnnotations={unifiedMap.annotations}
                    mapAnnotationsPresentation={mapAnnotationsPresentation}
                    launchUrl={launchUrl}
                    mapMethods={unifiedMap.methods}
                />
            </MapSVGContainer>
            {showMapToolbar && (
                <MapCanvasToolbar
                    shouldHideNav={shouldHideNav}
                    mapStyleDefs={mapStyleDefs}
                    hideNav={false}
                    tool={tool}
                    handleChangeTool={handleChangeTool}
                    _fitToViewer={fitToViewer}
                />
            )}
        </React.Fragment>
    );
}

export default UnifiedMapCanvas;
