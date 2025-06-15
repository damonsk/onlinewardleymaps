import LinksBuilder from '../linkStrategies/LinksBuilder';
import {MapElements} from '../processing/MapElements';
import {MapAnchors, MapElement, MapLinks} from '../types/base';
import {UnifiedComponent} from '../types/unified';

export interface ProcessedLink {
    key: number;
    startElement: MapElement;
    endElement: MapElement;
    link: MapLinks;
}

export interface ProcessedLinkGroup {
    name: string;
    links: ProcessedLink[];
}

export interface LinksResult {
    name: string;
    links: Array<{
        key: number;
        startElement: MapElement | undefined;
        endElement: MapElement | undefined;
        link: MapLinks;
    }>;
}

export function processLinks(
    mapLinks: MapLinks[],
    mapElements: MapElements,
    mapAnchors: MapAnchors[],
    showLinkedEvolved: boolean,
): ProcessedLinkGroup[] {
    const linksBuilder = new LinksBuilder(mapLinks, mapElements, mapAnchors, showLinkedEvolved);
    return linksBuilder.build().map(group => ({
        name: group.name,
        links: group.links.filter(link => link.startElement && link.endElement) as ProcessedLink[],
    }));
}

export function getMapElementsDecorated(mapElements: MapElements) {
    return mapElements.getMergedComponents().filter((m: UnifiedComponent) => {
        if (!m.decorators) return false;
        return m.decorators.buy || m.decorators.build || m.decorators.outsource;
    });
}
