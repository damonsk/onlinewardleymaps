import LinksBuilder from '../linkStrategies/LinksBuilder';

import MapElementsClass from '../MapElements';
import { MapAnchors, MapElement, MapLinks, MapMethods } from '../types/base';

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
    mapElements: MapElementsClass,
    mapAnchors: MapAnchors[],
    showLinkedEvolved: boolean,
): ProcessedLinkGroup[] {
    const linksBuilder = new LinksBuilder(
        mapLinks,
        mapElements,
        mapAnchors,
        showLinkedEvolved,
    );
    const result: LinksResult[] = linksBuilder.build();

    // Filter out any links where startElement or endElement is undefined
    return result.map((group: LinksResult) => ({
        name: group.name,
        links: group.links.filter(
            (link) => link.startElement && link.endElement,
        ) as ProcessedLink[],
    }));
}

interface ProcessedMethodElement {
    name: string;
    maturity?: number;
    visibility: string | number;
    method?: string;
}

export function processMapElements(
    elements: MapMethods[],
    mapElements: MapElementsClass,
) {
    const asMethod = (m: MapElement): ProcessedMethodElement => ({
        name: m.name,
        maturity: m.maturity,
        visibility: m.visibility,
        method: m.decorators?.method,
    });

    const getElementByName = (
        elements: MapElement[],
        name: string,
    ): MapElement | undefined => {
        return elements.find((el) => el.name === name);
    };

    const decoratedComponentsMethods = mapElements
        .getMergedElements()
        .filter((m: MapElement) => m.decorators && 'method' in m.decorators)
        .map((m) => asMethod(m));

    const nonEvolvedElements = mapElements.getNoneEvolvedOrEvolvingElements();
    const methods = elements
        .filter((m: any) => {
            const element = getElementByName(nonEvolvedElements, m.name);
            return element !== undefined;
        })
        .map((m: any) => {
            const el = getElementByName(nonEvolvedElements, m.name);
            if (!el)
                return {
                    name: m.name,
                    visibility: m.visibility || 0,
                    method: m.method,
                };
            return asMethod({
                ...el,
                decorators: { method: m.method || '' },
            });
        });

    return {
        allMethods: methods.concat(decoratedComponentsMethods),
        getElementByName,
    };
}
