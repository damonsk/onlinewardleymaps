import MapElements from '../MapElements';
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
} from './LinkStrategiesInterfaces';

export default class EvolvingToNoneEvolvingEndLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: MapElements;

    constructor(links: Link[], mapElements: MapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }
    getLinks(): LinkResult {
        const links = this.links.filter(
            (li) =>
                this.mapElements
                    .getEvolveElements()
                    .find((i) => i.name === li.start) &&
                this.mapElements
                    .getNoneEvolvingElements()
                    .find((i) => i.name === li.end),
        );
        return {
            name: 'evolvingToNoneEvolvingEndLinks',
            links: links,
            startElements: this.mapElements.getEvolveElements(),
            endElements: this.mapElements.getNoneEvolvingElements(),
        };
    }
}
