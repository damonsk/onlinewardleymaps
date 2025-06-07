import { ModernMapElements } from '../processing/ModernMapElements';
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

    constructor(links: Link[], mapElements: ModernMapElements) {
        this.links = links;
        // Use the legacy adapter for compatibility
        this.mapElements = mapElements.getLegacyAdapter();
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
