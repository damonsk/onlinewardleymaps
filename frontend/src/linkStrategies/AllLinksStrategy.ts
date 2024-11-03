import MapElements, { Component } from '../MapElements'; // Assuming MapElements is defined in a separate file

interface LinkResult {
    name: string;
    links: string[];
    startElements: Component[]; // Replace 'any' with the actual type returned by getNoneEvolvedOrEvolvingElements
    endElements: Component[]; // Replace 'any' with the actual type returned by getNoneEvolvedOrEvolvingElements
}

export default class AllLinksStrategy {
    private links: string[];
    private mapElements: MapElements;

    constructor(links: string[], mapElements: MapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }

    getLinks(): LinkResult {
        return {
            name: 'links',
            links: this.links,
            startElements: this.mapElements.getNoneEvolvedOrEvolvingElements(),
            endElements: this.mapElements.getNoneEvolvedOrEvolvingElements(),
        };
    }
}
