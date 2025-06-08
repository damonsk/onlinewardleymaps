// Using any type instead of MapElements for compatibility with both modern and legacy elements
import {Link, LinkExtractionStrategy, LinkStrategy, MapElement} from './LinkStrategiesInterfaces';

/**
 * EvolveToEvolvedLinksStrategy
 * Updated to use MapElements in Phase 4C
 */
export default class EvolveToEvolvedLinksStrategy implements LinkExtractionStrategy {
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[] = [], mapElements: any = {}) {
        this.links = links || []; // Initialize links with empty array if undefined
        this.mapElements = mapElements?.getLegacyAdapter ? mapElements.getLegacyAdapter() : mapElements;
    }
    getLinks(): LinkStrategy {
        const links = this.links.filter(
            (li: Link) =>
                this.mapElements.getEvolveElements()?.find((i: MapElement) => i.name === li.start) &&
                this.mapElements.getEvolvedElements()?.find((i: MapElement) => i.name === li.end),
        );

        return {
            name: 'evolveToEvolved',
            links: links,
            startElements: this.mapElements.getEvolveElements(),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
