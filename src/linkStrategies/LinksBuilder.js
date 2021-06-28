import AllLinksStrategy from './AllLinksStrategy';
import EvolvingEndLinksStrategy from './EvolvingEndLinksStrategy';
import EvolvingToNoneEvolvingEndLinksStrategy from './EvolvingToNoneEvolvingEndLinksStrategy';
import EvolvedToEvolvingLinksStrategy from './EvolvedToEvolvingLinksStrategy';
import BothEvolvedLinksStrategy from './BothEvolvedLinksStrategy';
import EvolvedToNoneEvolvingLinksStrategy from './EvolvedToNoneEvolvingLinksStrategy';
import EvolvingToEvolvingLinksStrategy from './EvolvingToEvolvingLinksStrategy';
import EvolveToEvolvedLinksStrategy from './EvolveToEvolvedLinksStrategy';
import AnchorLinksStrategy from './AnchorLinksStrategy';
import AnchorNoneEvolvedLinksStrategy from './AnchorNoneEvolvedLinksStrategy';
import AllNoneEvolvedLinksStrategy from './AllNoneEvolvedLinksStrategy';

export default class LinksBuilder {
	constructor(mapLinks, mapElements, mapAnchors, showLinkedEvolved) {
		const allLinksStrategy = showLinkedEvolved
			? new AllLinksStrategy(mapLinks, mapElements)
			: new AllNoneEvolvedLinksStrategy(mapLinks, mapElements);

		this.linkStrategies = [
			allLinksStrategy,
			new EvolvingEndLinksStrategy(mapLinks, mapElements),
			new EvolvingToNoneEvolvingEndLinksStrategy(mapLinks, mapElements),
			new EvolvedToEvolvingLinksStrategy(mapLinks, mapElements),
			new BothEvolvedLinksStrategy(mapLinks, mapElements),
			new EvolvedToNoneEvolvingLinksStrategy(mapLinks, mapElements),
			new EvolvingToEvolvingLinksStrategy(mapLinks, mapElements),
			new EvolveToEvolvedLinksStrategy(mapLinks, mapElements),
			new AnchorLinksStrategy(mapLinks, mapElements, mapAnchors),
			new AnchorNoneEvolvedLinksStrategy(mapLinks, mapElements, mapAnchors),
		];
	}

	getElementByName(elements, name) {
		var hasName = function(element) {
			return element.name === name;
		};
		return elements.find(hasName);
	}

	canSatisfyLink(l, startElements, endElements) {
		return (
			this.getElementByName(startElements, l.start) !== undefined &&
			this.getElementByName(endElements, l.end) !== undefined
		);
	}

	build() {
		let allLinks = [];
		this.linkStrategies.forEach(s => {
			const r = s.getLinks();
			let currentLinks = [];
			r.links.forEach((l, i) => {
				if (this.canSatisfyLink(l, r.startElements, r.endElements)) {
					const item = {
						key: i,
						startElement: this.getElementByName(r.startElements, l.start),
						endElement: this.getElementByName(r.endElements, l.end),
						link: l,
					};
					currentLinks.push(item);
				}
			});
			allLinks.push({ name: r.name, links: currentLinks });
		});
		return allLinks;
	}
}
