// Basic Text Theme
export interface TextTheme {
    fontSize?: string;
    fontWeight: string;
    evolvedTextColor: string;
    textColor: string;
}

// Component Theme
export interface MapComponentTheme extends TextTheme {
    fill?: string;
    stroke?: string;
    evolved?: string;
    evolvedFill?: string;
    strokeWidth?: number;
    pipelineStrokeWidth?: number;
    radius?: number;
    textOffset?: number;
}

// Annotation Theme
export interface MapAnnotationTheme {
    stroke: string;
    strokeWidth: number;
    fill: string;
    text: string;
    boxStroke: string;
    boxStrokeWidth: number;
    boxFill: string;
    boxTextColour: string;
}

// Attitude Theme
export interface MapAttitudeTypeTheme {
    stroke?: string;
    fill?: string;
    fillOpacity?: number;
    strokeOpacity?: number;
}

export interface MapAttitudeTheme {
    strokeWidth?: string;
    fontSize?: string;
    pioneers?: MapAttitudeTypeTheme;
    settlers?: MapAttitudeTypeTheme;
    townplanners?: MapAttitudeTypeTheme;
}

// Note Theme
export interface MapNoteTheme extends TextTheme {
    fontWeight: string;
    fill?: string;
}

// Method Theme
export interface MapMethodTheme {
    stroke?: string;
    fill?: string;
}

export interface MapMethodsTheme {
    buy: MapMethodTheme;
    build: MapMethodTheme;
    outsource: MapMethodTheme;
}

// Main Theme Interface
export interface MapTheme {
    className?: string;
    containerBackground?: string;
    fontFamily?: string;
    fontSize?: string;
    stroke?: string;
    pipelineArrowStroke?: string;
    evolutionSeparationStroke?: string;
    mapGridTextColor?: string;
    pipelineArrowHeight?: number;
    pipelineArrowWidth?: number;
    strokeWidth?: number;
    strokeDasharray?: string;
    anchor?: {
        fontSize?: string;
    };
    attitudes: MapAttitudeTheme;
    methods: MapMethodsTheme;
    market?: {
        stroke?: string;
        fill?: string;
    };
    component: MapComponentTheme;
    submap?: {
        fontSize?: string;
        fill?: string;
        stroke?: string;
        evolved?: string;
        evolvedFill?: string;
        strokeWidth?: number;
        pipelineStrokeWidth?: number;
        radius?: number;
        textColor?: string;
        textOffset?: number;
        evolvedTextColor?: string;
    };
    link?: {
        stroke?: string;
        strokeWidth?: number;
        evolvedStroke?: string;
        evolvedStrokeWidth?: number;
        flow?: string;
        flowStrokeWidth?: number;
        flowText?: string;
        contextFontSize?: string;
    };
    fluidLink?: {
        stroke?: string;
        strokeDasharray?: string;
        strokeWidth?: number;
    };
    annotation: MapAnnotationTheme;
    note: MapNoteTheme;
}
