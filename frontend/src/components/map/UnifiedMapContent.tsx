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
    mapAnchors: UnifiedComponent[]; // Using unified types
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
    console.log(
        'adaptUnifiedComponentToLegacy called for:',
        component.name,
        component,
    );
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
    console.log('adaptUnifiedComponentToLegacy result:', adapted);
    console.log('adaptUnifiedComponentToLegacy type check:', {
        originalType: component.type,
        adaptedType: adapted.type,
        name: adapted.name,
        line: adapted.line,
    });
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
            // Replicate the original MapElements.getMergedElements() logic:
            // 1. Get non-evolving components
            // 2. Get evolved components (evolved versions of evolving components)
            // 3. Get evolving components (original evolving components)
            // 4. Combine them all
            const noneEvolving = unifiedMapElements
                .getStaticComponents()
                .map(adaptUnifiedComponentToLegacy);

            const evolvedComponents = unifiedMapElements
                .getEvolvedComponents()
                .map(adaptUnifiedComponentToLegacy);

            const evolvingComponents = unifiedMapElements
                .getEvolvingComponents()
                .map(adaptUnifiedComponentToLegacy);

            const merged = noneEvolving
                .concat(evolvedComponents)
                .concat(evolvingComponents)
                .filter((c) => !c.pseudoComponent);

            console.log('getMergedElements result:', {
                noneEvolving: noneEvolving.length,
                evolvedComponents: evolvedComponents.length,
                evolvingComponents: evolvingComponents.length,
                total: merged.length,
                merged,
            });

            return merged;
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
    mapAnchors,
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
        console.log('Creating legacy map elements adapter', mapElements);
        return createLegacyMapElementsAdapter(mapElements);
    }, [mapElements]);

    const { allMethods: allMeths, getElementByName } = useMemo(
        () => processMapElements(mapMethods, legacyMapElements as any),
        [mapMethods, legacyMapElements],
    );

    console.log('UnifiedMapContent', { mapElements, mapAnnotations });

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
                                    startElement={getElementByName(
                                        legacyMapElements.getEvolvedElements(),
                                        e.name,
                                    )}
                                    endElement={getElementByName(
                                        legacyMapElements.getEvolveElements(),
                                        e.name,
                                    )}
                                    evolutionOffsets={evolutionOffsets}
                                />
                            ),
                    )}
            </g>

            <g id="anchors">
                {mapAnchors.map((el: UnifiedComponent, i) => (
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
                        {el.type === 'component' && (
                            <ComponentSymbol
                                styles={mapStyleDefs.component}
                                onClick={(e: MouseEvent<SVGElement>) =>
                                    clicked({ el, e })
                                }
                            />
                        )}

                        {el.pipeline && (
                            <PipelineComponentSymbol
                                id={'element_square_' + el.id}
                                styles={mapStyleDefs.component}
                                evolved={el.evolved}
                                onClick={() => clicked({ el, e: null })}
                            />
                        )}

                        {(el.decorators && el.decorators.ecosystem) ||
                        el.type === 'ecosystem' ? (
                            <EcosystemSymbol
                                id={'ecosystem_circle_' + el.id}
                                styles={mapStyleDefs.component}
                                onClick={(e) => clicked({ el, e })}
                            />
                        ) : null}

                        {(el.decorators && el.decorators.market) ||
                        el.type === 'market' ? (
                            <MarketSymbol
                                id={'market_circle_' + el.id}
                                styles={mapStyleDefs.component}
                                onClick={(e) => clicked({ el, e })}
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
