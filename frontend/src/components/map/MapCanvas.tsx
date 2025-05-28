import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ReactSVGPanZoom } from 'react-svg-pan-zoom';
import { useMapInteractions } from '../../hooks/useMapInteractions';
import { processLinks } from '../../utils/mapProcessing';

import MapElements from '../../MapElements';
import { Component, EvolvedElement, Pipeline } from '../../types/base';
import { useFeatureSwitches } from '../FeatureSwitchesContext';
import { useModKeyPressedConsumer } from '../KeyPressContext';
import MapCanvasToolbar from './MapCanvasToolbar';
import MapContent from './MapContent';
import MapGridGroup from './MapGridGroup';
import { MapSVGContainer } from './MapSVGContainer';
import { MapViewProps } from './MapView';

// Add any missing properties that aren't in MapViewProps but are needed by MapCanvas
interface MapCanvasProps extends MapViewProps {
    handleMapCanvasClick?: (pos: { x: number; y: number }) => void;
}

function MapCanvas(props: MapCanvasProps) {
    const {
        enableAccelerators,
        enableNewPipelines,
        showMapToolbar,
        showMiniMap,
        allowMapZoomMouseWheel,
    } = useFeatureSwitches();

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
        mapEvolutionStates,
        mapAttitudes,
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
        mapTitle,
        mapCanvasDimensions,
        shouldHideNav,
    } = props;

    console.log('MapCanvas', props);
    const isModKeyPressed = useModKeyPressedConsumer();
    const Viewer = useRef<ReactSVGPanZoom>(null);

    function convertToMapElementsComponent(component: any): Component {
        return {
            name: component.name,
            inertia: component.inertia || false,
            id: component.id,
            visibility: component.visibility || '',
            type: component.type || '',
            maturity: component.maturity || 0,
            url: { ...component.url },
            decorators: { ...component.decorators },
            pipeline: { ...component.pipeline },
            evolving: component.evolving || false,
            label: component.label,
            line: component.line,
            evolved: component.evolved,
            offsetY: component.offsetY || 0,
            pseudoComponent: component.pseudoComponent || false,
            evolveMaturity: component.evolveMaturity || null,
            increaseLabelSpacing: component.increaseLabelSpacing || 0,
        };
    }

    function convertToMapElementsEvolved(evolved: any): EvolvedElement {
        return {
            maturity: evolved.maturity,
            name: evolved.name,
            label: evolved.label || '',
            override: evolved.override || null,
            line: evolved.line || null,
            decorators: evolved.decorators || null,
            increaseLabelSpacing: evolved.increaseLabelSpacing || false,
        };
    }

    function convertToMapElementsPipeline(pipeline: any): Pipeline {
        return {
            name: pipeline.name,
            inertia: pipeline.inertia || false,
            components: (pipeline.components || []).map(
                convertToMapElementsComponent,
            ),
            visibility: pipeline.visibility,
            hidden: pipeline.hidden,
        };
    }

    const mapElements = new MapElements(
        [
            {
                collection: mapComponents.map(convertToMapElementsComponent),
                type: 'component',
            },
            {
                collection: mapSubMaps.map(convertToMapElementsComponent),
                type: 'submap',
            },
            {
                collection: mapMarkets.map(convertToMapElementsComponent),
                type: 'market',
            },
            {
                collection: mapEcosystems.map(convertToMapElementsComponent),
                type: 'ecosystem',
            },
        ],
        mapEvolved.map(convertToMapElementsEvolved),
        mapPipelines.map(convertToMapElementsPipeline),
    );

    console.log('MapCanvas (legacy)', props);

    const mousePositionRef = useRef({ x: 0, y: 0 });

    const {
        mapElementsClicked,
        tool,
        scaleFactor,
        handleZoom,
        handleChangeTool,
        newElementAt,
        handleElementClick: clicked,
        setScaleFactor,
    } = useMapInteractions({
        isModKeyPressed,
        mapText,
        mutateMapText,
        setHighlightLine,
        setNewComponentContext,
        mapDimensions,
        mousePositionRef,
    });

    const handleMouseMove = useCallback((event: any) => {
        mousePositionRef.current = { x: event.x, y: event.y };
    }, []);

    const links = useMemo(
        () =>
            processLinks(mapLinks, mapElements, mapAnchors, showLinkedEvolved),
        [mapLinks, mapElements, mapAnchors, showLinkedEvolved],
    );

    const fitToViewer = () => {
        if (Viewer.current) {
            Viewer.current.fitSelection(
                -35,
                -45,
                props.mapDimensions.width + 70,
                props.mapDimensions.height + 92,
            );
        }
    };

    useEffect(() => {
        if (Viewer.current) {
            fitToViewer();
        }
    }, []);

    return (
        <React.Fragment>
            <MapSVGContainer
                viewerRef={Viewer}
                tool={tool}
                mapCanvasDimensions={mapCanvasDimensions}
                mapDimensions={mapDimensions}
                allowMapZoomMouseWheel={allowMapZoomMouseWheel}
                showMiniMap={showMiniMap}
                mapStyleDefs={mapStyleDefs}
                onDoubleClick={newElementAt}
                onMouseMove={handleMouseMove}
                onZoom={handleZoom}
                onZoomReset={() => setScaleFactor(1)}
            >
                <MapGridGroup
                    mapStyleDefs={mapStyleDefs}
                    mapDimensions={mapDimensions}
                    mapTitle={mapTitle}
                    evolutionOffsets={evolutionOffsets}
                    mapEvolutionStates={mapEvolutionStates}
                />
                <MapContent
                    mapAttitudes={mapAttitudes}
                    mapDimensions={mapDimensions}
                    mapStyleDefs={mapStyleDefs}
                    mapText={mapText}
                    mutateMapText={mutateMapText}
                    scaleFactor={scaleFactor}
                    mapElementsClicked={mapElementsClicked}
                    links={links}
                    mapElements={mapElements}
                    evolutionOffsets={evolutionOffsets}
                    mapAnchors={mapAnchors}
                    setHighlightLine={setHighlightLine}
                    clicked={clicked}
                    enableAccelerators={enableAccelerators}
                    mapAccelerators={mapAccelerators}
                    enableNewPipelines={enableNewPipelines}
                    mapNotes={mapNotes}
                    mapAnnotations={mapAnnotations}
                    mapAnnotationsPresentation={mapAnnotationsPresentation}
                    launchUrl={launchUrl}
                    mapMethods={mapMethods}
                />
            </MapSVGContainer>
            {showMapToolbar && (
                <MapCanvasToolbar
                    tool={tool}
                    handleChangeTool={handleChangeTool}
                    mapStyleDefs={mapStyleDefs}
                    _fitToViewer={fitToViewer}
                    shouldHideNav={shouldHideNav}
                    hideNav={false}
                />
            )}
        </React.Fragment>
    );
}

export default MapCanvas;
