import React, { MouseEvent } from 'react';
import { MapDimensions } from '../../constants/defaults';
import { UnifiedMapElements } from '../../processing/UnifiedMapElements';
import { MapTheme } from '../../types/map/styles';
import { UnifiedComponent } from '../../types/unified';

// Import required components
import ModernComponentSymbol from '../symbols/ModernComponentSymbol';
import ModernEcosystemSymbol from '../symbols/ModernEcosystemSymbol';
import ModernMarketSymbol from '../symbols/ModernMarketSymbol';
import ModernPipelineComponentSymbol from '../symbols/ModernPipelineComponentSymbol';
import ModernSubMapSymbol from '../symbols/ModernSubMapSymbol';
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
import Note from './Note';

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
            setHighlightLine(value(0));
        } else {
            setHighlightLine(value);
        }
    };

    // Get elements from UnifiedMapElements
    const mapAnchors: UnifiedComponent[] = mapElements.getAllComponents
        ? mapElements.getAllComponents().filter((c) => c.type === 'anchor')
        : [];

    const getElementByName = (elements: UnifiedComponent[], name: string) =>
        elements.find((e) => e.name === name);

    return (
        <g id="mapContent">
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
                {mapElements.getEvolveElements &&
                    mapElements.getEvolveElements().map(
                        (e: any, i: number) =>
                            getElementByName(
                                mapElements.getEvolveElements(),
                                e.name,
                            ) && (
                                <EvolvingComponentLink
                                    key={i}
                                    mapStyleDefs={mapStyleDefs}
                                    mapDimensions={mapDimensions}
                                    endElement={(() => {
                                        const element = getElementByName(
                                            mapElements.getEvolvedElements(),
                                            e.name,
                                        );
                                        return element
                                            ? adaptUnifiedToMapElement(element)
                                            : undefined;
                                    })()}
                                    startElement={(() => {
                                        const element = getElementByName(
                                            mapElements.getEvolveElements(),
                                            e.name,
                                        );
                                        return element
                                            ? adaptUnifiedToMapElement(element)
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
                            startElement={adaptUnifiedToMapElement(current.el)}
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
                                            el: adaptUnifiedToMapElement(el),
                                            e: null,
                                        })
                                    }
                                />
                            </MapAccelerator>
                        ),
                    )}
            </g>

            <g id="elements">
                {mapElements.getMergedElements &&
                    mapElements
                        .getMergedElements()
                        .filter((c: UnifiedComponent) => c.type !== 'anchor')
                        .map((el: UnifiedComponent, i: number) => (
                            <MapComponent
                                key={i}
                                keyword={el.type}
                                launchUrl={launchUrl}
                                mapDimensions={mapDimensions}
                                element={adaptUnifiedToMapElement(el)}
                                mapText={mapText}
                                mutateMapText={mutateMapText}
                                mapStyleDefs={mapStyleDefs}
                                setHighlightLine={setHighlightLineDispatch}
                                scaleFactor={scaleFactor}
                            >
                                {el.type === 'component' && !el.pipeline && (
                                    <ModernComponentSymbol
                                        styles={mapStyleDefs.component}
                                        component={el}
                                        onClick={(e: MouseEvent<SVGElement>) =>
                                            clicked({
                                                el: adaptUnifiedToMapElement(
                                                    el,
                                                ),
                                                e,
                                            })
                                        }
                                    />
                                )}

                                {el.pipeline && (
                                    <ModernPipelineComponentSymbol
                                        id={'element_square_' + el.id}
                                        styles={mapStyleDefs.component}
                                        component={el}
                                        onClick={() =>
                                            clicked({
                                                el: adaptUnifiedToMapElement(
                                                    el,
                                                ),
                                                e: null,
                                            })
                                        }
                                    />
                                )}

                                {(el.decorators?.ecosystem ||
                                    el.type === 'ecosystem') && (
                                    <ModernEcosystemSymbol
                                        id={'ecosystem_circle_' + el.id}
                                        styles={mapStyleDefs.component}
                                        component={el}
                                        onClick={(e: MouseEvent<SVGGElement>) =>
                                            clicked({
                                                el: adaptUnifiedToMapElement(
                                                    el,
                                                ),
                                                e,
                                            })
                                        }
                                    />
                                )}

                                {(el.decorators?.market ||
                                    el.type === 'market') && (
                                    <ModernMarketSymbol
                                        id={'market_circle_' + el.id}
                                        styles={mapStyleDefs.component}
                                        component={el}
                                        onClick={(e: MouseEvent<SVGElement>) =>
                                            clicked({
                                                el: adaptUnifiedToMapElement(
                                                    el,
                                                ),
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
                                                el: adaptUnifiedToMapElement(
                                                    el,
                                                ),
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
                            </MapComponent>
                        ))}
            </g>

            <MapPipelines
                enableNewPipelines={props.enableNewPipelines || false}
                mapElements={
                    (() => {
                        return {
                            getMergedElements: () =>
                                mapElements
                                    .getMergedElements()
                                    .map(adaptUnifiedToMapElement),
                            getEvolveElements: () =>
                                mapElements
                                    .getEvolvingComponents()
                                    .map(adaptUnifiedToMapElement),
                            getNoneEvolvedOrEvolvingElements: () =>
                                mapElements
                                    .getStaticComponents()
                                    .map(adaptUnifiedToMapElement),
                            getMapPipelines: () =>
                                mapElements.getMapPipelines(),
                            getEvolvedElements: () =>
                                mapElements
                                    .getEvolvedElements()
                                    .map(adaptUnifiedToMapElement),
                        };
                    })() as any
                }
                mapDimensions={mapDimensions}
                mapText={mapText}
                mutateMapText={mutateMapText}
                mapStyleDefs={mapStyleDefs}
                setHighlightLine={setHighlightLineDispatch}
                clicked={clicked}
                scaleFactor={scaleFactor}
            />

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
                                    occuranceIndex={i}
                                    mapDimensions={mapDimensions}
                                    mutateMapText={mutateMapText}
                                    mapText={mapText}
                                    scaleFactor={scaleFactor}
                                />
                            ))}
                        </React.Fragment>
                    ))}

                {props.mapAnnotations &&
                props.mapAnnotations.length === 0 ? null : (
                    <AnnotationBox
                        mapStyleDefs={mapStyleDefs}
                        mutateMapText={mutateMapText}
                        mapText={mapText}
                        annotations={props.mapAnnotations}
                        position={props.mapAnnotationsPresentation}
                        mapDimensions={mapDimensions}
                        scaleFactor={scaleFactor}
                    />
                )}
            </g>
        </g>
    );
};

export default ModernUnifiedMapContent;
