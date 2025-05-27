import {
    Anchor,
    Link,
    LinkExtractionStrategy,
    LinkStrategy,
    MapElement,
    MapElements,
} from './LinkStrategiesInterfaces';

export default class AnchorEvolvedLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: MapElements;
    private anchors: Anchor[];

    constructor(links: Link[], mapElements: MapElements, anchors: Anchor[]) {
        this.links = links;
        this.mapElements = mapElements;
        this.anchors = anchors;
    }
    getLinks(): LinkStrategy {
        const links = this.links.filter(
            (li) =>
                this.anchors.find((i) => i.name === li.start) &&
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
