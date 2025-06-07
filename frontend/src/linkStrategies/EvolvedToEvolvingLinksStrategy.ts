import { ModernMapElements } from '../processing/ModernMapElements';
import {
    Link,
    LinkExtractionStrategy,
    LinkStrategy,
} from './LinkStrategiesInterfaces';

export default class EvolvedToEvolvingLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[], mapElements: UnifiedMapElements) {
        this.links = links || []; // Initialize links with empty array if undefined
        this.mapElements = mapElements.getLegacyAdapter ? mapElements.getLegacyAdapter() : mapElements;
    }
    getLinks(): LinkStrategy {
        const links = this.links.filter(
            (li: Link) =>
                this.mapElements
                    .getEvolvedElements()
                    .find((i: any) => i.name === li.start) &&
                this.mapElements
                    .getEvolvedElements()
                    .find((i: any) => i.name === li.end),
        );

        return {
            name: 'evolvedToEvolving',
            links: links,
            startElements: this.mapElements.getEvolvedElements(),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
