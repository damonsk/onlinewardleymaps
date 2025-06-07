import { ModernMapElements } from '../processing/ModernMapElements';
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
    MapElement,
} from './LinkStrategiesInterfaces';

export default class EvolvingToEvolvingLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[], mapElements: UnifiedMapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }
    getLinks(): LinkResult {
        const links = this.links.filter(
            (li: Link) =>
                this.mapElements
                    .getEvolveElements()
                    .find((i: MapElement) => i.name === li.start) &&
                this.mapElements
                    .getEvolveElements()
                    .find((i: MapElement) => i.name === li.end),
        );

        return {
            name: 'bothEvolving',
            links: links,
            startElements: this.mapElements.getEvolveElements(),
            endElements: this.mapElements.getEvolveElements(),
        };
    }
}
