export default class AchorLinksStrategy {
	constructor(links, mapElements, anchors) {
		this.links = links;
		this.mapElements = mapElements;
		this.anchors = anchors;
	}
	getLinks() {
		const links = this.links.filter(
			li =>
				this.anchors.find(i => i.name === li.start) &&
				this.mapElements.getMergedElements(i => i.name === li.end)
		);
		return {
			name: 'anchorLinks',
			links: links,
			startElements: this.anchors,
			endElements: this.mapElements.getMergedElements(),
		};
	}
}
