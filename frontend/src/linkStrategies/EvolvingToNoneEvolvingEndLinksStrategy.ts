import {Link, LinkExtractionStrategy, LinkResult} from './LinkStrategiesInterfaces';

export default class EvolvingToNoneEvolvingEndLinksStrategy implements LinkExtractionStrategy {
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[] = [], mapElements: any = {}) {
        this.links = links || []; // Initialize links with empty array if undefined
        // Either use the legacy adapter if available or use mapElements directly
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
            li =>
                this.mapElements.getEvolveElements()?.find((i: any) => i.name === li.start) &&
                this.mapElements.getNoneEvolvingElements()?.find((i: any) => i.name === li.end),
        );
        return {
            name: 'evolvingToNoneEvolvingEndLinks',
            links: links,
            startElements: this.mapElements.getEvolveElements() || [],
            endElements: this.mapElements.getNoneEvolvingElements() || [],
        };
    }
}
