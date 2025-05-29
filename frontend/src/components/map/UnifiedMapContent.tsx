import React, { MouseEvent, useMemo } from 'react';
import { MapDimensions } from '../../constants/defaults';
import {
    MapAnnotations,
    MapMethods,
    MapNotes,
} from '../../linkStrategies/LinkStrategiesInterfaces';
import { UnifiedMapElements } from '../../processing/UnifiedMapElements';
import { MapElement } from '../../types/base';
import { MapTheme } from '../../types/map/styles';
import { UnifiedComponent } from '../../types/unified';
import {
    ProcessedLinkGroup,
    processMapElements,
} from '../../utils/mapProcessing';
import AcceleratorSymbol from '../symbols/AcceleratorSymbol';
import ComponentSymbol from '../symbols/ComponentSymbol';
import EcosystemSymbol from '../symbols/EcosystemSymbol';
import MarketSymbol from '../symbols/MarketSymbol';
import PipelineComponentSymbol from '../symbols/PipelineComponentSymbol';
import SubMapSymbol from '../symbols/SubMapSymbol';
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

interface UnifiedMapContentProps {
    mapAttitudes: any[];
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    mapText: string;
    mutateMapText: (text: string) => void;
    scaleFactor: number;
    mapElementsClicked: Array<{
        el: MapElement;
        e: MouseEvent<Element>;
    }>;
    links: ProcessedLinkGroup[];
    mapElements: UnifiedMapElements; // Using UnifiedMapElements instead of legacy MapElements
    evolutionOffsets: {
        commodity: number;
        product: number;
        custom: number;
    };
    enableNewPipelines: boolean;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    clicked: (data: { el: MapElement; e: MouseEvent<Element> | null }) => void;
    enableAccelerators: boolean;
    mapAccelerators: UnifiedComponent[]; // Using unified types
    mapNotes: MapNotes[];
    mapAnnotations: MapAnnotations[];
    mapAnnotationsPresentation: any;
    launchUrl: (url: string) => void;
    mapMethods: MapMethods[];
}

/**
 * Adapter function to convert UnifiedComponent to legacy Component interface
 * This provides backward compatibility during the transition
 */
const adaptUnifiedComponentToLegacy = (component: UnifiedComponent): any => {
    const adapted = {
        name: component.name,
        id: component.id,
        visibility: component.visibility,
        maturity: component.maturity,
        type: component.type,
        inertia: component.inertia,
        url: component.url,
        decorators: component.decorators,
        pipeline: component.pipeline,
        evolving: component.evolving,
        label: component.label,
        line: component.line,
        evolved: component.evolved,
        offsetY: component.offsetY,
        pseudoComponent: component.pseudoComponent,
        evolveMaturity: component.evolveMaturity,
        increaseLabelSpacing: component.increaseLabelSpacing,
    };
    return adapted;
};

/**
 * Create legacy-compatible MapElements wrapper for UnifiedMapElements
 * This allows existing components to work with the new unified system
 */
const createLegacyMapElementsAdapter = (
    unifiedMapElements: UnifiedMapElements,
) => {
    return {
        getMergedElements: () => {
            // Use the UnifiedMapElements.getMergedElements() method directly
            // This method correctly sets the pipeline property based on the pipelines array
            return unifiedMapElements
                .getMergedElements()
                .filter((c) => c.type !== 'anchor'); // Filter out anchors to prevent double rendering
        },
        getEvolveElements: () => {
            return unifiedMapElements
                .getEvolvingComponents()
                .map(adaptUnifiedComponentToLegacy);
        },
        getNoneEvolvedOrEvolvingElements: () => {
            return unifiedMapElements
                .getStaticComponents()
                .map(adaptUnifiedComponentToLegacy);
        },
        getMapPipelines: () => {
            return unifiedMapElements.getPipelines();
        },
        getEvolvedElements: () => {
            return unifiedMapElements
                .getEvolvedComponents()
                .map(adaptUnifiedComponentToLegacy);
        },
    };
};

const UnifiedMapContent: React.FC<UnifiedMapContentProps> = ({
    mapAttitudes,
    mapDimensions,
    mapStyleDefs,
    mapText,
    mutateMapText,
    scaleFactor,
    mapElementsClicked,
    links,
    mapElements,
    evolutionOffsets,
    setHighlightLine,
    clicked,
    enableAccelerators,
    mapAccelerators,
    enableNewPipelines,
    mapNotes,
    mapAnnotations,
    mapAnnotationsPresentation,
    launchUrl,
    mapMethods,
}) => {
    // Create legacy adapter for backward compatibility
    const legacyMapElements = useMemo(() => {
        return createLegacyMapElementsAdapter(mapElements);
    }, [mapElements]);

    const { allMethods: allMeths, getElementByName } = useMemo(
        () => processMapElements(mapMethods, legacyMapElements as any),
        [mapMethods, legacyMapElements],
    );

    return (
        <g id="map">
            <g id="attitudes">
                {mapAttitudes.map((a, i) => (
                    <Attitude
                        key={i}
                        mapDimensions={mapDimensions}
                        mapStyleDefs={mapStyleDefs}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        attitude={a}
                        scaleFactor={scaleFactor}
                    />
                ))}
            </g>

            <g id="methods">
                {allMeths.map((m, i) => (
                    <MethodElement
                        key={i}
                        element={m}
                        mapStyleDefs={mapStyleDefs}
                        mapDimensions={mapDimensions}
                        method={m.method}
                    />
                ))}
            </g>

            <g id="fluids" key="fluids">
                {mapElementsClicked.map((current, i) => (
                    <FluidLink
                        key={i}
                        mapStyleDefs={mapStyleDefs}
                        mapDimensions={mapDimensions}
                        startElement={current.el}
                        origClick={current.e}
                        scaleFactor={scaleFactor}
                    />
                ))}
            </g>

            {links.map((current) => (
                <g id={current.name} key={current.name}>
                    {current.links.map((l, i) => (
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

            <g id="evolvedLinks">
                {legacyMapElements
                    .getEvolveElements()
                    .map(
                        (e: any, i: number) =>
                            getElementByName(
                                legacyMapElements.getEvolveElements(),
                                e.name,
                            ) && (
                                <EvolvingComponentLink
                                    key={i}
                                    mapStyleDefs={mapStyleDefs}
                                    mapDimensions={mapDimensions}
                                    endElement={getElementByName(
                                        legacyMapElements.getEvolvedElements(),
                                        e.name,
                                    )}
                                    startElement={getElementByName(
                                        legacyMapElements.getEvolveElements(),
                                        e.name,
                                    )}
                                    evolutionOffsets={evolutionOffsets}
                                />
                            ),
                    )}
            </g>

            <g id="anchors">
                {mapElements
                    .getComponentsByType('anchor')
                    .map((el: UnifiedComponent, i) => (
                        <Anchor
                            key={i}
                            mapDimensions={mapDimensions}
                            anchor={adaptUnifiedComponentToLegacy(el)}
                            mapText={mapText}
                            mutateMapText={mutateMapText}
                            mapStyleDefs={mapStyleDefs}
                            onClick={(e) =>
                                clicked({
                                    el: adaptUnifiedComponentToLegacy(el),
                                    e,
                                })
                            }
                        />
                    ))}
            </g>

            <g id="accelerators">
                {enableAccelerators &&
                    mapAccelerators.map((el, l) => (
                        <MapAccelerator
                            key={l}
                            element={adaptUnifiedComponentToLegacy(el)}
                            mapDimensions={mapDimensions}
                            mapText={mapText}
                            mutateMapText={mutateMapText}
                            scaleFactor={scaleFactor}
                        >
                            <AcceleratorSymbol
                                id={'market_circle_' + el.id}
                                isDeAccelerator={
                                    (el as any).deaccelerator || false
                                }
                                onClick={() => setHighlightLine(el.line || 0)}
                            />
                        </MapAccelerator>
                    ))}
            </g>

            <MapPipelines
                enableNewPipelines={enableNewPipelines}
                mapElements={legacyMapElements as any}
                mapDimensions={mapDimensions}
                mapText={mapText}
                mutateMapText={mutateMapText}
                mapStyleDefs={mapStyleDefs}
                setHighlightLine={setHighlightLine}
                clicked={clicked}
                scaleFactor={scaleFactor}
            />

            <g id="elements">
                {legacyMapElements.getMergedElements().map((el: any, i) => (
                    <MapComponent
                        key={i}
                        keyword={el.type}
                        launchUrl={launchUrl}
                        mapDimensions={mapDimensions}
                        element={el}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        mapStyleDefs={mapStyleDefs}
                        setHighlightLine={setHighlightLine}
                        scaleFactor={scaleFactor}
                    >
                        {el.type === 'component' && !el.pipeline && (
                            <ComponentSymbol
                                styles={mapStyleDefs.component}
                                onClick={(e: MouseEvent<SVGElement>) =>
                                    clicked({
                                        el: adaptUnifiedComponentToLegacy(el),
                                        e,
                                    })
                                }
                            />
                        )}

                        {el.pipeline && (
                            <PipelineComponentSymbol
                                id={'element_square_' + el.id}
                                styles={mapStyleDefs.component}
                                evolved={el.evolved}
                                onClick={() =>
                                    clicked({
                                        el: adaptUnifiedComponentToLegacy(el),
                                        e: null,
                                    })
                                }
                            />
                        )}

                        {(el.decorators && el.decorators.ecosystem) ||
                        el.type === 'ecosystem' ? (
                            <EcosystemSymbol
                                id={'ecosystem_circle_' + el.id}
                                styles={mapStyleDefs.component}
                                onClick={(e) =>
                                    clicked({
                                        el: adaptUnifiedComponentToLegacy(el),
                                        e,
                                    })
                                }
                            />
                        ) : null}

                        {(el.decorators && el.decorators.market) ||
                        el.type === 'market' ? (
                            <MarketSymbol
                                id={'market_circle_' + el.id}
                                styles={mapStyleDefs.component}
                                onClick={(e) =>
                                    clicked({
                                        el: adaptUnifiedComponentToLegacy(el),
                                        e,
                                    })
                                }
                            />
                        ) : null}

                        {el.type === 'submap' && (
                            <SubMapSymbol
                                styles={mapStyleDefs.component}
                                onClick={(e: MouseEvent<SVGElement>) =>
                                    clicked({ el, e })
                                }
                                launchUrl={
                                    el.url
                                        ? () => launchUrl(el.url.url!)
                                        : undefined
                                }
                            />
                        )}
                    </MapComponent>
                ))}
            </g>

            <g id="notes">
                {mapNotes.map((el, i) => (
                    <Note
                        key={i}
                        mapDimensions={mapDimensions}
                        note={el}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        mapStyleDefs={mapStyleDefs}
                        setHighlightLine={setHighlightLine}
                        scaleFactor={scaleFactor}
                    />
                ))}
            </g>

            <g id="annotations">
                {mapAnnotations &&
                    mapAnnotations.map((a, i) => (
                        <React.Fragment key={i}>
                            {a.occurances.map((occurance, i1) => (
                                <AnnotationElement
                                    mapStyleDefs={mapStyleDefs}
                                    key={'mapAnnotation_' + i + '_' + i1}
                                    occurance={occurance}
                                    annotation={a}
                                    occuranceIndex={i}
                                    mapDimensions={mapDimensions}
                                    mutateMapText={mutateMapText}
                                    mapText={mapText}
                                    scaleFactor={scaleFactor}
                                />
                            ))}
                        </React.Fragment>
                    ))}

                {mapAnnotations && mapAnnotations.length === 0 ? null : (
                    <AnnotationBox
                        mapStyleDefs={mapStyleDefs}
                        mutateMapText={mutateMapText}
                        mapText={mapText}
                        annotations={mapAnnotations}
                        position={mapAnnotationsPresentation}
                        mapDimensions={mapDimensions}
                        scaleFactor={scaleFactor}
                    />
                )}
            </g>
        </g>
    );
};

export default UnifiedMapContent;
