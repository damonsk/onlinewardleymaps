export default class AllLinksStrategy {
	constructor(links, mapElements) {
		this.links = links;
		this.mapElements = mapElements;
	}
	getLinks() {
		return {
			name: 'links',
			links: this.links,
			startElements: this.mapElements.getNoneEvolvedOrEvolvingElements(),
			endElements: this.mapElements.getNoneEvolvedOrEvolvingElements(),
		};
	}
}
