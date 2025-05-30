import { UnifiedMapElements } from '../processing/UnifiedMapElements'; // Changed to named import
import { MapElement } from '../types/base'; // Added import for MapElement
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
} from './LinkStrategiesInterfaces';

export default class AllLinksStrategy implements LinkExtractionStrategy {
    private links: Link[];
    private mapElements: UnifiedMapElements;

    constructor(links: Link[], mapElements: UnifiedMapElements) {
        this.links = links;
        this.mapElements = mapElements;
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
