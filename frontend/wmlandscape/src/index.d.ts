// Base interfaces
export interface ComponentLabel {
    x: number;
    y: number;
}

export interface ComponentDecorator {
    method?: string;
    certainty?: string;
    visibility?: string;
    maturity?: string;
}

// Map element interfaces
export interface BaseMapElement {
    id: string;
    name: string;
    maturity: number;
    visibility: number;
    line?: number;
}

export interface UnifiedComponent extends BaseMapElement {
    type: string;
    label: ComponentLabel;
    increaseLabelSpacing?: number;
    evolving?: boolean;
    evolved?: boolean;
    evolveMaturity?: number;
    decorators: ComponentDecorator;
    inertia?: boolean;
    pseudoComponent?: boolean;
    offsetY?: number;
    override?: string;
    url?: string | {url: string; [key: string]: any};
    pipeline?: boolean;
}

// Link interfaces
export interface BaseLink {
    start: string;
    end: string;
    line?: number;
}

export interface FlowLink extends BaseLink {
    flow?: boolean;
    flowValue?: string;
    future?: boolean;
    past?: boolean;
    context?: string;
}

// Main MapView component
export interface MapViewProps {
    mapText?: string;
    mapTitle?: string;
    highlightLine?: number;
    onMapChanged?: (mapText: string) => void;
    showLinkedEvolved?: boolean;
    launchUrl?: (urlId: string) => void;
    mapStyleDefs?: any;
    mapDimensions?: { width: number; height: number };
    mapCanvasDimensions?: { width: number; height: number };
    mapEvolutionStates?: any;
    mapStyleSheetPath?: string;
    mapClass?: string;
    mapInertia?: any[];
    mapComponents?: any[];
    mapPipelines?: any[];
    mapLinks?: any[];
    mapAnchors?: any[];
    evolutionOffsets?: any;
    mapAnnotationsPresentation?: any;
    wardleyMap?: UnifiedWardleyMap;
    mapRef?: React.RefObject<HTMLDivElement>;
    mutateMapText?: (text: string) => void;
    setMetaText?: (meta: any) => void;
    [key: string]: any;
}

export const MapView: React.FC<MapViewProps>;

// Map structure
export interface MapPresentationStyle {
    size?: { width: number; height: number };
    style?: string;
    annotations?: any[];
    yAxis?: Record<string, any>;
}

export interface MapParseError {
    line: number;
    message: string;
    type: string;
}

export interface UnifiedWardleyMap {
    title: string;
    presentation: MapPresentationStyle;
    errors: Array<MapParseError>;
    components: UnifiedComponent[];
    anchors: UnifiedComponent[];
    submaps: UnifiedComponent[];
    markets: UnifiedComponent[];
    ecosystems: UnifiedComponent[];
    evolved: any[];
    pipelines: any[];
    evolution: any[];
    links: FlowLink[];
    annotations: any[];
    notes: any[];
    methods: any[];
    urls: any[];
    attitudes: any[];
    accelerators: any[];
}

// Constants and styles
export const MapStyles: {
    plain: string;
    Plain: string;
    colour: string;
    Colour: string;
    Wardley: string;
    Handwritten: string;
};

export const Defaults: {
    defaultTextPosition: {
        maturity: number;
        visibility: number;
    };
    defaultNotePosition: {
        maturity: number;
        visibility: number;
    };
    metaText: {
        evolution: string;
        title: string;
    };
    position: {
        note: {
            offsetX: number;
            offsetY: number;
        };
    };
    EvolutionStages: any;
    EvoOffsets: any;
};

// Converter
export class UnifiedConverter {
    constructor(featureSwitches?: any);
    parse(mapText: string): UnifiedWardleyMap;
}

// Contexts and Providers
export const FeatureSwitchesContext: React.Context<any>;
export const FeatureSwitchesProvider: React.FC<{ value: any; children: React.ReactNode }>;
export function useFeatureSwitches(): any;

export const ModKeyPressedContext: React.Context<boolean>;
export const ModKeyPressedProvider: React.FC<{ children: React.ReactNode }>;
export function useModKeyPressedConsumer(): boolean;

// State Hooks
export function useUnifiedMapState(): {
    state: {
        map: UnifiedWardleyMap;
        highlightedLine: number;
        newComponentContext: any | null;
        showLinkedEvolved: boolean;
    };
    actions: {
        setMap: React.Dispatch<React.SetStateAction<UnifiedWardleyMap>>;
        setHighlightedLine: React.Dispatch<React.SetStateAction<number>>;
        setNewComponentContext: React.Dispatch<React.SetStateAction<any | null>>;
        setShowLinkedEvolved: React.Dispatch<React.SetStateAction<boolean>>;
    };
};

export function useLegacyMapState(): any;

export function useFeatureSwitches(): any;
export function useLegacyMapState(): any;
export function useModKeyPressedConsumer(): any;

export const ModKeyPressedProvider: React.FC<any>;
export const FeatureSwitchesProvider: React.FC<any>;

export const MapElements: any;
export const MapStyles: any;
export const UnifiedConverter: {
    parse(mapText: string): UnifiedWardleyMap;
};

// Helper functions
export function createEmptyMap(): UnifiedWardleyMap;

// Component exports (note: all other exports from index.js would be added here)
export const MapBackground: React.FC<any>;
export const MapEvolution: React.FC<any>;
export const MapGraphics: React.FC<any>;
export const MapGrid: React.FC<any>;
export const MapView: React.FC<any>;
export const DefaultPositionUpdater: any;
export const ExistingCoordsMatcher: any;
export const ExistingManyCoordsMatcher: any;
export const ExistingMaturityMatcher: any;
export const ExistingSingleCoordMatcher: any;
export const LineNumberPositionUpdater: any;
export const NotDefinedCoordsMatcher: any;
export const NotDefinedManyCoordsMatcher: any;
export const NotDefinedMaturityMatcher: any;
export const SingletonPositionUpdater: any;

// Additional exports from index.js
export const LinksBuilder: any;
export const LinksExtractionStrategy: any;
export const LinkSymbol: any;
export const MapAccelerator: any;
export const MapCanvas: any;
export const MapComponent: any;
export const MarketExtractionStrategy: any;
export const MarketSymbol: any;
export const MethodElement: any;
export const MethodExtractionStrategy: any;
export const MethodSymbol: any;
export const Movable: any;
export const Note: any;
export const NoteExtractionStrategy: any;
export const ParseError: any;
export const Pipeline: any;
export const PipelineBoxSymbol: any;
export const PipelineComponentSymbol: any;
export const PipelineExtractionStrategy: any;
export const PipelineStrategyRunner: any;
export const PipelineVersion2: any;
export const PositionCalculator: any;
export const PresentationExtractionStrategy: any;
export const QuickAdd: any;
export const RelativeMovable: any;
export const SubMapExtractionStrategy: any;
export const SubMapSymbol: any;
export const SVGWrapper: any;
export const TitleExtractionStrategy: any;
export const UrlExtractionStrategy: any;
export const Usages: any;
export const XAxisLabelsExtractionStrategy: any;
