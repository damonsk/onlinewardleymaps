export default class AllNoneEvolvedLinksStrategy {
	constructor(links, mapElements) {
		this.links = links;
		this.mapElements = mapElements;
	}
	getLinks() {
		return {
			name: 'links',
			links: this.links,
			startElements: this.mapElements.getNoneEvolvingElements(),
			endElements: this.mapElements.getNoneEvolvingElements(),
		};
	}
}
