import { EvolutionLabel } from '../../conversion/XAxisLabelsExtractionStrategy';
import { Link } from '../../linkStrategies/LinkStrategiesInterfaces';
import { ComponentDecorator } from '../base';
import { MapPresentationStyle } from './strategies';

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
    errors: Array<Error>;
}
