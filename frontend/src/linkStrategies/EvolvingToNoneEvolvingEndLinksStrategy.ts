// Using any type instead of ModernMapElements for compatibility with both modern and legacy elements
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
} from './LinkStrategiesInterfaces';

/**
 * EvolvingToNoneEvolvingEndLinksStrategy
 * Updated to use ModernMapElements in Phase 4C
 */
export default class EvolvingToNoneEvolvingEndLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[], mapElements: any) {
        this.links = links || []; // Initialize links with empty array if undefined
        // Either use the legacy adapter if available or use mapElements directly
        this.mapElements = mapElements.getLegacyAdapter
            ? mapElements.getLegacyAdapter()
            : mapElements;
    }
    getLinks(): LinkResult {
        const links = this.links.filter(
            (li) =>
                this.mapElements
                    .getEvolveElements()
                    .find((i: any) => i.name === li.start) &&
                this.mapElements
                    .getNoneEvolvingElements()
                    .find((i: any) => i.name === li.end),
        );
        return {
            name: 'evolvingToNoneEvolvingEndLinks',
            links: links,
            startElements: this.mapElements.getEvolveElements(),
            endElements: this.mapElements.getNoneEvolvingElements(),
        };
    }
}
