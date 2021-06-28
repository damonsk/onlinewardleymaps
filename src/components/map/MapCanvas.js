import React, { useMemo, useState, useEffect } from 'react';
import MethodElement from './MethodElement';
import MapElements from '../../MapElements';
import MapGrid from './foundation/MapGrid';
import MapEvolution from './foundation/MapEvolution';
import Pipeline from './Pipeline';
import ComponentLink from './ComponentLink';
import FluidLink from './FluidLink';
import EvolvingComponentLink from './EvolvingComponentLink';
import MapComponent from './MapComponent';
import AnnotationElement from './AnnotationElement';
import AnnotationBox from './AnnotationBox';
import Anchor from './Anchor';
import Note from './Note';
import Attitude from './Attitude';
import LinksBuilder from '../../linkStrategies/LinksBuilder';
import MapGraphics from './foundation/MapGraphics';
import MapBackground from './foundation/MapBackground';
import SubMapSymbol from '../symbols/SubMapSymbol';
import ComponentSymbol from '../symbols/ComponentSymbol';
import MarketSymbol from '../symbols/MarketSymbol';
import EcosystemSymbol from '../symbols/EcosystemSymbol';
import PipelineComponentSymbol from '../symbols/PipelineComponentSymbol';
import { useModKeyPressedConsumer } from '../KeyPressContext';
import PositionCalculator from './PositionCalculator';

function MapCanvas(props) {
	const isModKeyPressed = useModKeyPressedConsumer();
	const [mapElementsClicked, setMapElementsClicked] = useState([]);
	const mapElements = new MapElements(
		[
			{ collection: props.mapComponents, type: 'component' },
			{ collection: props.mapSubMaps, type: 'submap' },
			{ collection: props.mapMarkets, type: 'market' },
			{ collection: props.mapEcosystems, type: 'ecosystem' },
		],
		props.mapEvolved,
		props.mapPipelines
	);

	const newElementAt = function(e) {
		var svg = document.getElementById('svgMap');
		var pt = svg.createSVGPoint();

		function getCursor(evt) {
			pt.x = evt.clientX;
			pt.y = evt.clientY;
			return pt.matrixTransform(svg.getScreenCTM().inverse());
		}

		var loc = getCursor(e);

		const positionCalc = new PositionCalculator();
		const x = positionCalc.xToMaturity(loc.x, props.mapDimensions.width);
		const y = positionCalc.yToVisibility(loc.y, props.mapDimensions.height);
		props.setNewComponentContext({ x, y });
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
		props.setHighlightLine(ctx.el.line);
		if (isModKeyPressed === false) return;

		let s = [
			...mapElementsClicked,
			{ el: ctx.el, e: { pageX: ctx.e.pageX, pageY: ctx.e.pageY } },
		];
		if (s.length === 2) {
			props.mutateMapText(
				props.mapText + '\r\n' + s.map(r => r.el.name).join('->')
			);
			setMapElementsClicked([]);
		} else setMapElementsClicked(s);
	};

	const linksBuilder = new LinksBuilder(
		props.mapLinks,
		mapElements,
		props.mapAnchors,
		props.showLinkedEvolved
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
			}
		);

	const decoratedComponentsMethods = mapElements
		.getMergedElements()
		.filter(m => m.decorators && m.decorators.method)
		.map(m => asMethod(m));

	const methods = props.mapMethods
		.filter(m => getElementByName(mapElements.getNonEvolvedElements(), m.name))
		.map(m => {
			const el = getElementByName(mapElements.getNonEvolvedElements(), m.name);
			const toTransform = Object.assign(el, {
				decorators: { method: m.method },
			});
			return asMethod(toTransform);
		});
	const allMeths = methods.concat(decoratedComponentsMethods);

	return (
		<React.Fragment>
			<svg
				onDoubleClick={e => newElementAt(e)}
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
					<g id="attitudes">
						{props.mapAttitudes.map((a, i) => (
							<Attitude
								key={i}
								mapDimensions={props.mapDimensions}
								mapStyleDefs={props.mapStyleDefs}
								mapText={props.mapText}
								mutateMapText={props.mutateMapText}
								attitude={a}
							/>
						))}
					</g>

					<g id="methods">
						{allMeths.map((m, i) => (
							<MethodElement
								key={i}
								element={m}
								mapStyleDefs={props.mapStyleDefs}
								mapDimensions={props.mapDimensions}
								method={m.method}
							/>
						))}
					</g>

					<g id="fluids" key="fluids">
						{mapElementsClicked.map((current, i) => {
							return (
								<FluidLink
									key={i}
									mapStyleDefs={props.mapStyleDefs}
									mapDimensions={props.mapDimensions}
									startElement={current.el}
									origClick={current.e}
								/>
							);
						})}
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
								onClick={e => clicked({ el, e })}
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
								keyword={el.type}
								launchUrl={props.launchUrl}
								mapDimensions={props.mapDimensions}
								element={el}
								mapText={props.mapText}
								mutateMapText={props.mutateMapText}
								setMetaText={props.setMetaText}
								metaText={props.metaText}
								mapStyleDefs={props.mapStyleDefs}
								setHighlightLine={props.setHighlightLine}
							>
								{el.type === 'component' && (
									<ComponentSymbol
										id={'element_circle_' + el.id}
										styles={props.mapStyleDefs.component}
										evolved={el.evolved}
										onClick={e => clicked({ el, e })}
									/>
								)}

								{el.pipeline && (
									<PipelineComponentSymbol
										id={'element_square_' + el.id}
										styles={props.mapStyleDefs.component}
										evolved={el.evolved}
										onClick={e => clicked({ el, e })}
									/>
								)}

								{(el.decorators && el.decorators.ecosystem) ||
								el.type === 'ecosystem' ? (
									<EcosystemSymbol
										id={'ecosystem_circle_' + el.id}
										styles={props.mapStyleDefs.component}
										onClick={e => clicked({ el, e })}
									/>
								) : null}

								{(el.decorators && el.decorators.market) ||
								el.type === 'market' ? (
									<MarketSymbol
										id={'market_circle_' + el.id}
										styles={props.mapStyleDefs.component}
										onClick={e => clicked({ el, e })}
									/>
								) : null}

								{el.type === 'submap' && (
									<SubMapSymbol
										id={'element_circle_' + el.id}
										styles={props.mapStyleDefs.submap}
										evolved={el.evolved}
										onClick={e => clicked({ el, e })}
										launchUrl={() => props.launchUrl(el.url)}
									/>
								)}
							</MapComponent>
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
