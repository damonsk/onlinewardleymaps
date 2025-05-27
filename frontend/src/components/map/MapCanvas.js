// import React, { useEffect, useMemo, useRef } from 'react';
// import { useMapInteractions } from '../../hooks/useMapInteractions';
// import MapElements from '../../MapElements';
// import { processLinks, processMapElements } from '../../utils/mapProcessing';
// import { useFeatureSwitches } from '../FeatureSwitchesContext';
// import { useModKeyPressedConsumer } from '../KeyPressContext';
// import MapCanvasToolbar from './MapCanvasToolbar';
// import MapContent from './MapContent';
// import MapGridGroup from './MapGridGroup';
// import { MapSVGContainer } from './MapSVGContainer';

// function MapCanvas(props) {
//     const {
//         enableAccelerators,
//         enableNewPipelines,
//         showMapToolbar,
//         showMiniMap,
//         allowMapZoomMouseWheel,
//     } = useFeatureSwitches();

//     const {
//         mapComponents,
//         mapSubMaps,
//         mapMarkets,
//         mapEcosystems,
//         mapEvolved,
//         mapPipelines,
//         setNewComponentContext,
//         mapLinks,
//         showLinkedEvolved,
//         mapMethods,
//         mapEvolutionStates,
//         mapAttitudes,
//         setMetaText,
//         metaText,
//         launchUrl,
//         mapNotes,
//         mapAnnotations,
//         mapAnnotationsPresentation,
//         mapDimensions,
//         mapText,
//         mutateMapText,
//         mapStyleDefs,
//         setHighlightLine,
//         mapAnchors,
//         evolutionOffsets,
//         mapAccelerators,
//         mapTitle,
//         mapCanvasDimensions,
//     } = props;

//     const isModKeyPressed = useModKeyPressedConsumer();
//     const Viewer = useRef(null);

//     const mapElements = new MapElements(
//         [
//             { collection: mapComponents, type: 'component' },
//             { collection: mapSubMaps, type: 'submap' },
//             { collection: mapMarkets, type: 'market' },
//             { collection: mapEcosystems, type: 'ecosystem' },
//         ],
//         mapEvolved,
//         mapPipelines,
//     );

//     const {
//         mapElementsClicked,
//         tool,
//         scaleFactor,
//         handleMouseMove,
//         handleZoom,
//         handleChangeTool,
//         newElementAt,
//         handleElementClick: clicked,
//         setScaleFactor,
//     } = useMapInteractions({
//         isModKeyPressed,
//         mapText,
//         mutateMapText,
//         setHighlightLine,
//         setNewComponentContext,
//         mapDimensions,
//     });

//     const links = useMemo(
//         () =>
//             processLinks(mapLinks, mapElements, mapAnchors, showLinkedEvolved),
//         [mapLinks, mapElements, mapAnchors, showLinkedEvolved],
//     );

//     const { allMethods: allMeths, getElementByName } = useMemo(
//         () => processMapElements(mapMethods, mapElements),
//         [mapMethods, mapElements],
//     );

//     const fitToViewer = () => {
//         Viewer.current?.fitSelection(
//             -35,
//             -45,
//             props.mapDimensions.width + 70,
//             props.mapDimensions.height + 92,
//         );
//     };

//     useEffect(() => {
//         if (Viewer.current) {
//             fitToViewer();
//         }
//     }, []);

//     return (
//         <React.Fragment>
//             <MapSVGContainer
//                 viewerRef={Viewer}
//                 tool={tool}
//                 mapCanvasDimensions={mapCanvasDimensions}
//                 mapDimensions={mapDimensions}
//                 allowMapZoomMouseWheel={allowMapZoomMouseWheel}
//                 showMiniMap={showMiniMap}
//                 mapStyleDefs={mapStyleDefs}
//                 onDoubleClick={newElementAt}
//                 onMouseMove={handleMouseMove}
//                 onZoom={handleZoom}
//                 onZoomReset={() => setScaleFactor(1)}
//             >
//                 <MapGridGroup
//                     mapStyleDefs={mapStyleDefs}
//                     mapDimensions={mapDimensions}
//                     mapTitle={mapTitle}
//                     evolutionOffsets={evolutionOffsets}
//                     mapEvolutionStates={mapEvolutionStates}
//                 />
//                 <MapContent
//                     mapAttitudes={mapAttitudes}
//                     mapDimensions={mapDimensions}
//                     mapStyleDefs={mapStyleDefs}
//                     mapText={mapText}
//                     mutateMapText={mutateMapText}
//                     scaleFactor={scaleFactor}
//                     allMeths={allMeths}
//                     mapElementsClicked={mapElementsClicked}
//                     links={links}
//                     setMetaText={setMetaText}
//                     metaText={metaText}
//                     mapElements={mapElements}
//                     getElementByName={getElementByName}
//                     evolutionOffsets={evolutionOffsets}
//                     mapAnchors={mapAnchors}
//                     setHighlightLine={setHighlightLine}
//                     clicked={clicked}
//                     enableAccelerators={enableAccelerators}
//                     mapAccelerators={mapAccelerators}
//                     enableNewPipelines={enableNewPipelines}
//                     mapNotes={mapNotes}
//                     mapAnnotations={mapAnnotations}
//                     mapAnnotationsPresentation={mapAnnotationsPresentation}
//                     launchUrl={launchUrl}
//                 />
//             </MapSVGContainer>
//             {showMapToolbar && (
//                 <MapCanvasToolbar
//                     tool={tool}
//                     handleChangeTool={handleChangeTool}
//                     mapStyleDefs={mapStyleDefs}
//                     _fitToViewer={fitToViewer}
//                 />
//             )}
//         </React.Fragment>
//     );
// }

// export default MapCanvas;
