import { ModernMapElements } from '../processing/ModernMapElements';
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

/**
 * LinksBuilder - Updated to use ModernMapElements
 * Part of Phase 4C Modernization
 * 
 * This class coordinates the different link strategies to build all links
 * that need to be rendered on the Wardley Map.
 */
export default class LinksBuilder {
    private linkStrategies: LinkExtractionStrategy[];
    constructor(
        mapLinks: Link[],
        modernMapElements: ModernMapElements,
        mapAnchors: MapAnchors[],
        showLinkedEvolved: boolean,
    ) {
        // Use the legacy adapter for compatibility with link strategies if available
        // Otherwise pass modernMapElements directly
        const mapElements = modernMapElements.getLegacyAdapter ? modernMapElements.getLegacyAdapter() : modernMapElements;
        const linksThatAreEvolvingOfAnyKind: LinkExtractionStrategy[] =
            showLinkedEvolved
                ? [
                      new EvolveToEvolvedLinksStrategy(mapLinks, mapElements),
                      new EvolvedToNoneEvolvingLinksStrategy(
                          mapLinks,
                          mapElements,
                      ),
                      new NoneEvolvingToEvolvingLinksStrategy(
                          mapLinks,
                          mapElements,
                      ),
                      new BothEvolvedLinksStrategy(mapLinks, mapElements),
                      new EvolvedToEvolvingLinksStrategy(mapLinks, mapElements),
                      new AnchorEvolvedLinksStrategy(
                          mapLinks,
                          mapElements,
                          mapAnchors,
                      ),
                  ]
                : [];

        this.linkStrategies = linksThatAreEvolvingOfAnyKind.concat([
            new AllLinksStrategy(mapLinks, mapElements),
            new EvolvingEndLinksStrategy(mapLinks, mapElements),
            new EvolvingToEvolvingLinksStrategy(mapLinks, mapElements),
            new AnchorLinksStrategy(mapLinks, mapElements, mapAnchors),
            new AnchorNoneEvolvedLinksStrategy(
                mapLinks,
                mapElements,
                mapAnchors,
            ),
            new EvolvingToNoneEvolvingEndLinksStrategy(mapLinks, mapElements),
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
