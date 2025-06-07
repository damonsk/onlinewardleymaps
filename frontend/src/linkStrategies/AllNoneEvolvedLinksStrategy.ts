import { ModernMapElements } from '../processing/ModernMapElements';
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
} from './LinkStrategiesInterfaces';

export default class AllNoneEvolvedLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility

    constructor(links: Link[], mapElements: UnifiedMapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }
    getLinks(): LinkResult {
        return {
            name: 'links',
            links: this.links,
            startElements: this.mapElements.getNonEvolvedElements(),
            endElements: this.mapElements.getNonEvolvedElements(),
        };
    }
}
