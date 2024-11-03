export interface Link {
    start: string;
    end: string;
}

export interface MapElement {
    name: string;
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
