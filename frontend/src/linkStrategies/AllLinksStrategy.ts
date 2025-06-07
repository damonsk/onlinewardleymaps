// Using any type instead of ModernMapElements for compatibility with both modern and legacy elements
import { MapElement } from '../types/base';
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
} from './LinkStrategiesInterfaces';

/**
 * AllLinksStrategy
 * Updated to use ModernMapElements in Phase 4C
 */
export default class AllLinksStrategy implements LinkExtractionStrategy {
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[] = [], mapElements: any = {}) {
        this.links = links || []; // Initialize links with empty array if undefined
        // Either use the legacy adapter if available or use mapElements directly
        this.mapElements = mapElements?.getLegacyAdapter
            ? mapElements.getLegacyAdapter()
            : mapElements;
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

        const elements: MapElement[] =
            this.mapElements.getNoneEvolvedOrEvolvingElements();
        return {
            name: 'links',
            links: this.links,
            startElements: elements,
            endElements: elements,
        };
    }
}
