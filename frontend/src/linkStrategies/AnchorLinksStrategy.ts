import MapElements from '../MapElements';
import {
    Anchor,
    Link,
    LinkExtractionStrategy,
    LinkResult,
    MapElement,
} from './LinkStrategiesInterfaces';

export default class AnchorLinksStrategy implements LinkExtractionStrategy {
    private links: Link[];
    private mapElements: MapElements;
    private anchors: Anchor[];

    constructor(links: Link[], mapElements: MapElements, anchors: Anchor[]) {
        this.links = links;
        this.mapElements = mapElements;
        this.anchors = anchors;
    }
    getLinks(): LinkResult {
        const links = this.links.filter(
            (li: Link) =>
                this.anchors.find((i: Anchor) => i.name === li.start) &&
                this.mapElements
                    .getNoneEvolvedOrEvolvingElements()
                    .find((i) => i.name === li.end),
        );

        return {
            name: 'anchorLinks',
            links: links,
            startElements: this.anchors.map((a) => a as MapElement),
            endElements: this.mapElements
                .getNoneEvolvedOrEvolvingElements()
                .map((c) => ({
                    ...c,
                    decorators: c.decorators || {
                        ecosystem: false,
                        market: false,
                    },
                })) as MapElement[],
        };
    }
}
