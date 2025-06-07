import { ModernMapElements } from '../processing/ModernMapElements';
import {
    Anchor,
    Link,
    LinkExtractionStrategy,
    LinkStrategy,
    MapElement,
} from './LinkStrategiesInterfaces';

export default class AnchorEvolvedLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility
    private anchors: Anchor[];

    constructor(
        links: Link[],
        mapElements: UnifiedMapElements,
        anchors: Anchor[],
    ) {
        this.links = links;
        this.mapElements = mapElements;
        this.anchors = anchors;
    }
    getLinks(): LinkStrategy {
        const links = this.links.filter(
            (li) =>
                this.anchors.find((i: any) => i.name === li.start) &&
                this.mapElements
                    .getEvolvedElements()
                    .filter((i) => i.name === li.end),
        );

        return {
            name: 'anchorEvolvedLinks',
            links: links,
            startElements: this.anchors.map(
                (anchor: Anchor) => ({ ...anchor }) as MapElement,
            ),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
