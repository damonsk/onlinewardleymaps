import React, { MouseEvent } from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapElements } from '../../processing/MapElements';
import { MapTheme } from '../../types/map/styles';
import { UnifiedComponent } from '../../types/unified';

// Import required components
import { getMapElementsDecorated } from '../../utils/mapProcessing';
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
}

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
    // Use MapElements directly - Phase 4C modernization
    const mapAnchors: UnifiedComponent[] = mapElements.getAllComponents().filter(c => c.type === 'anchor');

    const getElementByName = (elements: UnifiedComponent[], name: string) => elements.find(e => e.name === name);

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

            {/* Render annotations box first (background) followed by pipelines and then components */}
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
                mapElements={mapElements} /* Using MapElements directly */
                mapDimensions={mapDimensions}
                mapText={mapText}
                mutateMapText={mutateMapText}
                mapStyleDefs={mapStyleDefs}
                setHighlightLine={setHighlightLineDispatch}
                clicked={clicked}
                scaleFactor={scaleFactor}
            />

            <g id="methods">
                {(() => getMapElementsDecorated(mapElements).map((methodComp: UnifiedComponent, i: number) => {
                    return (
                        <MethodElement
                            key={`method_${i}`}
                            methodComponent={methodComp}
                            mapDimensions={mapDimensions}
                            mapStyleDefs={mapStyleDefs}
                            setHighlightLine={setHighlightLineDispatch} />
                    );
                }))()}
            </g>

            <g id="elements">
                {mapElements
                    .getMergedComponents()
                    .filter((c: UnifiedComponent) => c.type !== 'anchor')
                    .map((el: UnifiedComponent, i: number) => (
                        <MapComponent
                            key={i}
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
                    ))}
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
        </g>
    );
};

export default UnifiedMapContent;
