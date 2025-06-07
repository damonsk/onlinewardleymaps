import { ModernMapElements } from '../processing/ModernMapElements';
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
    MapElement,
} from './LinkStrategiesInterfaces';

export default class EvolvedToNoneEvolvingLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[], mapElements: UnifiedMapElements) {
        this.links = links;
        this.mapElements = mapElements.getLegacyAdapter ? mapElements.getLegacyAdapter() : mapElements;
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
