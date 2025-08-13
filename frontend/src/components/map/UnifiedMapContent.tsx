import React, {MouseEvent} from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapElements} from '../../processing/MapElements';
import {MapTheme} from '../../types/map/styles';
import {PSTElement, PSTCoordinates, PSTBounds, ResizeHandle} from '../../types/map/pst';
import {UnifiedComponent} from '../../types/unified';
import {getMapElementsDecorated} from '../../utils/mapProcessing';
import AcceleratorSymbol from '../symbols/AcceleratorSymbol';
import ComponentSymbol from '../symbols/ComponentSymbol';
import EcosystemSymbol from '../symbols/EcosystemSymbol';
import MarketSymbol from '../symbols/MarketSymbol';
import PipelineComponentSymbol from '../symbols/PipelineComponentSymbol';
import SubMapSymbol from '../symbols/SubMapSymbol';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import Anchor from './Anchor';
import AnnotationBox from './AnnotationBox';
import AnnotationElement from './AnnotationElement';
import Attitude from './Attitude';
import ComponentLink from './ComponentLink';
import EvolvingComponentLink from './EvolvingComponentLink';
import FluidLink from './FluidLink';
import MapAccelerator from './MapAccelerator';
import MapComponent from './MapComponent';
import MapPipelines from './MapPipelines';
import MethodElement from './MethodElement';
import Note from './Note';
import LinkingPreview from './LinkingPreview';
import DrawingPreview from './DrawingPreview';
import PositionCalculator from './PositionCalculator';
import ModernPositionCalculator from './ModernPositionCalculator';

interface ModernUnifiedMapContentProps {
    mapAttitudes: any[];
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    mapText: string;
    mutateMapText: (text: string) => void;
    scaleFactor: number;
    mapElementsClicked: Array<{
        el: UnifiedComponent;
        e: MouseEvent<Element>;
    }>;
    links: any[];
    mapElements: MapElements;
    evolutionOffsets: {
        commodity: number;
        product: number;
        custom: number;
    };
    enableNewPipelines: boolean;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    clicked: (data: {el: any; e: MouseEvent<Element> | null}) => void;
    enableAccelerators: boolean;
    mapAccelerators: UnifiedComponent[];
    mapNotes: any[];
    mapAnnotations: any[];
    mapAnnotationsPresentation: any;
    launchUrl?: (url: string) => void;
    mapMethods: any[];
    // New props for linking functionality
    linkingState?: 'idle' | 'selecting-source' | 'selecting-target';
    sourceComponent?: UnifiedComponent | null;
    mousePosition?: {x: number; y: number};
    highlightedComponent?: UnifiedComponent | null;
    isDuplicateLink?: boolean;
    isInvalidTarget?: boolean;
    showCancellationHint?: boolean;
    isSourceDeleted?: boolean;
    isTargetDeleted?: boolean;
    // New props for PST drawing functionality
    isDrawing?: boolean;
    drawingStartPosition?: {x: number; y: number} | null;
    drawingCurrentPosition?: {x: number; y: number};
    selectedToolbarItem?: any;
    // New props for method application functionality
    methodHighlightedComponent?: UnifiedComponent | null;
    // New props for PST resize functionality
    hoveredPSTElement?: PSTElement | null;
    resizingPSTElement?: PSTElement | null;
    resizeHandle?: ResizeHandle | null;
    resizePreviewBounds?: PSTBounds | null;
    onPSTHover?: (element: PSTElement | null) => void;
    onPSTResizeStart?: (element: PSTElement, handle: ResizeHandle) => void;
    onPSTResizeMove?: (newBounds: PSTBounds) => void;
    onPSTResizeEnd?: (element: PSTElement, newCoordinates: PSTCoordinates) => void;
}

/**
 * Helper function to convert component coordinates to SVG coordinates
 * This accounts for the SVG viewBox offset (-35, -45) used in UnifiedMapCanvas
 * Same logic as used in DrawingPreview for consistent positioning
 */
const componentToSVGCoordinates = (component: UnifiedComponent, mapDimensions: {width: number; height: number}) => {
    const positionCalculator = new PositionCalculator();

    // Step 1: Convert map coordinates (0-1) back to adjusted coordinates
    const adjustedX = positionCalculator.maturityToX(component.maturity, mapDimensions.width);
    const adjustedY = positionCalculator.visibilityToY(component.visibility, mapDimensions.height);

    // Step 2: Remove the SVG viewBox offset to get raw SVG coordinates
    // In UnifiedMapCanvas: adjustedX = svgX + 35, adjustedY = svgY + 45
    // So: svgX = adjustedX - 35, svgY = adjustedY - 45
    const svgX = adjustedX - 35;
    const svgY = adjustedY - 45;

    return {x: svgX, y: svgY};
};

const UnifiedMapContent: React.FC<ModernUnifiedMapContentProps> = props => {
    const {
        mapDimensions,
        mapStyleDefs,
        mapText,
        mutateMapText,
        scaleFactor,
        mapElements,
        setHighlightLine,
        clicked,
        enableAccelerators,
        launchUrl,
    } = props;

    const featureSwitches = useFeatureSwitches();

    const setHighlightLineDispatch = (value: any) => {
        if (typeof value === 'function') {
            setHighlightLine(value(0));
        } else {
            setHighlightLine(value);
        }
    };

    const mapAnchors: UnifiedComponent[] = mapElements.getAllComponents().filter(c => c.type === 'anchor');

    const getElementByName = (elements: UnifiedComponent[], name: string) => elements.find(e => e.name === name);

    const passComponent = (component: any): any => {
        return component;
    };

    return (
        <g id="mapContent">
            {/* CSS animations for method application highlighting */}
            <defs>
                <style>
                    {`
                        @keyframes methodHighlightPulse {
                            0%, 100% {
                                stroke-opacity: 0.3;
                                stroke-width: 2;
                            }
                            50% {
                                stroke-opacity: 0.8;
                                stroke-width: 3;
                            }
                        }

                        .method-hover-circle {
                            animation: methodHighlightPulse 1.5s ease-in-out infinite;
                        }

                        .method-hover-circle:hover {
                            stroke: #4CAF50 !important;
                            stroke-width: 3 !important;
                            stroke-opacity: 0.8 !important;
                            stroke-dasharray: 0 !important;
                            animation: none !important;
                        }
                    `}
                </style>
            </defs>

            <g id="attitudes">
                {props.mapAttitudes &&
                    props.mapAttitudes.map((a: any, i: number) => (
                        <Attitude
                            key={i}
                            attitude={a}
                            mapDimensions={mapDimensions}
                            mapText={mapText}
                            mutateMapText={mutateMapText}
                            mapStyleDefs={mapStyleDefs}
                            scaleFactor={scaleFactor}
                        />
                    ))}
            </g>

            <g id="links">
                {props.links.map((current: any) => (
                    <g id={current.name} key={current.name}>
                        {current.links.map((l: any, i: number) => (
                            <ComponentLink
                                mapStyleDefs={mapStyleDefs}
                                key={i}
                                mapDimensions={mapDimensions}
                                startElement={l.startElement}
                                endElement={l.endElement}
                                link={l.link}
                                scaleFactor={scaleFactor}
                            />
                        ))}
                    </g>
                ))}
            </g>

            <g id="evolvedLinks">
                {mapElements.getEvolvingComponents().map(
                    (e: UnifiedComponent, i: number) =>
                        getElementByName(mapElements.getEvolvingComponents(), e.name) && (
                            <EvolvingComponentLink
                                key={i}
                                mapStyleDefs={mapStyleDefs}
                                mapDimensions={mapDimensions}
                                endElement={(() => {
                                    const element = getElementByName(mapElements.getEvolvedComponents(), e.name);
                                    return element ? passComponent(element) : undefined;
                                })()}
                                startElement={(() => {
                                    const element = getElementByName(mapElements.getEvolvingComponents(), e.name);
                                    return element ? passComponent(element) : undefined;
                                })()}
                                evolutionOffsets={
                                    props.evolutionOffsets || {
                                        commodity: 0,
                                        product: 0,
                                        custom: 0,
                                    }
                                }
                            />
                        ),
                )}
            </g>

            <g id="anchors">
                {mapAnchors.map((a: UnifiedComponent, i: number) => (
                    <Anchor
                        key={i}
                        mapDimensions={mapDimensions}
                        anchor={a}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        mapStyleDefs={mapStyleDefs}
                        onClick={() => setHighlightLine(a.line || 0)}
                    />
                ))}
            </g>

            <g id="fluidLinks">
                {props.mapElementsClicked &&
                    props.mapElementsClicked.map((current: any, i: number) => (
                        <FluidLink
                            key={`fluid-${i}`}
                            mapStyleDefs={mapStyleDefs}
                            mapDimensions={mapDimensions}
                            startElement={passComponent(current.el)}
                            origClick={current.e}
                            scaleFactor={scaleFactor}
                        />
                    ))}
            </g>

            <g id="accelerators">
                {enableAccelerators &&
                    props.mapAccelerators &&
                    props.mapAccelerators.map((el: UnifiedComponent, i: number) => (
                        <MapAccelerator
                            key={i}
                            element={el}
                            mapDimensions={mapDimensions}
                            mapText={mapText}
                            mutateMapText={mutateMapText}
                            scaleFactor={scaleFactor}>
                            <AcceleratorSymbol
                                id={'accelerator_circle_' + el.id}
                                component={el}
                                onClick={() =>
                                    clicked({
                                        el: passComponent(el),
                                        e: null,
                                    })
                                }
                            />
                        </MapAccelerator>
                    ))}
            </g>

            {props.mapAnnotations && props.mapAnnotations.length > 0 && (
                <AnnotationBox
                    mapStyleDefs={mapStyleDefs}
                    mutateMapText={mutateMapText}
                    mapText={mapText}
                    annotations={props.mapAnnotations}
                    position={props.mapAnnotationsPresentation}
                    mapDimensions={mapDimensions}
                    scaleFactor={scaleFactor}
                    setHighlightLine={setHighlightLineDispatch}
                />
            )}

            <MapPipelines
                enableNewPipelines={props.enableNewPipelines || false}
                mapElements={mapElements}
                mapDimensions={mapDimensions}
                mapText={mapText}
                mutateMapText={mutateMapText}
                mapStyleDefs={mapStyleDefs}
                setHighlightLine={setHighlightLineDispatch}
                clicked={clicked}
                scaleFactor={scaleFactor}
            />

            <g id="methods">
                {(() =>
                    getMapElementsDecorated(mapElements).map((methodComp: UnifiedComponent, i: number) => {
                        return (
                            <MethodElement
                                key={`method_${i}`}
                                methodComponent={methodComp}
                                mapDimensions={mapDimensions}
                                mapStyleDefs={mapStyleDefs}
                                setHighlightLine={setHighlightLineDispatch}
                            />
                        );
                    }))()}
            </g>

            <g id="elements">
                {mapElements
                    .getMergedComponents()
                    .filter((c: UnifiedComponent) => c.type !== 'anchor')
                    .map((el: UnifiedComponent, i: number) => {
                        // Check if this component should be highlighted for method application
                        const isMethodHighlighted = props.methodHighlightedComponent?.id === el.id;
                        const isMethodCompatible = el.type === 'component' && !el.pipeline;
                        const isInMethodApplicationMode =
                            props.selectedToolbarItem?.toolType === 'method-application' || props.selectedToolbarItem?.id === 'component';

                        // Calculate the same position that MapComponent uses for the Movable wrapper
                        const calculatedPosition = new ModernPositionCalculator();
                        const posX = calculatedPosition.maturityToX(el.maturity, mapDimensions.width);
                        const posY = calculatedPosition.visibilityToY(el.visibility, mapDimensions.height) + (el.offsetY ? el.offsetY : 0);

                        // Calculate highlight circle radius based on component type/decorators
                        const getHighlightRadius = (component: UnifiedComponent): number => {
                            if (component.decorators?.ecosystem) {
                                return 35; // Ecosystem symbol has r="30", so highlight should be slightly larger
                            }
                            if (component.decorators?.market) {
                                return 25; // Market symbol is medium-sized, needs larger highlight
                            }
                            if (component.decorators?.buy || component.decorators?.build || component.decorators?.outsource) {
                                return 20; // Method symbols have r="15", so highlight should be larger to be visible
                            }
                            return 15; // Default size for regular components
                        };

                        const highlightRadius = getHighlightRadius(el);

                        return (
                            <React.Fragment key={i}>
                                {/* Method application highlighting - positioned at the same coordinates as the Movable component */}
                                {isInMethodApplicationMode && isMethodCompatible && (
                                    <circle
                                        cx={posX}
                                        cy={posY}
                                        r={highlightRadius}
                                        fill="none"
                                        stroke="#2196F3"
                                        strokeWidth="2"
                                        strokeOpacity="0.5"
                                        strokeDasharray="5,5"
                                        pointerEvents="all"
                                        className="method-hover-circle"
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease-in-out',
                                        }}
                                    />
                                )}

                                <MapComponent
                                    launchUrl={launchUrl}
                                    mapDimensions={mapDimensions}
                                    component={passComponent(el)}
                                    mapText={mapText}
                                    mutateMapText={mutateMapText}
                                    mapStyleDefs={mapStyleDefs}
                                    setHighlightLine={setHighlightLineDispatch}
                                    scaleFactor={scaleFactor}>
                                    {el.type === 'component' && !el.pipeline && (
                                        <ComponentSymbol
                                            id={`element_circle_${el.id}`}
                                            styles={mapStyleDefs.component}
                                            component={el}
                                            onClick={(e: MouseEvent<SVGElement>) =>
                                                clicked({
                                                    el: passComponent(el),
                                                    e,
                                                })
                                            }
                                        />
                                    )}

                                    {el.pipeline && (
                                        <PipelineComponentSymbol
                                            id={`element_square_${el.id}`}
                                            styles={mapStyleDefs.component}
                                            component={el}
                                            onClick={e =>
                                                clicked({
                                                    el: passComponent(el),
                                                    e: e,
                                                })
                                            }
                                        />
                                    )}

                                    {(el.decorators?.ecosystem || el.type === 'ecosystem') && (
                                        <EcosystemSymbol
                                            id={`ecosystem_circle_${el.id}`}
                                            styles={mapStyleDefs.component}
                                            component={el}
                                            onClick={(e: MouseEvent<SVGGElement>) =>
                                                clicked({
                                                    el: passComponent(el),
                                                    e,
                                                })
                                            }
                                        />
                                    )}

                                    {(el.decorators?.market || el.type === 'market') && (
                                        <MarketSymbol
                                            id={`market_circle_${el.id}`}
                                            styles={mapStyleDefs.component}
                                            component={el}
                                            onClick={(e: MouseEvent<SVGElement>) =>
                                                clicked({
                                                    el: passComponent(el),
                                                    e,
                                                })
                                            }
                                        />
                                    )}

                                    {el.type === 'submap' && (
                                        <SubMapSymbol
                                            styles={mapStyleDefs.component}
                                            component={el}
                                            onClick={(e: MouseEvent<SVGElement>) =>
                                                clicked({
                                                    el: passComponent(el),
                                                    e,
                                                })
                                            }
                                            launchUrl={
                                                el.url && typeof el.url === 'object' && 'url' in el.url && (el.url as any).url
                                                    ? () => launchUrl?.((el.url as any).url)
                                                    : undefined
                                            }
                                        />
                                    )}
                                </MapComponent>
                            </React.Fragment>
                        );
                    })}
            </g>

            <g id="notes">
                {props.mapNotes.map((n: any, i: number) => (
                    <Note
                        key={i}
                        mapDimensions={mapDimensions}
                        note={n}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        mapStyleDefs={mapStyleDefs}
                        scaleFactor={scaleFactor}
                        setHighlightLine={setHighlightLineDispatch}
                        enableInlineEditing={featureSwitches?.enableNoteInlineEditing || false}
                    />
                ))}
            </g>

            <g id="annotations">
                {props.mapAnnotations &&
                    props.mapAnnotations.map((a: any, i: number) => (
                        <React.Fragment key={i}>
                            {a.occurances?.map((occurance: any, i1: number) => (
                                <AnnotationElement
                                    mapStyleDefs={mapStyleDefs}
                                    key={'mapAnnotation_' + i + '_' + i1}
                                    occurance={occurance}
                                    annotation={a}
                                    occuranceIndex={i1}
                                    mapDimensions={mapDimensions}
                                    mutateMapText={mutateMapText}
                                    mapText={mapText}
                                    scaleFactor={scaleFactor}
                                />
                            ))}
                        </React.Fragment>
                    ))}
            </g>

            {/* Linking preview for component linking functionality */}
            <LinkingPreview
                linkingState={props.linkingState || 'idle'}
                sourceComponent={props.sourceComponent || null}
                mousePosition={props.mousePosition || {x: 0, y: 0}}
                highlightedComponent={props.highlightedComponent || null}
                mapStyleDefs={mapStyleDefs}
                mapDimensions={mapDimensions}
                isDuplicateLink={props.isDuplicateLink || false}
                isInvalidTarget={props.isInvalidTarget || false}
                showCancellationHint={props.showCancellationHint || false}
                isSourceDeleted={props.isSourceDeleted || false}
                isTargetDeleted={props.isTargetDeleted || false}
            />

            {/* Drawing preview for PST box drawing functionality */}
            <DrawingPreview
                isDrawing={props.isDrawing || false}
                startPosition={props.drawingStartPosition || null}
                currentPosition={props.drawingCurrentPosition || {x: 0, y: 0}}
                selectedPSTType={props.selectedToolbarItem?.selectedSubItem || null}
                mapStyleDefs={mapStyleDefs}
                mapDimensions={mapDimensions}
            />
        </g>
    );
};

export default UnifiedMapContent;
