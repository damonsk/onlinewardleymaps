import MapElements from '../MapElements';
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
    MapElement,
} from './LinkStrategiesInterfaces';

export default class EvolvingEndLinksStrategy
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
                    .find((i: MapElement) => i.name === li.end) &&
                this.mapElements
                    .getNoneEvolvingElements()
                    .find((i: MapElement) => i.name === li.start),
        );
        return {
            name: 'evolvingEndLinks',
            links: links,
            startElements: this.mapElements.getNoneEvolvingElements(),
            endElements: this.mapElements.getEvolveElements(),
        };
    }
}
