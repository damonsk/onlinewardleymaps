import { UnifiedMapElements } from '../processing/UnifiedMapElements';
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
    private mapElements: UnifiedMapElements;
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
    getLinks(): LinkResult {
        const links = this.links.filter(
            (li) =>
                this.anchors.find((i) => i.name === li.start) &&
                this.mapElements
                    .getEvolvedElements()
                    .find((i) => i.name === li.end),
        );

        return {
            name: 'anchorNonEvolvedLinks',
            links: links,
            startElements: this.anchors.map((a) => a as MapElement),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
