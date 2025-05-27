export interface IParseStrategy {
    apply(): any;
}

export interface IProvideDefaultAttributes {
    increaseLabelSpacing?: number;
}

export interface IProvideBaseStrategyRunnerConfig {
    containerName: string;
    keyword: string;
    defaultAttributes: IProvideDefaultAttributes;
}

export interface IProvideBaseElement {
    id: number;
    line: number;
}

export interface IProvideDecoratorsConfig {
    keyword: string;
    containerName: string;
}

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
