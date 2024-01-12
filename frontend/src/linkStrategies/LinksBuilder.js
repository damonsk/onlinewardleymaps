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
import NoneEvolvingToEvolvingLinksStrategy from './NoneEvolvingToEvolvingLinksStrategy';
import AnchorEvolvedLinksStrategy from './AnchorEvolvedLinksStrategy';

export default class LinksBuilder {
  constructor(mapLinks, mapElements, mapAnchors, showLinkedEvolved) {
    const linksThatAreEvolvingOfAnyKind =
      showLinkedEvolved === true
        ? [
            new EvolveToEvolvedLinksStrategy(mapLinks, mapElements),
            new EvolvedToNoneEvolvingLinksStrategy(mapLinks, mapElements),
            new NoneEvolvingToEvolvingLinksStrategy(mapLinks, mapElements),
            new BothEvolvedLinksStrategy(mapLinks, mapElements),
            new EvolvedToEvolvingLinksStrategy(mapLinks, mapElements),
            new AnchorEvolvedLinksStrategy(mapLinks, mapElements, mapAnchors),
          ]
        : [];

    this.linkStrategies = linksThatAreEvolvingOfAnyKind.concat([
      new AllLinksStrategy(mapLinks, mapElements),
      new EvolvingEndLinksStrategy(mapLinks, mapElements),
      new EvolvingToEvolvingLinksStrategy(mapLinks, mapElements),
      new AnchorLinksStrategy(mapLinks, mapElements, mapAnchors),
      new AnchorNoneEvolvedLinksStrategy(mapLinks, mapElements, mapAnchors),
      new EvolvingToNoneEvolvingEndLinksStrategy(mapLinks, mapElements),
    ]);
  }

  getElementByName(elements, name) {
    var hasName = function (element) {
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
    this.linkStrategies.forEach((s) => {
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
