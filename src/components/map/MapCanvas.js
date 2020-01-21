import React, { useMemo } from 'react';
import MethodElement from './MethodElement';
import MapElements from '../../MapElements';
import MapGrid from './MapGrid';
import MapEvolution from './MapEvolution';
import ComponentLink from './ComponentLink';
import EvolvingComponentLink from './EvolvingComponentLink';
import MapComponent from './MapComponent';
import AnnotationElement from './AnnotationElement';
import AnnotationBox from './AnnotationBox';
import Anchor from './Anchor';

function MapCanvas(props) {
	const mapElements = new MapElements(props.mapComponents);
	var getElementByName = function(elements, name) {
		var hasName = function(element) {
			return element.name === name;
		};
		return elements.find(hasName);
	};

	const canSatisfyLink = function(l, startElements, endElements) {
		return (
			getElementByName(startElements, l.start) != undefined &&
			getElementByName(endElements, l.end) != undefined
		);
	};

	const evolvingEndLinks = useMemo(
		() =>
			props.mapLinks.filter(
				li =>
					mapElements.getEvolvedElements().find(i => i.name == li.end) &&
					mapElements.getNoneEvolvingElements().find(i => i.name == li.start)
			),
		[props.mapLinks, props.mapComponents]
	);

	const evolvingToNoneEvolvingEndLinks = useMemo(
		() =>
			props.mapLinks.filter(
				li =>
					mapElements.getEvolveElements().find(i => i.name == li.start) &&
					mapElements.getNoneEvolvingElements().find(i => i.name == li.end)
			),
		[props.mapLinks, props.mapComponents]
	);

	const evolvedToEvolving = useMemo(
		() =>
			props.mapLinks.filter(
				li =>
					mapElements.getEvolvedElements().find(i => i.name == li.start) &&
					mapElements.getEvolveElements().find(i => i.name == li.end)
			),
		[props.mapLinks, props.mapComponents]
	);

	const bothEvolved = useMemo(
		() =>
			props.mapLinks.filter(
				li =>
					mapElements.getEvolvedElements().find(i => i.name == li.start) &&
					mapElements.getEvolvedElements().find(i => i.name == li.end)
			),
		[props.mapLinks, props.mapComponents]
	);

	const evolveStartLinks = useMemo(
		() =>
			props.mapLinks.filter(
				li =>
					mapElements.getEvolvedElements().find(i => i.name == li.start) &&
					mapElements.getNoneEvolvingElements().find(i => i.name == li.end)
			),
		[props.mapLinks, props.mapComponents]
	);

	const bothEvolving = useMemo(
		() =>
			props.mapLinks.filter(
				li =>
					mapElements.getEvolveElements().find(i => i.name == li.start) &&
					mapElements.getEvolveElements().find(i => i.name == li.end)
			),
		[props.mapLinks, props.mapComponents]
	);

	const evolveToEvolved = useMemo(
		() =>
			props.mapLinks.filter(
				li =>
					mapElements.getEvolveElements().find(i => i.name == li.start) &&
					mapElements.getEvolvedElements().find(i => i.name == li.end)
			),
		[props.mapLinks, props.mapComponents]
	);

	const anchorsToComponents = useMemo(
		() =>
			props.mapLinks.filter(
				li =>
					props.mapAnchors.find(i => i.name == li.start) &&
					mapElements.getMergedElements(i => i.name == li.end)
			),
		[props.mapLinks, props.mapComponents, props.mapAnchors]
	);

	return (
		<React.Fragment>
			<svg
				fontFamily={props.mapStyleDefs.fontFamily}
				fontSize="13px"
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
				<defs>
					<marker
						id="arrow"
						markerWidth="12"
						markerHeight="12"
						refX="15"
						refY="0"
						viewBox="0 -5 10 10"
						orient="0"
					>
						<path
							d="M0,-5L10,0L0,5"
							fill={props.mapStyleDefs.link.evolvedStroke}
						/>
					</marker>

					<marker
						id="graphArrow"
						markerWidth={12 / props.mapStyleDefs.strokeWidth}
						markerHeight={12 / props.mapStyleDefs.strokeWidth}
						refX="9"
						refY="0"
						viewBox="0 -5 10 10"
						orient="0"
					>
						<path d="M0,-5L10,0L0,5" fill={props.mapStyleDefs.stroke} />
					</marker>
				</defs>
				<g id="grid">
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
							getElementByName(mapElements.getNonEvolvedElements(), m.name) ==
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
					{[
						{
							id: 'links',
							links: props.mapLinks,
							startElements: mapElements.getMergedElements(),
							endElements: mapElements.getMergedElements(),
						},
						{
							id: 'evolvingToEvolveEndLinks',
							links: evolvingToNoneEvolvingEndLinks,
							startElements: mapElements.getEvolveElements(),
							endElements: mapElements.getNoneEvolvingElements(),
						},
						{
							id: 'evolvingEndLinks',
							links: evolvingEndLinks,
							startElements: mapElements.getNoneEvolvingElements(),
							endElements: mapElements.getEvolveElements(),
						},
						{
							id: 'evolvingBothLinks',
							links: bothEvolved,
							startElements: mapElements.getEvolvedElements(),
							endElements: mapElements.getEvolvedElements(),
						},
						{
							id: 'evolvedToEvolvingLinks',
							links: evolvedToEvolving,
							startElements: mapElements.getEvolvedElements(),
							endElements: mapElements.getEvolveElements(),
						},
						{
							id: 'evolvingStartLinks',
							links: evolveStartLinks,
							startElements: mapElements.getNoneEvolvingElements(),
							endElements: mapElements.getEvolveElements(),
						},
						{
							id: 'evolvingStartEvolvingEndLinks',
							links: bothEvolving,
							startElements: mapElements.getEvolveElements(),
							endElements: mapElements.getEvolveElements(),
						},
						{
							id: 'evolvedStartEvolvingEndLinks',
							links: evolveToEvolved,
							startElements: mapElements.getEvolveElements(),
							endElements: mapElements.getEvolvedElements(),
						},
						{
							id: 'anchors',
							links: anchorsToComponents,
							startElements: props.mapAnchors,
							endElements: mapElements.getMergedElements(),
						},
					].map(current => {
						return (
							<g id={current.id} key={current.id}>
								{current.links.map((l, i) =>
									canSatisfyLink(
										l,
										current.startElements,
										current.endElements
									) == false ? null : (
										<ComponentLink
											setMetaText={props.setMetaText}
											metaText={props.metaText}
											mapStyleDefs={props.mapStyleDefs}
											key={i}
											mapDimensions={props.mapDimensions}
											startElement={getElementByName(
												current.startElements,
												l.start
											)}
											endElement={getElementByName(current.endElements, l.end)}
											link={l}
										/>
									)
								)}
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
						{props.mapAnnotations.length == 0 ? null : (
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
