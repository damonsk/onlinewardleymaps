import MapElements from '../MapElements';
import { UnifiedMapElements } from '../processing/UnifiedMapElements';
import { MapAnchors } from '../types/base';
import AllLinksStrategy from './AllLinksStrategy';
import AnchorEvolvedLinksStrategy from './AnchorEvolvedLinksStrategy';
import AnchorLinksStrategy from './AnchorLinksStrategy';
import AnchorNoneEvolvedLinksStrategy from './AnchorNoneEvolvedLinksStrategy';
import BothEvolvedLinksStrategy from './BothEvolvedLinksStrategy';
import EvolvedToEvolvingLinksStrategy from './EvolvedToEvolvingLinksStrategy';
import EvolvedToNoneEvolvingLinksStrategy from './EvolvedToNoneEvolvingLinksStrategy';
import EvolveToEvolvedLinksStrategy from './EvolveToEvolvedLinksStrategy';
import EvolvingEndLinksStrategy from './EvolvingEndLinksStrategy';
import EvolvingToEvolvingLinksStrategy from './EvolvingToEvolvingLinksStrategy';
import EvolvingToNoneEvolvingEndLinksStrategy from './EvolvingToNoneEvolvingEndLinksStrategy';
import {
    Link,
    LinkExtractionStrategy,
    LinkResult,
    MapElement,
} from './LinkStrategiesInterfaces';
import NoneEvolvingToEvolvingLinksStrategy from './NoneEvolvingToEvolvingLinksStrategy';

export default class LinksBuilder {
    private linkStrategies: LinkExtractionStrategy[];
    constructor(
        mapLinks: Link[],
        mapElements: UnifiedMapElements | MapElements,
        mapAnchors: MapAnchors[],
        showLinkedEvolved: boolean,
    ) {
        // Create legacy adapter for link strategies
        const legacyAdapter =
            'createLegacyMapElementsAdapter' in mapElements &&
            typeof mapElements.createLegacyMapElementsAdapter === 'function'
                ? mapElements.createLegacyMapElementsAdapter()
                : mapElements;

        const linksThatAreEvolvingOfAnyKind: LinkExtractionStrategy[] =
            showLinkedEvolved
                ? [
                      new EvolveToEvolvedLinksStrategy(mapLinks, legacyAdapter),
                      new EvolvedToNoneEvolvingLinksStrategy(
                          mapLinks,
                          legacyAdapter,
                      ),
                      new NoneEvolvingToEvolvingLinksStrategy(
                          mapLinks,
                          legacyAdapter,
                      ),
                      new BothEvolvedLinksStrategy(mapLinks, legacyAdapter),
                      new EvolvedToEvolvingLinksStrategy(
                          mapLinks,
                          legacyAdapter,
                      ),
                      new AnchorEvolvedLinksStrategy(
                          mapLinks,
                          legacyAdapter,
                          mapAnchors,
                      ),
                  ]
                : [];

        this.linkStrategies = linksThatAreEvolvingOfAnyKind.concat([
            new AllLinksStrategy(mapLinks, legacyAdapter),
            new EvolvingEndLinksStrategy(mapLinks, legacyAdapter),
            new EvolvingToEvolvingLinksStrategy(mapLinks, legacyAdapter),
            new AnchorLinksStrategy(mapLinks, legacyAdapter, mapAnchors),
            new AnchorNoneEvolvedLinksStrategy(
                mapLinks,
                legacyAdapter,
                mapAnchors,
            ),
            new EvolvingToNoneEvolvingEndLinksStrategy(mapLinks, legacyAdapter),
        ]);
    }

    private getElementByName(
        elements: MapElement[],
        name: string,
    ): MapElement | undefined {
        return elements.find((element) => element.name === name);
    }

    private canSatisfyLink(
        link: Link,
        startElements: MapElement[],
        endElements: MapElement[],
    ): boolean {
        return (
            this.getElementByName(startElements, link.start) !== undefined &&
            this.getElementByName(endElements, link.end) !== undefined
        );
    }

    public build(): {
        name: string;
        links: {
            key: number;
            startElement: MapElement | undefined;
            endElement: MapElement | undefined;
            link: Link;
        }[];
    }[] {
        const allLinks: {
            name: string;
            links: {
                key: number;
                startElement: MapElement | undefined;
                endElement: MapElement | undefined;
                link: Link;
            }[];
        }[] = [];
        this.linkStrategies.forEach((strategy) => {
            const result: LinkResult = strategy.getLinks();
            const currentLinks: {
                key: number;
                startElement: MapElement | undefined;
                endElement: MapElement | undefined;
                link: Link;
            }[] = [];
            result.links.forEach((link, index) => {
                if (
                    this.canSatisfyLink(
                        link,
                        result.startElements,
                        result.endElements,
                    )
                ) {
                    const item = {
                        key: index,
                        startElement: this.getElementByName(
                            result.startElements,
                            link.start,
                        ),
                        endElement: this.getElementByName(
                            result.endElements,
                            link.end,
                        ),
                        link: link,
                    };
                    currentLinks.push(item);
                }
            });
            allLinks.push({ name: result.name, links: currentLinks });
        });

        return allLinks;
    }
}
