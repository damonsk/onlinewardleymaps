import PanIcon from '@mui/icons-material/ControlCamera';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HandIcon from '@mui/icons-material/PanToolAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import LinksBuilder from '../../linkStrategies/LinksBuilder';
import MapElements from '../../MapElements';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import { useModKeyPressedConsumer } from '../KeyPressContext';
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
import MapBackground from './foundation/MapBackground';
import MapEvolution from './foundation/MapEvolution';
import MapGraphics from './foundation/MapGraphics';
import MapGrid from './foundation/MapGrid';
import MapAccelerator from './MapAccelerator';
import MapComponent from './MapComponent';
import MapTitle from './MapTitle';
import MethodElement from './MethodElement';
import Note from './Note';
import Pipeline from './Pipeline';
import PipelineVersion2 from './PipelineVersion2';
import PositionCalculator from './PositionCalculator';

import { ButtonGroup, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
    TOOL_NONE,
    TOOL_PAN,
    TOOL_ZOOM_IN,
    TOOL_ZOOM_OUT,
    UncontrolledReactSVGPanZoom,
} from 'react-svg-pan-zoom';

const useStyles = makeStyles(() => ({
    mapCanvas: {
        userSelect: 'none',
    },
}));

function MapCanvas(props) {
    const {
        enableAccelerators,
        enableNewPipelines,
        // enableQuickAdd,
        showMapToolbar,
        showMiniMap,
        allowMapZoomMouseWheel,
    } = useFeatureSwitches();
    const styles = useStyles();
    const {
        mapComponents,
        mapSubMaps,
        mapMarkets,
        mapEcosystems,
        mapEvolved,
        mapPipelines,
        setNewComponentContext,
        mapLinks,
        showLinkedEvolved,
        mapMethods,
        mapRef,
        mapEvolutionStates,
        mapAttitudes,
        setMetaText,
        metaText,
        launchUrl,
        mapNotes,
        mapAnnotations,
        mapAnnotationsPresentation,
        mapDimensions,
        mapText,
        mutateMapText,
        mapStyleDefs,
        setHighlightLine,
        mapAnchors,
        evolutionOffsets,
        mapAccelerators,
        // handleMapCanvasClick,
        mapTitle,
    } = props;
    const isModKeyPressed = useModKeyPressedConsumer();
    const [mapElementsClicked, setMapElementsClicked] = useState([]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const Viewer = useRef(null);
    const [tool, setTool] = useState(TOOL_NONE);
    const [scaleFactor, setScaleFactor] = useState(1);

    const _fitToViewer = () => {
        Viewer.current.fitSelection(
            -35,
            -45,
            props.mapDimensions.width + 70,
            props.mapDimensions.height + 92,
        );
    };

    const handleMouseMove = event => {
        setMousePosition({ x: event.x, y: event.y });
    };

    const handleZoom = value => {
        setScaleFactor(value.a);
    };

    const handleChangeTool = (event, newTool) => {
        setTool(newTool);
    };

    const SelectedIconButtonStyle = { color: '#90caf9' };
    const IconButtonStyle = { color: 'rgba(0, 0, 0, 0.54)' };
    const textColour = {
        wardley: 'black',
        colour: 'black',
        plain: 'black',
        handwritten: 'black',
        dark: 'white',
    };

    useEffect(() => {
        if (Viewer.current) {
            _fitToViewer();
        }
    }, []);

    const mapElements = new MapElements(
        [
            { collection: mapComponents, type: 'component' },
            { collection: mapSubMaps, type: 'submap' },
            { collection: mapMarkets, type: 'market' },
            { collection: mapEcosystems, type: 'ecosystem' },
        ],
        mapEvolved,
        mapPipelines,
    );

    const newElementAt = function() {
        const positionCalc = new PositionCalculator();
        const x = positionCalc.xToMaturity(
            mousePosition.x,
            mapDimensions.width,
        );
        const y = positionCalc.yToVisibility(
            mousePosition.y,
            mapDimensions.height,
        );
        setNewComponentContext({ x, y });
    };

    var getElementByName = function(elements, name) {
        var hasName = function(element) {
            return element.name === name;
        };
        return elements.find(hasName);
    };

    useEffect(() => {
        if (isModKeyPressed === false) {
            setMapElementsClicked([]);
        }
    }, [isModKeyPressed]);

    const clicked = function(ctx) {
        setHighlightLine(ctx.el.line);
        if (isModKeyPressed === false) return;

        let s = [
            ...mapElementsClicked,
            { el: ctx.el, e: { pageX: ctx.e.pageX, pageY: ctx.e.pageY } },
        ];
        if (s.length === 2) {
            mutateMapText(mapText + '\r\n' + s.map(r => r.el.name).join('->'));
            setMapElementsClicked([]);
        } else setMapElementsClicked(s);
    };

    const linksBuilder = new LinksBuilder(
        mapLinks,
        mapElements,
        mapAnchors,
        showLinkedEvolved,
    );
    const links = useMemo(() => linksBuilder.build(), [linksBuilder]);

    const asMethod = m =>
        Object.assign(
            {},
            {
                name: m.name,
                maturity: m.maturity,
                visibility: m.visibility,
                method: m.decorators.method,
            },
        );

    const decoratedComponentsMethods = mapElements
        .getMergedElements()
        .filter(m => m.decorators && m.decorators.method)
        .map(m => asMethod(m));

    const methods = mapMethods
        .filter(m =>
            getElementByName(mapElements.getNonEvolvedElements(), m.name),
        )
        .map(m => {
            const el = getElementByName(
                mapElements.getNonEvolvedElements(),
                m.name,
            );
            const toTransform = Object.assign(el, {
                decorators: { method: m.method },
            });
            return asMethod(toTransform);
        });
    const allMeths = methods.concat(decoratedComponentsMethods);
    return (
        <React.Fragment>
            <UncontrolledReactSVGPanZoom
                ref={Viewer}
                id="wm-svg-pan-zoom"
                SVGBackground="white"
                tool={tool}
                width={props.mapCanvasDimensions.width + 90}
                height={props.mapCanvasDimensions.height + 30}
                detectAutoPan={false}
                detectWheel={allowMapZoomMouseWheel}
                miniatureProps={{ position: showMiniMap ? 'right' : 'none' }}
                toolbarProps={{ position: 'none' }}
                SVGStyle={{
                    x: '-30',
                    y: '-40',
                    height: props.mapDimensions.height + 90,
                    width: props.mapDimensions.width + 60,
                }}
                fontFamily={mapStyleDefs.fontFamily}
                fontSize={mapStyleDefs.fontSize}
                background="#eee"
                onDoubleClick={newElementAt}
                onMouseMove={handleMouseMove}
                onZoom={handleZoom}
                onZoomReset={() => setScaleFactor(1)}
                className={[mapStyleDefs.className, styles.mapCanvas].join(' ')}
                style={{
                    userSelect: 'none',
                    fontFamily: mapStyleDefs.fontFamily,
                }}
            >
                <svg
                    ref={mapRef}
                    width={mapDimensions.width + 2}
                    height={mapDimensions.height + 4}
                    id="svgMap"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                    <MapGraphics mapStyleDefs={mapStyleDefs} />
                    <g id="grid">
                        <MapBackground
                            mapDimensions={mapDimensions}
                            mapStyleClass={mapStyleDefs.className}
                        />
                        <MapTitle mapTitle={mapTitle} />
                        <MapGrid
                            mapDimensions={mapDimensions}
                            mapStyleDefs={mapStyleDefs}
                            evolutionOffsets={evolutionOffsets}
                        />
                        <MapEvolution
                            mapDimensions={mapDimensions}
                            mapEvolutionStates={mapEvolutionStates}
                            mapStyleDefs={mapStyleDefs}
                            evolutionOffsets={evolutionOffsets}
                        />
                    </g>
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
                            {mapElementsClicked.map((current, i) => {
                                return (
                                    <FluidLink
                                        key={i}
                                        mapStyleDefs={mapStyleDefs}
                                        mapDimensions={mapDimensions}
                                        startElement={current.el}
                                        origClick={current.e}
                                        scaleFactor={scaleFactor}
                                    />
                                );
                            })}
                        </g>

                        {links.map(current => {
                            return (
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
                                            scaleFactor={props.scaleFactor}
                                        />
                                    ))}
                                </g>
                            );
                        })}

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
                                        mapElements.getEvolveElements(),
                                        e.name,
                                    )}
                                    link={e}
                                    evolutionOffsets={evolutionOffsets}
                                />
                            ))}
                            ;
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
                                    onClick={e => clicked({ el, e })}
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
                                            onClick={() =>
                                                setHighlightLine(el.line)
                                            }
                                        />
                                    </MapAccelerator>
                                ))}
                        </g>
                        <g id="pipelines">
                            {enableNewPipelines &&
                                mapElements
                                    .getMapPipelines()
                                    .filter(p => p.hidden == false)
                                    .map((p, i) => (
                                        <React.Fragment key={i}>
                                            {enableNewPipelines &&
                                            p.components != undefined &&
                                            p.components.length > 0 ? (
                                                <PipelineVersion2
                                                    key={'pipeline_' + i}
                                                    mapDimensions={
                                                        mapDimensions
                                                    }
                                                    pipeline={p}
                                                    mapText={mapText}
                                                    mutateMapText={
                                                        mutateMapText
                                                    }
                                                    setMetaText={setMetaText}
                                                    metaText={metaText}
                                                    mapStyleDefs={mapStyleDefs}
                                                    setHighlightLine={
                                                        setHighlightLine
                                                    }
                                                    linkingFunction={clicked}
                                                    scaleFactor={scaleFactor}
                                                />
                                            ) : (
                                                <Pipeline
                                                    key={i}
                                                    mapDimensions={
                                                        mapDimensions
                                                    }
                                                    pipeline={p}
                                                    mapText={mapText}
                                                    mutateMapText={
                                                        mutateMapText
                                                    }
                                                    setMetaText={setMetaText}
                                                    metaText={metaText}
                                                    mapStyleDefs={mapStyleDefs}
                                                    setHighlightLine={
                                                        setHighlightLine
                                                    }
                                                    scaleFactor={scaleFactor}
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                        </g>
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
                                            onClick={e => clicked({ el, e })}
                                        />
                                    )}

                                    {el.pipeline && (
                                        <PipelineComponentSymbol
                                            id={'element_square_' + el.id}
                                            styles={mapStyleDefs.component}
                                            evolved={el.evolved}
                                            onClick={e => clicked({ el, e })}
                                        />
                                    )}

                                    {(el.decorators &&
                                        el.decorators.ecosystem) ||
                                    el.type === 'ecosystem' ? (
                                        <EcosystemSymbol
                                            id={'ecosystem_circle_' + el.id}
                                            styles={mapStyleDefs.component}
                                            onClick={e => clicked({ el, e })}
                                        />
                                    ) : null}

                                    {(el.decorators && el.decorators.market) ||
                                    el.type === 'market' ? (
                                        <MarketSymbol
                                            id={'market_circle_' + el.id}
                                            styles={mapStyleDefs.component}
                                            onClick={e => clicked({ el, e })}
                                        />
                                    ) : null}

                                    {el.type === 'submap' && (
                                        <SubMapSymbol
                                            id={'element_circle_' + el.id}
                                            styles={mapStyleDefs.submap}
                                            evolved={el.evolved}
                                            onClick={e => clicked({ el, e })}
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
                </svg>
            </UncontrolledReactSVGPanZoom>
            {showMapToolbar && (
                <ButtonGroup orientation="horizontal" aria-label="button group">
                    <IconButton
                        id="wm-map-select"
                        aria-label={'Select'}
                        onClick={event => handleChangeTool(event, TOOL_NONE)}
                        sx={
                            tool === TOOL_NONE
                                ? SelectedIconButtonStyle
                                : IconButtonStyle
                        }
                    >
                        <HandIcon />
                    </IconButton>
                    <IconButton
                        id="wm-map-pan"
                        aria-label={'Pan'}
                        onClick={event => handleChangeTool(event, TOOL_PAN)}
                        sx={
                            tool === TOOL_PAN
                                ? SelectedIconButtonStyle
                                : IconButtonStyle
                        }
                    >
                        <PanIcon />
                    </IconButton>
                    <IconButton
                        id="wm-zoom-in"
                        aria-label={'Zoom In'}
                        sx={
                            tool === TOOL_ZOOM_IN
                                ? SelectedIconButtonStyle
                                : IconButtonStyle
                        }
                        onClick={event => handleChangeTool(event, TOOL_ZOOM_IN)}
                    >
                        <ZoomInIcon />
                    </IconButton>
                    <IconButton
                        id="wm-zoom-out"
                        aria-label={'Zoom Out'}
                        sx={
                            tool === TOOL_ZOOM_OUT
                                ? SelectedIconButtonStyle
                                : IconButtonStyle
                        }
                        onClick={event =>
                            handleChangeTool(event, TOOL_ZOOM_OUT)
                        }
                    >
                        <ZoomOutIcon />
                    </IconButton>
                    <IconButton
                        id="wm-map-fit"
                        aria-label={'Fit'}
                        sx={IconButtonStyle}
                        onClick={() => _fitToViewer()}
                    >
                        <FitScreenIcon />
                    </IconButton>
                    <IconButton
                        id="wm-map-fullscreen"
                        onClick={props.shouldHideNav}
                        color={textColour[props.mapStyleDefs.className]}
                        aria-label={
                            props.hideNav ? 'Exit Fullscreen' : 'Fullscreen'
                        }
                    >
                        {props.hideNav ? (
                            <FullscreenExitIcon sx={IconButtonStyle} />
                        ) : (
                            <FullscreenIcon sx={IconButtonStyle} />
                        )}
                    </IconButton>
                </ButtonGroup>
            )}
        </React.Fragment>
    );
}

export default MapCanvas;
