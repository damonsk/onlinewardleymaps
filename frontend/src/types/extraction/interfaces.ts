export interface ExtractionDefaultPosition {
    visibility: number;
    maturity: number;
}

export interface ExtractionSizePosition {
    width: number;
    height: number;
}

export interface ExtractionConfig {
    keyword: string;
}

export interface ExtractionObjectWithText {
    text: string;
}

export interface ExtractionObjectWithRef {
    url: string;
}

export interface ExtractionObjectWithName {
    name: string;
}

export interface ExtractionObjectWithCoords {
    maturity: number;
    visibility: number;
}

export interface ExtractionObjectWithOccurances {
    occurances: ExtractionDefaultPosition[];
}

export interface ExtractionObjectWithPipeline {
    hidden: boolean;
    maturity2: number;
    maturity1: number;
}

export interface ExtractionObjectWithPipelineComponent {
    maturity: number;
}

export interface ExtractionObjectWithNumber {
    number: number;
}

export interface ExtractionObjectWithMaturity {
    name: string;
    override: string;
    maturity: number;
}

export interface ExtractionObjectWithMethod {
    name: string;
    method: string;
}

export interface ExtractionObjectWithHeightWidth {
    width: string;
    height: string;
}

export interface ExtractionObjectWithDecorator {
    deaccelerator: boolean;
}
