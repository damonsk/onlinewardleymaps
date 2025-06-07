// Using any type instead of MapElements for compatibility with both modern and legacy elements
import {
    Anchor,
    Link,
    LinkExtractionStrategy,
    LinkStrategy,
    MapElement,
} from './LinkStrategiesInterfaces';

/**
 * AnchorEvolvedLinksStrategy
 * Updated to use MapElements in Phase 4C
 */
export default class AnchorEvolvedLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: any; // Using any for adapter compatibility
    private anchors: Anchor[];

    constructor(
        links: Link[] = [],
        mapElements: any = {},
        anchors: Anchor[] = [],
    ) {
        this.links = links || []; // Initialize links with empty array if undefined
        this.mapElements = mapElements?.getLegacyAdapter
            ? mapElements.getLegacyAdapter()
            : mapElements;
        this.anchors = anchors;
    }
    getLinks(): LinkStrategy {
        const links = this.links.filter(
            (li) =>
                this.anchors?.find((i: any) => i.name === li.start) &&
                this.mapElements
                    .getEvolvedElements()
                    .filter((i: any) => i.name === li.end),
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
