// Using any type instead of MapElements for compatibility with both modern and legacy elements
import {Link, LinkExtractionStrategy, LinkResult, MapElement} from './LinkStrategiesInterfaces';

/**
 * EvolvingEndLinksStrategy
 * Updated to use MapElements in Phase 4C
 */
export default class EvolvingEndLinksStrategy implements LinkExtractionStrategy {
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[] = [], mapElements: any = {}) {
        this.links = links || []; // Initialize links with empty array if undefined
        this.mapElements = mapElements?.getLegacyAdapter ? mapElements.getLegacyAdapter() : mapElements;
    }
    /**
     * Get links according to this strategy
     * @returns Link result containing links and elements
     */

    getLinks(): LinkResult {
        // Handle edge cases where links or mapElements might be undefined
        if (!this.links || !this.mapElements) {
            return {
                name: 'empty',
                links: [],
                startElements: [],
                endElements: [],
            };
        }

        const links = this.links.filter(
            (li: Link) =>
                this.mapElements.getEvolvedElements()?.find((i: MapElement) => i.name === li.end) &&
                this.mapElements.getNoneEvolvingElements()?.find((i: MapElement) => i.name === li.start),
        );
        return {
            name: 'evolvingEndLinks',
            links: links,
            startElements: this.mapElements.getNoneEvolvingElements() || [],
            endElements: this.mapElements.getEvolveElements() || [],
        };
    }
}
