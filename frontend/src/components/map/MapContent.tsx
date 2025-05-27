import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../constants/mapstyles';
import { MapAnnotation, MapLinks } from '../../conversion/Converter';
import { MapAnnotationsPosition } from '../../conversion/PresentationExtractionStrategy';
import MapElements from '../../MapElements';
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

interface MapContentProps {
    mapAttitudes: any[];
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    mapText: string;
    mutateMapText: (text: string) => void;
    scaleFactor: number;
    allMeths: any[];
    mapElementsClicked: Array<{ el: any; e: any }>;
    links: Array<{ name: string; links: MapLinks[] }>;
    setMetaText: (text: string) => void;
    metaText: string;
    mapElements: MapElements;
    getElementByName: (elements: any[], name: string) => any;
    evolutionOffsets: { custom: number; product: number; commodity: number };
    mapAnchors: any[];
    setHighlightLine: (line: number) => void;
    clicked: (params: { el: any; e: any }) => void;
    enableAccelerators: boolean;
    mapAccelerators: any[];
    enableNewPipelines: boolean;
    mapNotes: any[];
    mapAnnotations: Array<{ occurances: MapAnnotation[] }>;
    mapAnnotationsPresentation: MapAnnotationsPosition;
    launchUrl: (url: string) => void;
}

const MapContent: React.FC<MapContentProps> = ({
    mapAttitudes,
    mapDimensions,
    mapStyleDefs,
    mapText,
    mutateMapText,
    scaleFactor,
    allMeths,
    mapElementsClicked,
    links,
    setMetaText,
    metaText,
    mapElements,
    getElementByName,
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
}) => {
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
                            setMetaText={setMetaText}
                            metaText={metaText}
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
                {mapElements.getEvolveElements().map((e, i) => (
                    <EvolvingComponentLink
                        mapStyleDefs={mapStyleDefs}
                        key={i}
                        mapDimensions={mapDimensions}
                        startElement={getElementByName(
                            mapElements.getEvolvedElements(),
                            e.name,
                        )}
                        endElement={getElementByName(
                            mapElements.getEvolvedElements(),
                            e.name,
                        )}
                        link={e}
                        evolutionOffsets={evolutionOffsets}
                    />
                ))}
            </g>

            <g id="anchors">
                {mapAnchors.map((el, i) => (
                    <Anchor
                        key={i}
                        mapDimensions={mapDimensions}
                        anchor={el}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        mapStyleDefs={mapStyleDefs}
                        setHighlightLine={setHighlightLine}
                        onClick={(e) => clicked({ el, e })}
                        scaleFactor={scaleFactor}
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
                setMetaText={setMetaText}
                metaText={metaText}
                mapStyleDefs={mapStyleDefs}
                setHighlightLine={setHighlightLine}
                clicked={clicked}
                scaleFactor={scaleFactor}
            />

            <g id="elements">
                {mapElements.getMergedElements().map((el, i) => (
                    <MapComponent
                        key={i}
                        keyword={el.type}
                        launchUrl={launchUrl}
                        mapDimensions={mapDimensions}
                        element={el}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        setMetaText={setMetaText}
                        metaText={metaText}
                        mapStyleDefs={mapStyleDefs}
                        setHighlightLine={setHighlightLine}
                        scaleFactor={scaleFactor}
                    >
                        {el.type === 'component' && (
                            <ComponentSymbol
                                id={'element_circle_' + el.id}
                                styles={mapStyleDefs.component}
                                evolved={el.evolved}
                                onClick={(e) => clicked({ el, e })}
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
                                id={'element_circle_' + el.id}
                                styles={mapStyleDefs.submap}
                                evolved={el.evolved}
                                onClick={(e) => clicked({ el, e })}
                                launchUrl={() => launchUrl(el.url)}
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
                {mapAnnotations.map((a, i) => (
                    <React.Fragment key={i}>
                        {a.occurances.map((o, i1) => (
                            <AnnotationElement
                                mapStyleDefs={mapStyleDefs}
                                key={i1 + '_' + i}
                                annotation={a}
                                occurance={o}
                                occuranceIndex={i1}
                                mapDimensions={mapDimensions}
                                mutateMapText={mutateMapText}
                                mapText={mapText}
                                scaleFactor={scaleFactor}
                            />
                        ))}
                    </React.Fragment>
                ))}
                {mapAnnotations.length === 0 ? null : (
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
