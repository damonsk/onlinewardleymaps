import {Link, LinkExtractionStrategy, LinkResult, MapElement} from './LinkStrategiesInterfaces';

export default class NoneEvolvingToEvolvingLinksStrategy implements LinkExtractionStrategy {
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
                this.mapElements.getNoneEvolvingElements()?.find((i: MapElement) => i.name === li.start) &&
                this.mapElements.getEvolvedElements()?.find((i: MapElement) => i.name === li.end),
        );
        return {
            name: 'noneEvolvingToEvolvedEndLinks',
            links: links,
            startElements: this.mapElements.getNoneEvolvingElements() || [],
            endElements: this.mapElements.getEvolvedElements() || [],
        };
    }
}
