import AllLinksStrategy from './AllLinksStrategy';
import EvolvingEndLinksStrategy from './EvolvingEndLinksStrategy';
import EvolvingToNoneEvolvingEndLinksStrategy from './EvolvingToNoneEvolvingEndLinksStrategy';
import EvolvedToEvolvingLinksStrategy from './EvolvedToEvolvingLinksStrategy';
import BothEvolvedLinksStrategy from './BothEvolvedLinksStrategy';
import EvolvedToNoneEvolvingLinksStrategy from './EvolvedToNoneEvolvingLinksStrategy';
import EvolveingToEvolvingLinksStrategy from './EvolveingToEvolvingLinksStrategy';
import EvolveToEvolvedLinksStrategy from './EvolveToEvolvedLinksStrategy';
import AnchorLinksStrategy from './AnchorLinksStrategy';

export default class LinksBuilder {
	constructor(mapLinks, mapElements, mapAnchors) {
		this.linkStrategies = [
			{
				name: 'links',
				strategy: new AllLinksStrategy(mapLinks, mapElements),
			},
			{
				name: 'evolvingEndLinks',
				strategy: new EvolvingEndLinksStrategy(mapLinks, mapElements),
			},
			{
				name: 'evolvingToNoneEvolvingEndLinks',
				strategy: new EvolvingToNoneEvolvingEndLinksStrategy(
					mapLinks,
					mapElements
				),
			},
			{
				name: 'evolvedToEvolving',
				strategy: new EvolvedToEvolvingLinksStrategy(mapLinks, mapElements),
			},
			{
				name: 'bothEvolved',
				strategy: new BothEvolvedLinksStrategy(mapLinks, mapElements),
			},
			{
				name: 'evolveStartLinks',
				strategy: new EvolvedToNoneEvolvingLinksStrategy(mapLinks, mapElements),
			},
			{
				name: 'bothEvolving',
				strategy: new EvolveingToEvolvingLinksStrategy(mapLinks, mapElements),
			},
			{
				name: 'evolveToEvolved',
				strategy: new EvolveToEvolvedLinksStrategy(mapLinks, mapElements),
			},
			{
				name: 'anchorLinks',
				strategy: new AnchorLinksStrategy(mapLinks, mapElements, mapAnchors),
			},
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
			this.getElementByName(startElements, l.start) != undefined &&
			this.getElementByName(endElements, l.end) != undefined
		);
	}

	build() {
		let allLinks = [];
		this.linkStrategies.forEach(s => {
			const r = s.strategy.getLinks();
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
			allLinks.push({ name: s.name, links: currentLinks });
		});
		return allLinks;
	}
}
