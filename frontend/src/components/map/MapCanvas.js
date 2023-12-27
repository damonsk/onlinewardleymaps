import React, { useMemo, useState, useEffect } from 'react';
import MethodElement from './MethodElement';
import MapElements from '../../MapElements';
import MapGrid from './foundation/MapGrid';
import MapEvolution from './foundation/MapEvolution';
import Pipeline from './Pipeline';
import PipelineVersion2 from './PipelineVersion2';
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
import { featureSwitches } from '../../constants/featureswitches';
import styles from '../../styles/MapCanvas.module.css';
import MapAccelerator from './MapAccelerator';
import AcceleratorSymbol from '../symbols/AcceleratorSymbol';

function MapCanvas(props) {
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
		svgRef,
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
		mapPadding,
		mapAccelerators,
	} = props;
	const isModKeyPressed = useModKeyPressedConsumer();
	const [mapElementsClicked, setMapElementsClicked] = useState([]);
	const mapElements = new MapElements(
		[
			{ collection: mapComponents, type: 'component' },
			{ collection: mapSubMaps, type: 'submap' },
			{ collection: mapMarkets, type: 'market' },
			{ collection: mapEcosystems, type: 'ecosystem' },
		],
		mapEvolved,
		mapPipelines
	);

	const newElementAt = function (e) {
		var svg = document.getElementById('svgMap');
		var pt = svg.createSVGPoint();

		function getCursor(evt) {
			pt.x = evt.clientX;
			pt.y = evt.clientY;
			return pt.matrixTransform(svg.getScreenCTM().inverse());
		}

		var loc = getCursor(e);

		const positionCalc = new PositionCalculator();
		const x = positionCalc.xToMaturity(loc.x, mapDimensions.width);
		const y = positionCalc.yToVisibility(loc.y, mapDimensions.height);
		setNewComponentContext({ x, y });
	};

	var getElementByName = function (elements, name) {
		var hasName = function (element) {
			return element.name === name;
		};
		return elements.find(hasName);
	};

	useEffect(() => {
		if (isModKeyPressed === false) {
			setMapElementsClicked([]);
		}
	}, [isModKeyPressed]);

	const clicked = function (ctx) {
		setHighlightLine(ctx.el.line);
		if (isModKeyPressed === false) return;

		let s = [
			...mapElementsClicked,
			{ el: ctx.el, e: { pageX: ctx.e.pageX, pageY: ctx.e.pageY } },
		];
		if (s.length === 2) {
			mutateMapText(mapText + '\r\n' + s.map((r) => r.el.name).join('->'));
			setMapElementsClicked([]);
		} else setMapElementsClicked(s);
	};

	const linksBuilder = new LinksBuilder(
		mapLinks,
		mapElements,
		mapAnchors,
		showLinkedEvolved
	);
	const links = useMemo(() => linksBuilder.build(), [linksBuilder]);

	const asMethod = (m) =>
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
		.filter((m) => m.decorators && m.decorators.method)
		.map((m) => asMethod(m));

	const methods = mapMethods
		.filter((m) =>
			getElementByName(mapElements.getNonEvolvedElements(), m.name)
		)
		.map((m) => {
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
				onDoubleClick={(e) => newElementAt(e)}
				fontFamily={mapStyleDefs.fontFamily}
				fontSize={mapStyleDefs.fontSize}
				className={[mapStyleDefs.className, styles.mapCanvas].join(' ')}
				id="svgMap"
				ref={svgRef}
				width={mapDimensions.width + 2 * mapPadding}
				height={mapDimensions.height + 4 * mapPadding}
				viewBox={
					'-' +
					mapPadding +
					' 0 ' +
					(mapDimensions.width + mapPadding) +
					' ' +
					(mapDimensions.height + mapPadding)
				}
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
								/>
							);
						})}
					</g>

					{links.map((current) => {
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
									e.name
								)}
								endElement={getElementByName(
									mapElements.getEvolveElements(),
									e.name
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
								onClick={(e) => clicked({ el, e })}
							/>
						))}
					</g>
					<g id="accelerators">
						{featureSwitches.enableAccelerators &&
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
										onClick={() => setHighlightLine(el.line)}
									/>
								</MapAccelerator>
							))}
					</g>
					<g id="pipelines">
						{featureSwitches.enableNewPipelines &&
							mapElements
								.getMapPipelines()
								.filter((p) => p.hidden == false)
								.map((p, i) => (
									<React.Fragment key={i}>
										{featureSwitches.enableNewPipelines &&
										p.components != undefined &&
										p.components.length > 0 ? (
											<PipelineVersion2
												key={'pipeline_' + i}
												mapDimensions={mapDimensions}
												pipeline={p}
												mapText={mapText}
												mutateMapText={mutateMapText}
												setMetaText={setMetaText}
												metaText={metaText}
												mapStyleDefs={mapStyleDefs}
												setHighlightLine={setHighlightLine}
												linkingFunction={clicked}
											/>
										) : (
											<Pipeline
												key={i}
												mapDimensions={mapDimensions}
												pipeline={p}
												mapText={mapText}
												mutateMapText={mutateMapText}
												setMetaText={setMetaText}
												metaText={metaText}
												mapStyleDefs={mapStyleDefs}
												setHighlightLine={setHighlightLine}
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
							>
								{el.type === 'component' && (
									<ComponentSymbol
										id={'element_circle_' + el.id}
										styles={mapStyleDefs.component}
										evolved={el.evolved}
										onClick={(e) => clicked({ el, e })}
									/>
								)}

								{el.pipeline && (
									<PipelineComponentSymbol
										id={'element_square_' + el.id}
										styles={mapStyleDefs.component}
										evolved={el.evolved}
										onClick={(e) => clicked({ el, e })}
									/>
								)}

								{(el.decorators && el.decorators.ecosystem) ||
								el.type === 'ecosystem' ? (
									<EcosystemSymbol
										id={'ecosystem_circle_' + el.id}
										styles={mapStyleDefs.component}
										onClick={(e) => clicked({ el, e })}
									/>
								) : null}

								{(el.decorators && el.decorators.market) ||
								el.type === 'market' ? (
									<MarketSymbol
										id={'market_circle_' + el.id}
										styles={mapStyleDefs.component}
										onClick={(e) => clicked({ el, e })}
									/>
								) : null}

								{el.type === 'submap' && (
									<SubMapSymbol
										id={'element_circle_' + el.id}
										styles={mapStyleDefs.submap}
										evolved={el.evolved}
										onClick={(e) => clicked({ el, e })}
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
							/>
						)}
					</g>
				</g>
			</svg>
		</React.Fragment>
	);
}

export default MapCanvas;
