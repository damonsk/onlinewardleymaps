// Using any type instead of MapElements for compatibility with both modern and legacy elements
import {Link, LinkExtractionStrategy, LinkResult} from './LinkStrategiesInterfaces';

export default class BothEvolvedLinksStrategy implements LinkExtractionStrategy {
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

        const links = this.links.filter(
            (li: Link) =>
                this.mapElements.getEvolvedElements()?.find((i: any) => i.name === li.start) &&
                this.mapElements.getEvolvedElements()?.find((i: any) => i.name === li.end),
        );

        return {
            name: 'bothEvolved',
            links: links,
            startElements: this.mapElements.getEvolvedElements(),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
