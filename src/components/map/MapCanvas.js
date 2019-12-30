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

	constructor(props){
		super(props);
	}

	render() {
		var mapElements = new MapElements(this.props.mapObject);

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

		var evolvingEndLinks = this.props.mapObject.links.filter(
			li =>
				mapElements.getEvolvedElements().find(i => i.name == li.end) &&
				mapElements.getNoneEvolvingElements().find(i => i.name == li.start)
		);
		var evolvingToNoneEvolvingEndLinks = this.props.mapObject.links.filter(
			li =>
				mapElements.getEvolveElements().find(i => i.name == li.start) &&
				mapElements.getNoneEvolvingElements().find(i => i.name == li.end)
		);
		var evolvedToEvolving = this.props.mapObject.links.filter(
			li =>
				mapElements.getEvolvedElements().find(i => i.name == li.start) &&
				mapElements.getEvolveElements().find(i => i.name == li.end)
		);
		var bothEvolved = this.props.mapObject.links.filter(
			li =>
				mapElements.getEvolvedElements().find(i => i.name == li.start) &&
				mapElements.getEvolvedElements().find(i => i.name == li.end)
		);
		var evolveStartLinks = this.props.mapObject.links.filter(
			li =>
				mapElements.getEvolvedElements().find(i => i.name == li.start) &&
				mapElements.getNoneEvolvingElements().find(i => i.name == li.end)
		);
		var bothEvolving = this.props.mapObject.links.filter(
			li =>
				mapElements.getEvolveElements().find(i => i.name == li.start) &&
				mapElements.getEvolveElements().find(i => i.name == li.end)
		);
		var evolveToEvolved = this.props.mapObject.links.filter(
			li =>
				mapElements.getEvolveElements().find(i => i.name == li.start) &&
				mapElements.getEvolvedElements().find(i => i.name == li.end)
		);

		return (
			<React.Fragment>
				<svg
					fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
					fontSize='0.85em'
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
							<path d="M0,-5L10,0L0,5" fill={this.props.mapStyleDefs.link.evolvedStroke} />
						</marker>
					</defs>
					<g id="grid">
						<MapGrid mapDimensions={this.props.mapDimensions} mapStyleDefs={this.props.mapStyleDefs} />
						<MapEvolution
							mapDimensions={this.props.mapDimensions}
							mapEvolutionStates={this.props.mapEvolutionStates}
							mapStyleDefs={this.props.mapStyleDefs}
						/>
					</g>
					<g id="map">
						<g id="methods">
							{this.props.mapObject.methods.map((m, i) =>
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
						<g id="links">
							{this.props.mapObject.links.map((l, i) =>
								canSatisfyLink(
									l,
									mapElements.getMergedElements(),
									mapElements.getMergedElements()
								) == false ? null : (
									<ComponentLink
										mapStyleDefs={this.props.mapStyleDefs}
										key={i}
										mapDimensions={this.props.mapDimensions}
										startElement={getElementByName(
											mapElements.getMergedElements(),
											l.start
										)}
										endElement={getElementByName(
											mapElements.getMergedElements(),
											l.end
										)}
										link={l}
									/>
								)
							)}
						</g>

						<g id="evolvingToEvolveEndLinks">
							{evolvingToNoneEvolvingEndLinks.map((l, i) =>
								canSatisfyLink(
									l,
									mapElements.getEvolveElements(),
									mapElements.getNoneEvolvingElements()
								) == false ? null : (
									<ComponentLink
										mapStyleDefs={this.props.mapStyleDefs}
										key={i}
										mapDimensions={this.props.mapDimensions}
										startElement={getElementByName(
											mapElements.getEvolveElements(),
											l.start
										)}
										endElement={getElementByName(
											mapElements.getNoneEvolvingElements(),
											l.end
										)}
										link={l}
									/>
								)
							)}
						</g>
						
						<g id="evolvingEndLinks">
							{evolvingEndLinks.map((l, i) =>
								canSatisfyLink(
									l,
									mapElements.getNoneEvolvingElements(),
									mapElements.getEvolveElements()
								) == false ? null : (
									<ComponentLink
										mapStyleDefs={this.props.mapStyleDefs}
										key={i}
										mapDimensions={this.props.mapDimensions}
										startElement={getElementByName(
											mapElements.getNoneEvolvingElements(),
											l.start
										)}
										endElement={getElementByName(
											mapElements.getEvolveElements(),
											l.end
										)}
										link={l}
									/>
								)
							)}
						</g>
						<g id="evolvingBothLinks">
							{bothEvolved.map((l, i) =>
								canSatisfyLink(
									l,
									mapElements.getEvolvedElements(),
									mapElements.getEvolvedElements()
								) == false ? null : (
									<ComponentLink
										mapStyleDefs={this.props.mapStyleDefs}
										key={i}
										mapDimensions={this.props.mapDimensions}
										startElement={getElementByName(
											mapElements.getEvolvedElements(),
											l.start
										)}
										endElement={getElementByName(
											mapElements.getEvolvedElements(),
											l.end
										)}
										link={l}
									/>
								)
							)}
						</g>
						<g id="evolvedToEvolvingLinks">
							{evolvedToEvolving.map((l, i) =>
								canSatisfyLink(
									l,
									mapElements.getEvolvedElements(),
									mapElements.getEvolveElements()
								) == false ? null : (
									<ComponentLink
										mapStyleDefs={this.props.mapStyleDefs}
										key={i}
										mapDimensions={this.props.mapDimensions}
										startElement={getElementByName(
											mapElements.getEvolvedElements(),
											l.start
										)}
										endElement={getElementByName(
											mapElements.getEvolveElements(),
											l.end
										)}
										link={l}
									/>
								)
							)}
						</g>
						<g id="evolvingStartLinks">
							{evolveStartLinks.map((l, i) =>
								canSatisfyLink(
									l,
									mapElements.getNoneEvolvingElements(),
									mapElements.getEvolveElements()
								) == false ? null : (
									<ComponentLink
										mapStyleDefs={this.props.mapStyleDefs}
										key={i}
										mapDimensions={this.props.mapDimensions}
										startElement={getElementByName(
											mapElements.getNoneEvolvingElements(),
											l.start
										)}
										endElement={getElementByName(
											mapElements.getEvolveElements(),
											l.end
										)}
										link={l}
									/>
								)
							)}
						</g>
						<g id="evolvingStartEvolvingEndLinks">
							{bothEvolving.map((l, i) =>
								canSatisfyLink(
									l,
									mapElements.getEvolveElements(),
									mapElements.getEvolveElements()
								) == false ? null : (
									<ComponentLink
										mapStyleDefs={this.props.mapStyleDefs}
										key={i}
										mapDimensions={this.props.mapDimensions}
										startElement={getElementByName(
											mapElements.getEvolveElements(),
											l.start
										)}
										endElement={getElementByName(
											mapElements.getEvolveElements(),
											l.end
										)}
										link={l}
									/>
								)
							)}
						</g>
						<g id="evolvedStartEvolvingEndLinks">
							{evolveToEvolved.map((l, i) =>
								canSatisfyLink(
									l,
									mapElements.getEvolveElements(),
									mapElements.getEvolvedElements()
								) == false ? null : (
									<ComponentLink
										mapStyleDefs={this.props.mapStyleDefs}
										key={i}
										mapDimensions={this.props.mapDimensions}
										startElement={getElementByName(
											mapElements.getEvolveElements(),
											l.start
										)}
										endElement={getElementByName(
											mapElements.getEvolvedElements(),
											l.end
										)}
										link={l}
									/>
								)
							)}
						</g>
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
							{this.props.mapObject.annotations.map((a, i) => (
								<React.Fragment key={i}>
								{a.occurances.map((o, i1) => ( 
									<AnnotationElement
										mapStyleDefs={this.props.mapStyleDefs} 
										key={i1 + "_" + i}
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
							{this.props.mapObject.annotations.length == 0 ? null : 
								<AnnotationBox 
									mapStyleDefs={this.props.mapStyleDefs}
									mutateMapText={this.props.mutateMapText}
									mapText={this.props.mapText}
									annotations={this.props.mapObject.annotations} 
									position={this.props.mapObject.presentation.annotations}
									mapDimensions={this.props.mapDimensions}
									mapStyle={this.props.mapStyle}
									/>
							}
						</g>
					</g>
				</svg>
			</React.Fragment>
		);
	}
}

export default MapCanvas;
