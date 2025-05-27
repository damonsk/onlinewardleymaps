export interface Link {
    start: string;
    end: string;
}

export interface MapElement {
    name: string;
    id: string;
    visibility: string | number; // Make this accept both string and number since both seem to be used
    type: string;
    evolveMaturity?: number;
    maturity?: number; // Add this for evolved elements
    evolving?: boolean;
    evolved?: boolean;
    pseudoComponent?: boolean;
    offsetY?: number;
    label?: string; // From EvolvedElement
    override?: any;
    line?: any;
    decorators?: any;
    increaseLabelSpacing?: boolean;
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
    startElements: MapElement[]; // Replace 'any' with the actual type returned by getNoneEvolvedOrEvolvingElements
    endElements: MapElement[]; // Replace 'any' with the actual type returned by getNoneEvolvedOrEvolvingElements
}
