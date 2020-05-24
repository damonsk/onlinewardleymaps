import React, { useMemo } from 'react';
import MethodElement from './MethodElement';
import MapElements from '../../MapElements';
import MapGrid from './foundation/MapGrid';
import MapEvolution from './foundation/MapEvolution';
import Pipeline from './Pipeline';
import ComponentLink from './ComponentLink';
import EvolvingComponentLink from './EvolvingComponentLink';
import MapComponent from './MapComponent';
import AnnotationElement from './AnnotationElement';
import AnnotationBox from './AnnotationBox';
import Anchor from './Anchor';
import Note from './Note';
import LinksBuilder from '../../linkStrategies/LinksBuilder';
import MapGraphics from './foundation/MapGraphics';
import MapBackground from './foundation/MapBackground';

function MapCanvas(props) {
	const mapElements = new MapElements(
		props.mapComponents,
		props.mapEvolved,
		props.mapPipelines
	);
	var getElementByName = function(elements, name) {
		var hasName = function(element) {
			return element.name === name;
		};
		return elements.find(hasName);
	};

	const linksBuilder = new LinksBuilder(
		props.mapLinks,
		mapElements,
		props.mapAnchors
	);
	const links = useMemo(() => linksBuilder.build(), [linksBuilder]);

	return (
		<React.Fragment>
			<svg
				fontFamily={props.mapStyleDefs.fontFamily}
				fontSize={props.mapStyleDefs.fontSize}
				className={props.mapStyleDefs.className}
				id="svgMap"
				width={props.mapDimensions.width + 2 * props.mapPadding}
				height={props.mapDimensions.height + 4 * props.mapPadding}
				viewBox={
					'-' +
					props.mapPadding +
					' 0 ' +
					(props.mapDimensions.width + props.mapPadding) +
					' ' +
					(props.mapDimensions.height + props.mapPadding)
				}
				version="1.1"
				xmlns="http://www.w3.org/2000/svg"
				xmlnsXlink="http://www.w3.org/1999/xlink"
			>
				<MapGraphics mapStyleDefs={props.mapStyleDefs} />
				<g id="grid">
					<MapBackground
						mapDimensions={props.mapDimensions}
						mapStyleClass={props.mapStyleDefs.className}
					/>
					<MapGrid
						mapYAxis={props.mapYAxis}
						mapDimensions={props.mapDimensions}
						mapStyleDefs={props.mapStyleDefs}
						evolutionOffsets={props.evolutionOffsets}
					/>
					<MapEvolution
						mapDimensions={props.mapDimensions}
						mapEvolutionStates={props.mapEvolutionStates}
						mapStyleDefs={props.mapStyleDefs}
						evolutionOffsets={props.evolutionOffsets}
					/>
				</g>
				<g id="map">
					<g id="methods">
						{props.mapMethods.map((m, i) =>
							getElementByName(mapElements.getNonEvolvedElements(), m.name) ===
							undefined ? null : (
								<MethodElement
									key={i}
									element={getElementByName(
										mapElements.getNonEvolvedElements(),
										m.name
									)}
									mapDimensions={props.mapDimensions}
									method={m}
								/>
							)
						)}
					</g>

					{links.map(current => {
						return (
							<g id={current.name} key={current.name}>
								{current.links.map((l, i) => (
									<ComponentLink
										setMetaText={props.setMetaText}
										metaText={props.metaText}
										mapStyleDefs={props.mapStyleDefs}
										key={i}
										mapDimensions={props.mapDimensions}
										startElement={l.startElement}
										endElement={l.endElement}
										link={l.link}
									/>
								))}
							</g>
						);
					})}

					<g id="evolvedLinks">
						{mapElements.getEvolveElements().map((e, i) => (
							<EvolvingComponentLink
								mapStyleDefs={props.mapStyleDefs}
								key={i}
								mapDimensions={props.mapDimensions}
								startElement={getElementByName(
									mapElements.getEvolvedElements(),
									e.name
								)}
								endElement={getElementByName(
									mapElements.getEvolveElements(),
									e.name
								)}
								link={e}
								evolutionOffsets={props.evolutionOffsets}
							/>
						))}
						;
					</g>
					<g id="anchors">
						{props.mapAnchors.map((el, i) => (
							<Anchor
								key={i}
								mapDimensions={props.mapDimensions}
								anchor={el}
								mapText={props.mapText}
								mutateMapText={props.mutateMapText}
								mapStyleDefs={props.mapStyleDefs}
								setHighlightLine={props.setHighlightLine}
							/>
						))}
					</g>
					<g id="pipelines">
						{mapElements.getMapPipelines().map((p, i) => (
							<Pipeline
								key={i}
								mapDimensions={props.mapDimensions}
								pipeline={p}
								mapText={props.mapText}
								mutateMapText={props.mutateMapText}
								setMetaText={props.setMetaText}
								metaText={props.metaText}
								mapStyleDefs={props.mapStyleDefs}
								setHighlightLine={props.setHighlightLine}
							/>
						))}
					</g>
					<g id="elements">
						{mapElements.getMergedElements().map((el, i) => (
							<MapComponent
								key={i}
								mapDimensions={props.mapDimensions}
								element={el}
								mapText={props.mapText}
								mutateMapText={props.mutateMapText}
								setMetaText={props.setMetaText}
								metaText={props.metaText}
								mapStyleDefs={props.mapStyleDefs}
								setHighlightLine={props.setHighlightLine}
							/>
						))}
					</g>

					<g id="notes">
						{props.mapNotes.map((el, i) => (
							<Note
								key={i}
								mapDimensions={props.mapDimensions}
								note={el}
								mapText={props.mapText}
								mutateMapText={props.mutateMapText}
								mapStyleDefs={props.mapStyleDefs}
								setHighlightLine={props.setHighlightLine}
							/>
						))}
					</g>

					<g id="annotations">
						{props.mapAnnotations.map((a, i) => (
							<React.Fragment key={i}>
								{a.occurances.map((o, i1) => (
									<AnnotationElement
										mapStyleDefs={props.mapStyleDefs}
										key={i1 + '_' + i}
										annotation={a}
										occurance={o}
										occuranceIndex={i1}
										mapDimensions={props.mapDimensions}
										mutateMapText={props.mutateMapText}
										mapText={props.mapText}
									/>
								))}
							</React.Fragment>
						))}
						{props.mapAnnotations.length === 0 ? null : (
							<AnnotationBox
								mapStyleDefs={props.mapStyleDefs}
								mutateMapText={props.mutateMapText}
								mapText={props.mapText}
								annotations={props.mapAnnotations}
								position={props.mapAnnotationsPresentation}
								mapDimensions={props.mapDimensions}
							/>
						)}
					</g>
				</g>
			</svg>
		</React.Fragment>
	);
}

export default MapCanvas;
