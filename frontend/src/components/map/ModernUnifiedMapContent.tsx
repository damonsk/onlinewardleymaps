import React, { MouseEvent } from 'react';
import { MapDimensions } from '../../constants/defaults';
import { UnifiedMapElements } from '../../processing/UnifiedMapElements';
import { MapTheme } from '../../types/map/styles';
import { UnifiedComponent } from '../../types/unified';

// Import required components
import { processMapElements } from '../../utils/mapProcessing';
import ModernComponentSymbol from '../symbols/ModernComponentSymbol';
import ModernEcosystemSymbol from '../symbols/ModernEcosystemSymbol';
import ModernMarketSymbol from '../symbols/ModernMarketSymbol';
import ModernPipelineComponentSymbol from '../symbols/ModernPipelineComponentSymbol';
import ModernSubMapSymbol from '../symbols/ModernSubMapSymbol';
import MapAccelerator from './MapAccelerator';
import ModernAnchor from './ModernAnchor';
import ModernAnnotationBox from './ModernAnnotationBox';
import ModernAnnotationElement from './ModernAnnotationElement';
import ModernAttitude from './ModernAttitude';
import ModernComponentLink from './ModernComponentLink';
import ModernEvolvingComponentLink from './ModernEvolvingComponentLink';
import ModernFluidLink from './ModernFluidLink';
import ModernMapComponent from './ModernMapComponent';
import ModernMapPipelines from './ModernMapPipelines';
import ModernMethodElement from './ModernMethodElement';
import ModernNote from './ModernNote';

// Phase 4: Component Interface Modernization
// All adapter functions have been removed
// Components now use UnifiedComponent type directly

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
    mapElements: UnifiedMapElements;
    evolutionOffsets: {
        commodity: number;
        product: number;
        custom: number;
    };
    enableNewPipelines: boolean;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    clicked: (data: { el: any; e: MouseEvent<Element> | null }) => void;
    enableAccelerators: boolean;
    mapAccelerators: UnifiedComponent[];
    mapNotes: any[];
    mapAnnotations: any[];
    mapAnnotationsPresentation: any;
    launchUrl?: (url: string) => void;
    mapMethods: any[];
}

const ModernUnifiedMapContent: React.FC<ModernUnifiedMapContentProps> = (
    props,
) => {
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

    // Create a dispatcher wrapper to handle prop type conflicts
    const setHighlightLineDispatch = (value: any) => {
        if (typeof value === 'function') {
            // If we're given a function, evaluate it
            setHighlightLine(value(0));
        } else {
            // Simply set the highlight line to the provided value
            // The cursor will be moved to this line in the editor
            setHighlightLine(value);
        }
    };

    // Get elements from UnifiedMapElements
    const mapAnchors: UnifiedComponent[] = mapElements.getAllComponents
        ? mapElements.getAllComponents().filter((c) => c.type === 'anchor')
        : [];

    const getElementByName = (elements: UnifiedComponent[], name: string) =>
        elements.find((e) => e.name === name);

    // Direct component passing function - no need for adaptation since we're using unified types
    // This is part of Phase 4A migration - eliminate adapter functions
    const passComponent = (component: any): any => {
        // Simply return the component as is - unified components have all needed properties
        // In a future phase, this function can be removed completely and components used directly
        return component;
    };

    return (
        <g id="mapContent">
            <g id="attitudes">
                {props.mapAttitudes &&
                    props.mapAttitudes.map((a: any, i: number) => (
                        <ModernAttitude
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
                            <ModernComponentLink
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
                {mapElements.getEvolveElements &&
                    mapElements.getEvolveElements().map(
                        (e: any, i: number) =>
                            getElementByName(
                                mapElements.getEvolveElements(),
                                e.name,
                            ) && (
                                <ModernEvolvingComponentLink
                                    key={i}
                                    mapStyleDefs={mapStyleDefs}
                                    mapDimensions={mapDimensions}
                                    endElement={(() => {
                                        const element = getElementByName(
                                            mapElements.getEvolvedElements(),
                                            e.name,
                                        );
                                        return element
                                            ? passComponent(element)
                                            : undefined;
                                    })()}
                                    startElement={(() => {
                                        const element = getElementByName(
                                            mapElements.getEvolveElements(),
                                            e.name,
                                        );
                                        return element
                                            ? passComponent(element)
                                            : undefined;
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
                    <ModernAnchor
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
                        <ModernFluidLink
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
                    props.mapAccelerators.map(
                        (el: UnifiedComponent, i: number) => (
                            <MapAccelerator
                                key={i}
                                element={el}
                                mapDimensions={mapDimensions}
                                mapText={mapText}
                                mutateMapText={mutateMapText}
                                scaleFactor={scaleFactor}
                            >
                                <ModernComponentSymbol
                                    id={'accelerator_circle_' + el.id}
                                    styles={mapStyleDefs.component}
                                    component={el}
                                    onClick={() =>
                                        clicked({
                                            el: passComponent(el),
                                            e: null,
                                        })
                                    }
                                />
                            </MapAccelerator>
                        ),
                    )}
            </g>

            {/* Render annotations box first (background) followed by pipelines and then components */}
            {props.mapAnnotations && props.mapAnnotations.length > 0 && (
                <ModernAnnotationBox
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

            <ModernMapPipelines
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

            {/* IMPORTANT: Method elements appear BEFORE regular elements */}
            {/* This ensures elements are rendered on top of method indicators */}
            <g id="methods">
                {/* Process all methods using the same logic from the legacy implementation */}
                {(() => {
                    // Process all methods using the utility from mapProcessing.ts
                    const processedMethodsData = processMapElements(
                        props.mapMethods || [],
                        mapElements,
                    );

                    // Get all methods: both standalone and decorated components
                    const allMethods = processedMethodsData.allMethods || [];

                    // Let's use the methods exactly as they come from processMapElements
                    // without adding extra properties

                    console.log('Rendering methods:', allMethods.length);

                    // Render all methods
                    return allMethods.map((methodComp: any, i: number) => {
                        // Don't adjust position here - we want methods to appear exactly at their component position
                        // The component's label has already been adjusted with increaseLabelSpacing
                        return (
                            <ModernMethodElement
                                key={`method_${i}`}
                                methodComponent={methodComp}
                                mapDimensions={mapDimensions}
                                method={methodComp.method || 'build'} // Default to 'build' if no method specified
                                mapStyleDefs={mapStyleDefs}
                                setHighlightLine={setHighlightLineDispatch}
                            />
                        );
                    });
                })()}
            </g>

            <g id="elements">
                {mapElements.getMergedElements &&
                    mapElements
                        .getMergedElements()
                        .filter((c: UnifiedComponent) => c.type !== 'anchor')
                        .map((el: UnifiedComponent, i: number) => (
                            <ModernMapComponent
                                key={i}
                                launchUrl={launchUrl}
                                mapDimensions={mapDimensions}
                                component={passComponent(el)}
                                mapText={mapText}
                                mutateMapText={mutateMapText}
                                mapStyleDefs={mapStyleDefs}
                                setHighlightLine={setHighlightLineDispatch}
                                scaleFactor={scaleFactor}
                            >
                                {el.type === 'component' && !el.pipeline && (
                                    <ModernComponentSymbol
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
                                    <ModernPipelineComponentSymbol
                                        id={`element_square_${el.id}`}
                                        styles={mapStyleDefs.component}
                                        component={el}
                                        onClick={() =>
                                            clicked({
                                                el: passComponent(el),
                                                e: null,
                                            })
                                        }
                                    />
                                )}

                                {(el.decorators?.ecosystem ||
                                    el.type === 'ecosystem') && (
                                    <ModernEcosystemSymbol
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

                                {(el.decorators?.market ||
                                    el.type === 'market') && (
                                    <ModernMarketSymbol
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
                                    <ModernSubMapSymbol
                                        styles={mapStyleDefs.component}
                                        component={el}
                                        onClick={(e: MouseEvent<SVGElement>) =>
                                            clicked({
                                                el: passComponent(el),
                                                e,
                                            })
                                        }
                                        launchUrl={
                                            el.url &&
                                            typeof el.url === 'object' &&
                                            'url' in el.url &&
                                            (el.url as any).url
                                                ? () =>
                                                      launchUrl?.(
                                                          (el.url as any).url,
                                                      )
                                                : undefined
                                        }
                                    />
                                )}
                            </ModernMapComponent>
                        ))}
            </g>

            <g id="notes">
                {props.mapNotes.map((n: any, i: number) => (
                    <ModernNote
                        key={i}
                        mapDimensions={mapDimensions}
                        note={n}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        mapStyleDefs={mapStyleDefs}
                        scaleFactor={scaleFactor}
                        setHighlightLine={setHighlightLineDispatch}
                    />
                ))}
            </g>

            <g id="annotations">
                {props.mapAnnotations &&
                    props.mapAnnotations.map((a: any, i: number) => (
                        <React.Fragment key={i}>
                            {a.occurances?.map((occurance: any, i1: number) => (
                                <ModernAnnotationElement
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
            </g>
        </g>
    );
};

export default ModernUnifiedMapContent;
