export default class AnchorNoneEvolvedLinksStrategy {
	constructor(links, mapElements, anchors) {
		this.links = links;
		this.mapElements = mapElements;
		this.anchors = anchors;
	}
	getLinks() {
		const links = this.links.filter(
			li =>
				this.anchors.find(i => i.name === li.start) &&
				this.mapElements.getEvolveElements(i => i.name === li.end)
		);
		return {
			name: 'anchorNonEvolvedLinks',
			links: links,
			startElements: this.anchors,
			endElements: this.mapElements.getEvolveElements(),
		};
	}
}
