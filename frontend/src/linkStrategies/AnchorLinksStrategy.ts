import {
    Anchor,
    Link,
    LinkExtractionStrategy,
    LinkResult,
    MapElement,
    MapElements,
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
                    .find((i: MapElement) => i.name === li.end),
        );

        return {
            name: 'anchorLinks',
            links: links,
            startElements: this.anchors.map(a => a as MapElement),
            endElements: this.mapElements.getNoneEvolvedOrEvolvingElements(),
        };
    }
}
