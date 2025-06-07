import { ModernMapElements } from '../processing/ModernMapElements';
import {
    Anchor,
    Link,
    LinkExtractionStrategy,
    LinkResult,
    MapElement,
} from './LinkStrategiesInterfaces';

export default class AnchorNoneEvolvedLinksStrategy
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
        this.links = links || []; // Initialize links with empty array if undefined
        this.mapElements = mapElements.getLegacyAdapter
            ? mapElements.getLegacyAdapter()
            : mapElements;
        this.anchors = anchors;
    }
    getLinks(): LinkResult {
        const links = this.links.filter(
            (li) =>
                this.anchors.find((i: any) => i.name === li.start) &&
                this.mapElements
                    .getEvolvedElements()
                    .find((i: any) => i.name === li.end),
        );

        return {
            name: 'anchorNonEvolvedLinks',
            links: links,
            startElements: this.anchors.map((a) => a as MapElement),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
