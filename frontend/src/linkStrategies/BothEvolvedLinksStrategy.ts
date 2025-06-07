import { ModernMapElements } from '../processing/ModernMapElements';
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
} from './LinkStrategiesInterfaces';

export default class BothEvolvedLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[], mapElements: UnifiedMapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }
    getLinks(): LinkResult {
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
            name: 'bothEvolved',
            links: links,
            startElements: this.mapElements.getEvolvedElements(),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
