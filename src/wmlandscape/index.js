import MapBackground from '../components/map/foundation/MapBackground';
import MapEvolution from '../components/map/foundation/MapEvolution';
import MapGraphics from '../components/map/foundation/MapGraphics';
import MapGrid from '../components/map/foundation/MapGrid';
import DefaultPositionUpdater from '../components/map/positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from '../components/map/positionUpdaters/ExistingCoordsMatcher';
import { ExistingManyCoordsMatcher } from '../components/map/positionUpdaters/ExistingManyCoordsMatcher';
import { ExistingSingleCoordMatcher } from '../components/map/positionUpdaters/ExistingSingleCoordMatcher';
import LineNumberPositionUpdater from '../components/map/positionUpdaters/LineNumberPositionUpdater';
import { NotDefinedCoordsMatcher } from '../components/map/positionUpdaters/NotDefinedCoordsMatcher';
import { NotDefinedManyCoordsMatcher } from '../components/map/positionUpdaters/NotDefinedManyCoordsMatcher';
import SingletonPositionUpdater from '../components/map/positionUpdaters/SingletonPositionUpdater';

import Anchor from '../components/map/Anchor';
import AnnotationBox from '../components/map/AnnotationBox';
import AnnotationElement from '../components/map/AnnotationElement';
import Attitude from '../components/map/Attitude';
import ComponentLink from '../components/map/ComponentLink';
import ComponentText from '../components/map/ComponentText';
import EvolvingComponentLink from '../components/map/EvolvingComponentLink';
import FlowText from '../components/map/FlowText';
import Inertia from '../components/map/Inertia';
import MapCanvas from '../components/map/MapCanvas';
import MapComponent from '../components/map/MapComponent';
import MapView from '../components/map/MapView';
import MethodElement from '../components/map/MethodElement';
import Movable from '../components/map/Movable';
import Note from '../components/map/Note';
import Pipeline from '../components/map/Pipeline';
import PositionCalculator from '../components/map/PositionCalculator';
import RelativeMovable from '../components/map/RelativeMovable';
import AccelerateSymbol from '../components/symbols/AccelerateSymbol';
import AnnotationBoxSymbol from '../components/symbols/AnnotationBoxSymbol';
import AnnotationElementSymbol from '../components/symbols/AnnotationElementSymbol';
import AnnotationTextSymbol from '../components/symbols/AnnotationTextSymbol';
import AttitudeSymbol from '../components/symbols/AttitudeSymbol';
import ComponentSymbol from '../components/symbols/ComponentSymbol';
import ComponentTextSymbol from '../components/symbols/ComponentTextSymbol';
import EcosystemSymbol from '../components/symbols/EcosystemSymbol';
import {
	SVGWrapper,
	ComponentIcon,
	ComponentEvolvedIcon,
	InertiaIcon,
} from '../components/symbols/icons';
import InertiaSymbol from '../components/symbols/InertiaSymbol';
import LinkSymbol from '../components/symbols/LinkSymbol';
import MarketSymbol from '../components/symbols/MarketSymbol';
import MethodSymbol from '../components/symbols/MethodSymbol';
import PipelineBoxSymbol from '../components/symbols/PipelineBoxSymbol';
import PipelineComponentSymbol from '../components/symbols/PipelineComponentSymbol';
import SubMapSymbol from '../components/symbols/SubMapSymbol';
import * as Defaults from '../constants/defaults';
import * as EditorPrefixes from '../constants/editorPrefixes';
import * as MapStyles from '../constants/mapstyles';
import * as Usages from '../constants/usages';

import AnchorExtractionStrategy from '../conversion/AnchorExtractionStrategy';
import AnnotationExtractionStrategy from '../conversion/AnnotationExtractionStrategy';
import AttitudeExtractionStrategy from '../conversion/AttitudeExtractionStrategy';
import BaseStrategyRunner from '../conversion/BaseStrategyRunner';
import ComponentExtractionStrategy from '../conversion/ComponentExtractionStrategy';
import Converter from '../conversion/Converter';
//import EcosystemExtractionStrategy from '../conversion/EcosystemExtractionStrategy';
import EvolveExtractionStrategy from '../conversion/EvolveExtractionStrategy';
import ExtendableComponentExtractionStrategy from '../conversion/ExtendableComponentExtractionStrategy';
import LinksExtractionStrategy from '../conversion/LinksExtractionStrategy';
import MarketExtractionStrategy from '../conversion/MarketExtractionStrategy';
import MethodExtractionStrategy from '../conversion/MethodExtractionStrategy';
import NoteExtractionStrategy from '../conversion/NoteExtractionStrategy';
import ParseError from '../conversion/ParseError';
import PipelineExtractionStrategy from '../conversion/PipelineExtractionStrategy';
import PresentationExtractionStrategy from '../conversion/PresentationExtractionStrategy';
import SubMapExtractionStrategy from '../conversion/SubMapExtractionStrategy';
import TitleExtractionStrategy from '../conversion/TitleExtractionStrategy';
import UrlExtractionStrategy from '../conversion/UrlExtractionStrategy';
import XAxisLabelsExtractionStrategy from '../conversion/XAxisLabelsExtractionStrategy';
import AllLinksStrategy from '../linkStrategies/AllLinksStrategy';
import AnchorLinksStrategy from '../linkStrategies/AnchorLinksStrategy';
import AnchorNoneEvolvedLinksStrategy from '../linkStrategies/AnchorNoneEvolvedLinksStrategy';
import BothEvolvedLinksStrategy from '../linkStrategies/BothEvolvedLinksStrategy';
import EvolvedToEvolvingLinksStrategy from '../linkStrategies/EvolvedToEvolvingLinksStrategy';
import EvolvedToNoneEvolvingLinksStrategy from '../linkStrategies/EvolvedToNoneEvolvingLinksStrategy';
import EvolveToEvolvedLinksStrategy from '../linkStrategies/EvolveToEvolvedLinksStrategy';
import EvolvingEndLinksStrategy from '../linkStrategies/EvolvingEndLinksStrategy';
import EvolvingToEvolvingLinksStrategy from '../linkStrategies/EvolvingToEvolvingLinksStrategy';
import EvolvingToNoneEvolvingEndLinksStrategy from '../linkStrategies/EvolvingToNoneEvolvingEndLinksStrategy';
import LinksBuilder from '../linkStrategies/LinksBuilder';
import MapElements from '../MapElements';
import MetaPositioner from '../MetaPositioner';

export {
	MapBackground,
	MapEvolution,
	MapGraphics,
	MapGrid,
	DefaultPositionUpdater,
	ExistingCoordsMatcher,
	ExistingManyCoordsMatcher,
	ExistingSingleCoordMatcher,
	LineNumberPositionUpdater,
	NotDefinedCoordsMatcher,
	NotDefinedManyCoordsMatcher,
	SingletonPositionUpdater,
	Anchor,
	AnnotationBox,
	AnnotationElement,
	Attitude,
	ComponentLink,
	ComponentText,
	EvolvingComponentLink,
	FlowText,
	Inertia,
	MapCanvas,
	MapComponent,
	MapView,
	MethodElement,
	Movable,
	Note,
	Pipeline,
	PositionCalculator,
	RelativeMovable,
	AccelerateSymbol,
	AnnotationBoxSymbol,
	AnnotationElementSymbol,
	AnnotationTextSymbol,
	AttitudeSymbol,
	ComponentSymbol,
	ComponentTextSymbol,
	EcosystemSymbol,
	SVGWrapper,
	ComponentIcon,
	ComponentEvolvedIcon,
	InertiaIcon,
	InertiaSymbol,
	LinkSymbol,
	MarketSymbol,
	MethodSymbol,
	PipelineBoxSymbol,
	PipelineComponentSymbol,
	SubMapSymbol,
	Defaults,
	EditorPrefixes,
	MapStyles,
	Usages,
	AnchorExtractionStrategy,
	AnnotationExtractionStrategy,
	AttitudeExtractionStrategy,
	BaseStrategyRunner,
	ComponentExtractionStrategy,
	Converter,
	//EcosystemExtractionStrategy,
	EvolveExtractionStrategy,
	ExtendableComponentExtractionStrategy,
	LinksExtractionStrategy,
	MarketExtractionStrategy,
	MethodExtractionStrategy,
	NoteExtractionStrategy,
	ParseError,
	PipelineExtractionStrategy,
	PresentationExtractionStrategy,
	SubMapExtractionStrategy,
	TitleExtractionStrategy,
	UrlExtractionStrategy,
	XAxisLabelsExtractionStrategy,
	AllLinksStrategy,
	AnchorLinksStrategy,
	AnchorNoneEvolvedLinksStrategy,
	BothEvolvedLinksStrategy,
	EvolvedToEvolvingLinksStrategy,
	EvolvedToNoneEvolvingLinksStrategy,
	EvolveToEvolvedLinksStrategy,
	EvolvingEndLinksStrategy,
	EvolvingToEvolvingLinksStrategy,
	EvolvingToNoneEvolvingEndLinksStrategy,
	LinksBuilder,
	MapElements,
	MetaPositioner,
};
