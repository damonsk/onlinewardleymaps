import {Link, LinkExtractionStrategy, LinkResult} from './LinkStrategiesInterfaces';

export default class AllNoneEvolvedLinksStrategy implements LinkExtractionStrategy {
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[] = [], mapElements: any = {}) {
        this.links = links || []; // Initialize links with empty array if undefined
        this.mapElements = mapElements?.getLegacyAdapter ? mapElements.getLegacyAdapter() : mapElements;
    }

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

        return {
            name: 'links',
            links: this.links,
            startElements: this.mapElements.getNonEvolvedElements(),
            endElements: this.mapElements.getNonEvolvedElements(),
        };
    }
}
