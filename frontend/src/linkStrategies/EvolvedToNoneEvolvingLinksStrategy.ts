import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
    MapElement,
    MapElements,
} from './LinkStrategiesInterfaces';

export default class EvolvedToNoneEvolvingLinksStrategy
    implements LinkExtractionStrategy {
    private links: Link[];
    private mapElements: MapElements;

    constructor(links: Link[], mapElements: MapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }
    getLinks(): LinkResult {
        const links = this.links.filter(
            (li: Link) =>
                this.mapElements
                    .getEvolvedElements()
                    .find((i: MapElement) => i.name === li.start) &&
                this.mapElements
                    .getNoneEvolvingElements()
                    .find((i: MapElement) => i.name === li.end),
        );

        return {
            name: 'evolveStartLinks',
            links: links,
            startElements: this.mapElements.getNoneEvolvingElements(),
            endElements: this.mapElements.getEvolveElements(),
        };
    }
}
