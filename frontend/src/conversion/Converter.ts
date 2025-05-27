import { OwmFeatureSwitches } from '../constants/featureswitches';
import { Link } from '../linkStrategies/LinkStrategiesInterfaces';
import { ComponentDectorator } from '../MapElements';
import AcceleratorExtractionStrategy from './AcceleratorExtractionStrategy';
import AnchorExtractionStrategy from './AnchorExtractionStrategy';
import AnnotationExtractionStrategy from './AnnotationExtractionStrategy';
import AttitudeExtractionStrategy from './AttitudeExtractionStrategy';
import ComponentExtractionStrategy from './ComponentExtractionStrategy';
import EcosystemExtractionStrategy from './EcosystemExtractionStrategy';
import EvolveExtractionStrategy from './EvolveExtractionStrategy';
import LinksExtractionStrategy from './LinksExtractionStrategy';
import MarketExtractionStrategy from './MarketExtractionStrategy';
import MethodExtractionStrategy from './MethodExtractionStrategy';
import NoteExtractionStrategy from './NoteExtractionStrategy';
import ParseError from './ParseError';
import PipelineExtractionStrategy from './PipelineExtractionStrategy';
import PresentationExtractionStrategy, {
    MapPresentationStyle,
} from './PresentationExtractionStrategy';
import SubMapExtractionStrategy from './SubMapExtractionStrategy';
import TitleExtractionStrategy from './TitleExtractionStrategy';
import UrlExtractionStrategy from './UrlExtractionStrategy';
import XAxisLabelsExtractionStrategy, {
    EvolutionLabel,
} from './XAxisLabelsExtractionStrategy';

export interface WardleyMap {
    presentation: MapPresentationStyle;
    links: MapLinks[];
    anchors: MapAnchors[];
    evolved: MapEvolved[];
    pipelines: MapPipelines[];
    elements: MapComponents[];
    annotations: MapAnnotations;
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
    errors: Array<ParseError>;
}

export interface MapAnnotation {
    maturity: number;
    number: number;
    visibility: number;
    text: string;
}
export interface NamedComponent {
    name: string;
    label: ComponentLabel;
}

export interface ComponentLabel {
    x: number;
    y: number;
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
    decorators: ComponentDectorator;
}
export interface MapEvolved {}
export interface MapPipelines {}
export interface MapComponents extends NamedComponent {}
export interface MapAnnotations {
    occurances: Array<MapAnnotation>;
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

export default class Converter {
    featureSwitches: OwmFeatureSwitches;
    constructor(featureSwitches: OwmFeatureSwitches) {
        this.featureSwitches = featureSwitches;
    }

    parse(data: string) {
        const t = this.stripComments(data);
        const strategies = [
            new TitleExtractionStrategy(t),
            new MethodExtractionStrategy(t),
            new XAxisLabelsExtractionStrategy(t),
            new PresentationExtractionStrategy(t),
            new NoteExtractionStrategy(t),
            new AnnotationExtractionStrategy(t),
            new ComponentExtractionStrategy(t),
            new MarketExtractionStrategy(t),
            new EcosystemExtractionStrategy(t),
            new PipelineExtractionStrategy(t, this.featureSwitches),
            new EvolveExtractionStrategy(t),
            new AnchorExtractionStrategy(t),
            new LinksExtractionStrategy(t),
            new SubMapExtractionStrategy(t),
            new UrlExtractionStrategy(t),
            new AttitudeExtractionStrategy(t),
            new AcceleratorExtractionStrategy(t),
        ];
        const errorContainer = { errors: [] };

        const nullPresentation = {
            style: '',
            annotations: { visibility: 0, maturity: 0 },
            size: { width: 0, height: 0 },
        };
        let wardleyMap: WardleyMap = {
            links: [],
            anchors: [],
            evolved: [],
            pipelines: [],
            elements: [],
            annotations: { occurances: [] },
            notes: [],
            presentation: nullPresentation,
            evolution: [],
            methods: [],
            submaps: [],
            markets: [],
            ecosystems: [],
            urls: [],
            attitudes: [],
            accelerators: [],
            title: '',
            errors: [],
        };
        strategies.forEach((strategy) => {
            const strategyResult = strategy.apply();
            wardleyMap = Object.assign(wardleyMap, strategyResult);
            if (strategyResult.errors && strategyResult.errors.length > 0)
                errorContainer.errors = errorContainer.errors.concat(
                    strategyResult.errors,
                );
        });
        return Object.assign(wardleyMap, errorContainer);
    }

    stripComments(data: string) {
        const doubleSlashRemoved = data.split('\n').map((line) => {
            if (line.trim().indexOf('url') === 0) {
                return line;
            }
            return line.split('//')[0];
        });

        const lines = doubleSlashRemoved;
        const linesToKeep = [];
        let open = false;

        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i];
            if (currentLine.indexOf('/*') > -1) {
                open = true;
                linesToKeep.push(currentLine.split('/*')[0].trim());
            } else if (open) {
                if (currentLine.indexOf('*/') > -1) {
                    open = false;
                    linesToKeep.push(currentLine.split('*/')[1].trim());
                }
            } else if (open === false) {
                linesToKeep.push(currentLine);
            }
        }

        return linesToKeep.join('\n');
    }
}
