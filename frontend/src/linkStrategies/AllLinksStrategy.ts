import { ModernMapElements } from '../processing/ModernMapElements';
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

    constructor(links: Link[], mapElements: ModernMapElements) {
        this.links = links;
        // Use the legacy adapter for compatibility
        this.mapElements = mapElements.getLegacyAdapter();
    }

    getLinks(): LinkResult {
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
