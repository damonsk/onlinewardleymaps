import { UnifiedMapElements } from '../processing/UnifiedMapElements';
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
    MapElement,
} from './LinkStrategiesInterfaces';

export default class NoneEvolvingToEvolvingLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: UnifiedMapElements;

    constructor(links: Link[], mapElements: UnifiedMapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }
    getLinks(): LinkResult {
        const links = this.links.filter(
            (li: Link) =>
                this.mapElements
                    .getNoneEvolvingElements()
                    .find((i: MapElement) => i.name === li.start) &&
                this.mapElements
                    .getEvolvedElements()
                    .find((i: MapElement) => i.name === li.end),
        );
        return {
            name: 'noneEvolvingToEvolvedEndLinks',
            links: links,
            startElements: this.mapElements.getNoneEvolvingElements(),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
