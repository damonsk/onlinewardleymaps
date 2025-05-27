import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
    MapElement,
    MapElements,
} from './LinkStrategiesInterfaces';

export default class BothEvolvedLinksStrategy
    implements LinkExtractionStrategy
{
    private links: Link[];
    private mapElements: MapElements;

    constructor(links: Link[], mapElements: MapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }
    getLinks(): LinkResult {
        const links = this.links.filter(
            (li: Link) =>
                this.mapElements
                    .getEvolvedElements()
                    .find((i: MapElement) => i.name === li.start) &&
                this.mapElements
                    .getEvolvedElements()
                    .find((i: MapElement) => i.name === li.end),
        );

        return {
            name: 'bothEvolved',
            links: links,
            startElements: this.mapElements.getEvolvedElements(),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
