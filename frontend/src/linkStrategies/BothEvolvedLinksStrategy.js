export default class BothEvolvedLinksStrategy {
	constructor(links, mapElements) {
		this.links = links;
		this.mapElements = mapElements;
	}
	getLinks() {
		const links = this.links.filter(
			li =>
				this.mapElements.getEvolvedElements().find(i => i.name === li.start) &&
				this.mapElements.getEvolvedElements().find(i => i.name === li.end)
		);

		return {
			name: 'bothEvolved',
			links: links,
			startElements: this.mapElements.getEvolvedElements(),
			endElements: this.mapElements.getEvolvedElements(),
		};
	}
}
