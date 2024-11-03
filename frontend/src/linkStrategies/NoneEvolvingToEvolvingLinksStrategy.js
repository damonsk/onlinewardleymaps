export default class NoneEvolvingToEvolvingLinksStrategy {
    constructor(links, mapElements) {
        this.links = links;
        this.mapElements = mapElements;
    }

    getLinks() {
        const links = this.links.filter(
            li =>
                this.mapElements
                    .getNoneEvolvingElements()
                    .find(i => i.name === li.start) &&
                this.mapElements
                    .getEvolvedElements()
                    .find(i => i.name === li.end),
        );
        return {
            name: 'noneEvolvingToEvolvedEndLinks',
            links: links,
            startElements: this.mapElements.getNoneEvolvingElements(),
            endElements: this.mapElements.getEvolvedElements(),
        };
    }
}
