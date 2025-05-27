import React, { MouseEvent, useMemo } from 'react';
import { MapDimensions } from '../../constants/defaults';
import {
    MapAccelerators,
    MapAnchors,
    MapAnnotations,
    MapElement,
    MapMethods,
    MapNotes,
} from '../../linkStrategies/LinkStrategiesInterfaces';
import MapElements, { Component, ComponentDectorator } from '../../MapElements';
import { MapTheme } from '../../types/map/styles';
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

interface MapBaseElement extends MapElement {
    id: string;
    visibility: number;
    maturity: number;
    type: string;
    offsetY?: number;
    evolved?: boolean;
    evolving?: boolean;
    pipeline?: boolean;
    url?: string | { url: string; [key: string]: any };
    evolveMaturity?: number;
    decorators: ComponentDectorator;
    line?: number;
}

interface MapContentProps {
    mapAttitudes: any[];
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    mapText: string;
    mutateMapText: (text: string) => void;
    scaleFactor: number;
    mapElementsClicked: Array<{
        el: MapBaseElement;
        e: MouseEvent<Element>;
    }>;
    links: ProcessedLinkGroup[];
    mapElements: MapElements;
    evolutionOffsets: {
        commodity: number;
        product: number;
        custom: number;
    };
    enableNewPipelines: boolean;
    mapAnchors: MapAnchors[];
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    clicked: (data: {
        el: MapBaseElement;
        e: MouseEvent<Element> | null;
    }) => void;
    enableAccelerators: boolean;
    mapAccelerators: MapAccelerators[];
    mapNotes: MapNotes[];
    mapAnnotations: MapAnnotations[];
    mapAnnotationsPresentation: any;
    launchUrl: (url: string) => void;
    mapMethods: MapMethods[];
}

const MapContent: React.FC<MapContentProps> = ({
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
    const { allMethods: allMeths, getElementByName } = useMemo(
        () => processMapElements(mapMethods, mapElements),
        [mapMethods, mapElements],
    );

    console.log('MapAnnotations', mapAnnotations);

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
                {mapElements
                    .getEvolveElements()
                    .map(
                        (e: Component, i: number) =>
                            getElementByName(
                                mapElements.getEvolveElements(),
                                e.name,
                            ) && (
                                <EvolvingComponentLink
                                    key={i}
                                    mapStyleDefs={mapStyleDefs}
                                    mapDimensions={mapDimensions}
                                    startElement={getElementByName(
                                        mapElements.getEvolveElements(),
                                        e.name,
                                    )}
                                    endElement={getElementByName(
                                        mapElements.getEvolveElements(),
                                        e.name,
                                    )}
                                    evolutionOffsets={evolutionOffsets}
                                />
                            ),
                    )}
            </g>

            <g id="anchors">
                {mapAnchors.map((el: MapAnchors, i) => (
                    <Anchor
                        key={i}
                        mapDimensions={mapDimensions}
                        anchor={el}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        mapStyleDefs={mapStyleDefs}
                        onClick={(e) => clicked({ el, e })}
                    />
                ))}
            </g>

            <g id="accelerators">
                {enableAccelerators &&
                    mapAccelerators.map((el, l) => (
                        <MapAccelerator
                            key={l}
                            element={el}
                            mapDimensions={mapDimensions}
                            mapText={mapText}
                            mutateMapText={mutateMapText}
                            scaleFactor={scaleFactor}
                        >
                            <AcceleratorSymbol
                                id={'market_circle_' + el.id}
                                isDeAccelerator={el.deaccelerator}
                                onClick={() => setHighlightLine(el.line)}
                            />
                        </MapAccelerator>
                    ))}
            </g>

            <MapPipelines
                enableNewPipelines={enableNewPipelines}
                mapElements={mapElements}
                mapDimensions={mapDimensions}
                mapText={mapText}
                mutateMapText={mutateMapText}
                mapStyleDefs={mapStyleDefs}
                setHighlightLine={setHighlightLine}
                clicked={clicked}
                scaleFactor={scaleFactor}
            />

            <g id="elements">
                {mapElements.getMergedElements().map((el: Component, i) => (
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

export default MapContent;
