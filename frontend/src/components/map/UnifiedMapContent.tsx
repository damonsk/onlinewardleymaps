import React, {MouseEvent} from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapElements} from '../../processing/MapElements';
import {MapTheme} from '../../types/map/styles';
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
