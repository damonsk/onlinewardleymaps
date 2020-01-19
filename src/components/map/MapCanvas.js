import React from 'react';
import MethodElement from './MethodElement';
import MapElements from '../../MapElements';
import MapGrid from './MapGrid';
import MapEvolution from './MapEvolution';
import ComponentLink from './ComponentLink';
import EvolvingComponentLink from './EvolvingComponentLink';
import MapComponent from './MapComponent';
import AnnotationElement from './AnnotationElement';
import AnnotationBox from './AnnotationBox';

class MapCanvas extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var mapElements = new MapElements(this.props.mapComponents);
		var getElementByName = function(elements, name) {
			var hasName = function(element) {
				return element.name === name;
			};
			return elements.find(hasName);
		};

		var canSatisfyLink = function(l, startElements, endElements) {
			return (
				getElementByName(startElements, l.start) != undefined &&
				getElementByName(endElements, l.end) != undefined
			);
		};

		var evolvingEndLinks = this.props.mapLinks.filter(
			li =>
				mapElements.getEvolvedElements().find(i => i.name == li.end) &&
				mapElements.getNoneEvolvingElements().find(i => i.name == li.start)
		);
		var evolvingToNoneEvolvingEndLinks = this.props.mapLinks.filter(
			li =>
				mapElements.getEvolveElements().find(i => i.name == li.start) &&
				mapElements.getNoneEvolvingElements().find(i => i.name == li.end)
		);
		var evolvedToEvolving = this.props.mapLinks.filter(
			li =>
				mapElements.getEvolvedElements().find(i => i.name == li.start) &&
				mapElements.getEvolveElements().find(i => i.name == li.end)
		);
		var bothEvolved = this.props.mapLinks.filter(
			li =>
				mapElements.getEvolvedElements().find(i => i.name == li.start) &&
				mapElements.getEvolvedElements().find(i => i.name == li.end)
		);
		var evolveStartLinks = this.props.mapLinks.filter(
			li =>
				mapElements.getEvolvedElements().find(i => i.name == li.start) &&
				mapElements.getNoneEvolvingElements().find(i => i.name == li.end)
		);
		var bothEvolving = this.props.mapLinks.filter(
			li =>
				mapElements.getEvolveElements().find(i => i.name == li.start) &&
				mapElements.getEvolveElements().find(i => i.name == li.end)
		);
		var evolveToEvolved = this.props.mapLinks.filter(
			li =>
				mapElements.getEvolveElements().find(i => i.name == li.start) &&
				mapElements.getEvolvedElements().find(i => i.name == li.end)
		);

		return (
			<React.Fragment>
				<svg
					fontFamily={this.props.mapStyleDefs.fontFamily}
					fontSize="13px"
					className={this.props.mapStyle}
					id="svgMap"
					width={this.props.mapDimensions.width + 2 * this.props.mapPadding}
					height={this.props.mapDimensions.height + 4 * this.props.mapPadding}
					viewBox={
						'-' +
						this.props.mapPadding +
						' 0 ' +
						(this.props.mapDimensions.width + this.props.mapPadding) +
						' ' +
						(this.props.mapDimensions.height + this.props.mapPadding)
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
								fill={this.props.mapStyleDefs.link.evolvedStroke}
							/>
						</marker>

						<marker
							id="graphArrow"
							markerWidth={12 / this.props.mapStyleDefs.strokeWidth}
							markerHeight={12 / this.props.mapStyleDefs.strokeWidth}
							refX="9"
							refY="0"
							viewBox="0 -5 10 10"
							orient="0"
						>
							<path d="M0,-5L10,0L0,5" fill={this.props.mapStyleDefs.stroke} />
						</marker>
					</defs>
					<g id="grid">
						<MapGrid
							mapYAxis={this.props.mapYAxis}
							mapDimensions={this.props.mapDimensions}
							mapStyleDefs={this.props.mapStyleDefs}
							evolutionOffsets={this.props.evolutionOffsets}
						/>
						<MapEvolution
							mapDimensions={this.props.mapDimensions}
							mapEvolutionStates={this.props.mapEvolutionStates}
							mapStyleDefs={this.props.mapStyleDefs}
							evolutionOffsets={this.props.evolutionOffsets}
						/>
					</g>
					<g id="map">
						<g id="methods">
							{this.props.mapMethods.map((m, i) =>
								getElementByName(mapElements.getNonEvolvedElements(), m.name) ==
								undefined ? null : (
									<MethodElement
										key={i}
										element={getElementByName(
											mapElements.getNonEvolvedElements(),
											m.name
										)}
										mapDimensions={this.props.mapDimensions}
										method={m}
									/>
								)
							)}
						</g>
						{[
							{
								id: 'links',
								links: this.props.mapLinks,
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
												setMetaText={this.props.setMetaText}
												metaText={this.props.metaText}
												mapStyleDefs={this.props.mapStyleDefs}
												key={i}
												mapDimensions={this.props.mapDimensions}
												startElement={getElementByName(
													current.startElements,
													l.start
												)}
												endElement={getElementByName(
													current.endElements,
													l.end
												)}
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
									mapStyleDefs={this.props.mapStyleDefs}
									key={i}
									mapDimensions={this.props.mapDimensions}
									startElement={getElementByName(
										mapElements.getEvolvedElements(),
										e.name
									)}
									endElement={getElementByName(
										mapElements.getEvolveElements(),
										e.name
									)}
									link={e}
									evolutionOffsets={this.props.evolutionOffsets}
								/>
							))}
							;
						</g>
						<g id="elements">
							{mapElements.getMergedElements().map((el, i) => (
								<MapComponent
									key={i}
									mapDimensions={this.props.mapDimensions}
									element={el}
									mapText={this.props.mapText}
									mutateMapText={this.props.mutateMapText}
									setMetaText={this.props.setMetaText}
									metaText={this.props.metaText}
									mapStyleDefs={this.props.mapStyleDefs}
									mapStyle={this.props.mapStyle}
								/>
							))}
						</g>

						<g id="annotations">
							{this.props.mapAnnotations.map((a, i) => (
								<React.Fragment key={i}>
									{a.occurances.map((o, i1) => (
										<AnnotationElement
											mapStyleDefs={this.props.mapStyleDefs}
											key={i1 + '_' + i}
											annotation={a}
											occurance={o}
											occuranceIndex={i1}
											mapDimensions={this.props.mapDimensions}
											mutateMapText={this.props.mutateMapText}
											mapText={this.props.mapText}
										/>
									))}
								</React.Fragment>
							))}
							{this.props.mapAnnotations.length == 0 ? null : (
								<AnnotationBox
									mapStyleDefs={this.props.mapStyleDefs}
									mutateMapText={this.props.mutateMapText}
									mapText={this.props.mapText}
									annotations={this.props.mapAnnotations}
									position={this.props.mapAnnotationsPresentation}
									mapDimensions={this.props.mapDimensions}
									mapStyle={this.props.mapStyle}
								/>
							)}
						</g>
					</g>
				</svg>
			</React.Fragment>
		);
	}
}

export default MapCanvas;
