import MapElements from '../MapElements';
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
} from './LinkStrategiesInterfaces';

export default class AllLinksStrategy implements LinkExtractionStrategy {
    private links: Link[];
    private mapElements: MapElements;

    constructor(links: Link[], mapElements: MapElements) {
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
