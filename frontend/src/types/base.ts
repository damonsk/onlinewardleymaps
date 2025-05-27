import { ComponentDectorator } from '../MapElements';

// Link Types
export interface Link {
    start: string;
    end: string;
}

export interface MapElement {
    inertia: boolean;
    name: string;
    id: string;
    visibility: number;
    type: string;
    evolveMaturity?: number;
    maturity: number;
    evolving?: boolean;
    evolved?: boolean;
    pseudoComponent?: boolean;
    offsetY?: number;
    label: ComponentLabel;
    override?: any;
    line?: any;
    decorators: ComponentDectorator;
    increaseLabelSpacing?: number;
}

export interface LinkExtractionStrategy {
    getLinks(): LinkResult;
}

export interface MapElements {
    getEvolveElements(): MapElement[];
    getEvolvedElements(): MapElement[];
    getNoneEvolvedOrEvolvingElements(): MapElement[];
    getNoneEvolvingElements(): MapElement[];
}

export interface LinkStrategy {
    name: string;
    links: Link[];
    startElements: MapElement[];
    endElements: MapElement[];
}

export interface Anchor {
    name: string;
}

export interface LinkResult {
    name: string;
    links: Link[];
    startElements: MapElement[];
    endElements: MapElement[];
}

// Core Component Types

// Map Conversion Types
export interface ComponentLabel {
    x: number;
    y: number;
}

export interface NamedComponent {
    name: string;
    label: ComponentLabel;
    line: number;
}

export interface MapLinks extends Link {
    flow?: boolean;
    future?: boolean;
    past?: boolean;
    context?: string;
    flowValue?: string;
}

export interface MapAnchors extends NamedComponent {
    evolved: boolean;
    maturity: number;
    visibility: number;
    id: string;
    type: string;
    inertia: boolean;
    decorators: ComponentDecorator;
}

export interface MapEvolved {}
export interface MapPipelines {}
export interface MapComponents extends NamedComponent {}

export interface MapAnnotation {
    maturity: number;
    number: number;
    visibility: number;
    text: string;
}

export interface MapAnnotations {
    number: number;
    occurances: Array<MapAnnotation>;
    text: string;
}

export interface MapNotes {}
export interface MapEvolution extends Array<EvolutionLabel> {}
export interface MapMethods {}
export interface MapSubmaps extends NamedComponent {}
export interface MapMarkets extends NamedComponent {}
export interface MapEcosystems {}
export interface MapUrls {
    name: string;
    url: string;
}

export interface MapAttitudes {}

export interface MapAccelerators {
    id: string;
    name: string;
    maturity: number;
    visibility: number;
    offsetY?: number;
    evolved?: boolean;
    deaccelerator: boolean;
    line: number;
}

// Main WardleyMap interface
export interface WardleyMap {
    presentation: MapPresentationStyle;
    links: MapLinks[];
    anchors: MapAnchors[];
    evolved: MapEvolved[];
    pipelines: MapPipelines[];
    elements: MapComponents[];
    annotations: MapAnnotations[];
    notes: MapNotes[];
    evolution: MapEvolution;
    methods: MapMethods[];
    title: string;
    submaps: MapSubmaps[];
    markets: MapMarkets[];
    ecosystems: MapEcosystems[];
    urls: MapUrls[];
    attitudes: MapAttitudes[];
    accelerators: MapAccelerators[];
    errors: Array<MapParseError>;
}

// Evolution Types
export interface EvolutionLabel {
    line1: string;
    line2: string;
}

// Core Component Types
export interface Component {
    url: MapUrls;
    decorators: ComponentDecorator;
    pipeline: any;
    name: string;
    id: string;
    visibility: number;
    type: string;
    maturity: number;
    evolveMaturity?: number;
    evolving: boolean;
    evolved?: boolean;
    pseudoComponent?: boolean;
    offsetY?: number;
    inertia: boolean;
    label: ComponentLabel;
    line: number;
}

export interface ComponentDecorator {
    ecosystem?: boolean;
    market?: boolean;
    method?: string;
}

export interface EvolvedElement {
    maturity: number;
    name: string;
    label: ComponentLabel;
    override?: Record<string, unknown>;
    line?: number;
    decorators: ComponentDecorator;
    increaseLabelSpacing: number;
}

export interface Pipeline {
    name: string;
    components: Component[];
    inertia: boolean;
    visibility: number;
    hidden?: boolean;
}

// Strategy Types
export interface IParseStrategy {
    apply(): any;
}

export interface IProvideDefaultAttributes {
    increaseLabelSpacing?: number;
}

export interface IProvideBaseElement {
    id: number;
    line: number;
}

export interface IProvideDecoratorsConfig {
    keyword: string;
    containerName: string;
    config?: IProvideBaseStrategyRunnerConfig;
}

export interface IProvideBaseStrategyRunnerConfig {
    containerName: string;
    keyword: string;
    defaultAttributes: IProvideDefaultAttributes;
}

export interface MapComponent {
    maturity: number;
    visibility: number;
}

export interface IPipelineComponent extends IProvideBaseElement {
    components: MapComponent[];
    maturity1?: number;
    maturity2?: number;
    hidden?: boolean;
}

// Map Presentation Types
export interface MapAnnotationsPosition {
    visibility: number;
    maturity: number;
}

export interface MapSize {
    width: number;
    height: number;
}

export interface MapPresentationStyle {
    style: string;
    annotations: MapAnnotationsPosition;
    size: MapSize;
}

// Position Updater Types
export type MatcherFunction = (
    line: string,
    identifier: string,
    type: string,
) => boolean;

export type ActionFunction = (line: string, moved: any) => string;

export interface Replacer {
    matcher: MatcherFunction;
    action: ActionFunction;
}

export interface PositionUpdater {
    setSuccessor(positionUpdater: PositionUpdater): unknown;
    update(moved: any, identifier: string): void;
}

// Moved Types
export interface Moved {
    param1: number;
    param2: number;
}

export interface ManyCoordsMoved extends Moved {
    param3: number;
    param4: number;
}

export interface SingleCoordMoved {
    param2: string;
}

// Map Parse Types
export interface MapParseComponent {
    errors: MapParseError[];
}

export interface MapParseError {
    line: number;
    name: string;
}

export interface MapTitleComponent extends MapParseComponent {
    title: string;
}
