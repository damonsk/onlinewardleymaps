// Using any type instead of ModernMapElements for compatibility with both modern and legacy elements
import {
    Link,
    LinkExtractionStrategy,
    LinkStrategy,
} from './LinkStrategiesInterfaces';

/**
 * EvolvedToEvolvingLinksStrategy
 * Updated to use ModernMapElements in Phase 4C
 */
export default class EvolvedToEvolvingLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[] = [], mapElements: any = {}) {
        this.links = links || []; // Initialize links with empty array if undefined
        this.mapElements = mapElements?.getLegacyAdapter
            ? mapElements.getLegacyAdapter()
            : mapElements;
    }
    getLinks(): LinkStrategy {
        const links = this.links.filter(
            (li: Link) =>
                this.mapElements
                    .getEvolvedElements()
                    ?.find((i: any) => i.name === li.start) &&
                this.mapElements
                    .getEvolvedElements()
                    ?.find((i: any) => i.name === li.end),
        );

        return {
            name: 'evolvedToEvolving',
            links: links,
            startElements: this.mapElements.getEvolvedElements(),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
