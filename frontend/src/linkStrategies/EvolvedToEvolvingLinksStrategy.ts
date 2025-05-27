import MapElements from '../MapElements';
import {
    Link,
    LinkExtractionStrategy,
    LinkStrategy,
    MapElement,
} from './LinkStrategiesInterfaces';

export default class EvolvedToEvolvingLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: MapElements;

    constructor(links: Link[], mapElements: MapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }
    getLinks(): LinkStrategy {
        const links = this.links.filter(
            (li: Link) =>
                this.mapElements
                    .getEvolvedElements()
                    .find((i: MapElement) => i.name === li.start) &&
                this.mapElements
                    .getEvolveElements()
                    .find((i: MapElement) => i.name === li.end),
        );

        return {
            name: 'evolvedToEvolving',
            links: links,
            startElements: this.mapElements.getEvolvedElements(),
            endElements: this.mapElements.getEvolveElements(),
        };
    }
}
