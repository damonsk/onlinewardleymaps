export default class AllLinksStrategy {
	constructor(links, mapElements) {
		this.links = links;
		this.mapElements = mapElements;
	}
	getLinks() {
		return {
			links: this.links,
			startElements: this.mapElements.getMergedElements(),
			endElements: this.mapElements.getMergedElements(),
		};
	}
}
