import {MapElement} from '../types/base';
import {Link, LinkExtractionStrategy, LinkResult} from './LinkStrategiesInterfaces';

export default class AllLinksStrategy implements LinkExtractionStrategy {
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[] = [], mapElements: any = {}) {
        this.links = links || []; // Initialize links with empty array if undefined
        this.mapElements = mapElements?.getLegacyAdapter ? mapElements.getLegacyAdapter() : mapElements;
    }

    getLinks(): LinkResult {
        if (!this.links || !this.mapElements) {
            return {
                name: 'empty',
                links: [],
                startElements: [],
                endElements: [],
            };
        }

        const elements: MapElement[] = this.mapElements.getNoneEvolvedOrEvolvingElements();
        return {
            name: 'links',
            links: this.links,
            startElements: elements,
            endElements: elements,
        };
    }
}
