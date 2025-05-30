import { UnifiedMapElements } from '../processing/UnifiedMapElements';
import {
    Link,
    LinkExtractionStrategy,
    LinkStrategy,
    MapElement,
} from './LinkStrategiesInterfaces';

export default class EvolveToEvolvedLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: UnifiedMapElements;

    constructor(links: Link[], mapElements: UnifiedMapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }
    getLinks(): LinkStrategy {
        const links = this.links.filter(
            (li: Link) =>
                this.mapElements
                    .getEvolveElements()
                    .find((i: MapElement) => i.name === li.start) &&
                this.mapElements
                    .getEvolvedElements()
                    .find((i: MapElement) => i.name === li.end),
        );

        return {
            name: 'evolveToEvolved',
            links: links,
            startElements: this.mapElements.getEvolveElements(),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
