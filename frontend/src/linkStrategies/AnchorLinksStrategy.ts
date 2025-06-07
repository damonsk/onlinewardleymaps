// Using any type instead of ModernMapElements for compatibility with both modern and legacy elements
import {
    Anchor,
    Link,
    LinkExtractionStrategy,
    LinkResult,
    MapElement,
} from './LinkStrategiesInterfaces';

/**
 * AnchorLinksStrategy
 * Updated to use ModernMapElements in Phase 4C
 */
export default class AnchorLinksStrategy implements LinkExtractionStrategy {
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
    /**
     * Get links according to this strategy
     * @returns Link result containing links and elements
     */

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
                this.anchors?.find((i: Anchor) => i.name === li.start) &&
                this.mapElements
                    .getNoneEvolvedOrEvolvingElements()
                    ?.find((i: any) => i.name === li.end),
        );

        return {
            name: 'anchorLinks',
            links: links,
            startElements: this.anchors.map((a) => a as MapElement),
            endElements: this.mapElements
                .getNoneEvolvedOrEvolvingElements()
                .map((c: any) => ({
                    ...c,
                    decorators: c.decorators || {
                        ecosystem: false,
                        market: false,
                    },
                })) as MapElement[],
        };
    }
}
