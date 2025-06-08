import LinksBuilder from '../linkStrategies/LinksBuilder';
import {MapElements} from '../processing/MapElements';
import {MapAnchors, MapElement, MapLinks, MapMethods} from '../types/base';

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
    // Use MapElements directly with the LinksBuilder
    const linksBuilder = new LinksBuilder(mapLinks, mapElements, mapAnchors, showLinkedEvolved);
    const result = linksBuilder.build();

    // Filter out any links where startElement or endElement is undefined
    return result.map(group => ({
        name: group.name,
        links: group.links.filter(link => link.startElement && link.endElement) as ProcessedLink[],
    }));
}

interface ProcessedMethodElement {
    id: string;
    name: string;
    maturity?: number;
    visibility: string | number;
    method?: string;
    increaseLabelSpacing?: number; // Add this property to preserve label spacing
}

export function processMapElements(
    elements: MapMethods[],
    mapElements: MapElements, // Now directly accepting MapElements for full Phase 4C compatibility
) {
    const asMethod = (m: any): ProcessedMethodElement => ({
        id: m.id,
        name: m.name,
        maturity: m.maturity,
        visibility: m.visibility,
        method: m.decorators?.method,
        increaseLabelSpacing: m.increaseLabelSpacing, // Keep any existing increaseLabelSpacing without adding a default
    });

    const getElementByName = (elements: any[], name: string): any | undefined => {
        return elements.find(el => el.name === name);
    };

    const decoratedComponentsMethods = mapElements
        .getMergedComponents()
        .filter((m: any) => m.decorators && 'method' in m.decorators && (m.decorators.method ?? '').length > 0)
        .map((m: any) => asMethod(m));

    const nonEvolvedElements = mapElements.getNeitherEvolvedNorEvolvingComponents();

    const meths = elements
        .filter((m: any) => {
            const element = getElementByName(nonEvolvedElements, m.name);
            return element !== undefined;
        })
        .map((m: any) => {
            const el = getElementByName(nonEvolvedElements, m.name);
            if (!el)
                return {
                    id: `method_${m.name}`,
                    name: m.name,
                    visibility: m.visibility || 0,
                    method: m.method,
                    increaseLabelSpacing: m.increaseLabelSpacing, // Keep any existing increaseLabelSpacing
                };
            return asMethod({
                ...el,
                decorators: {
                    method: m.method || '',
                    ecosystem: false,
                    market: false,
                },
            });
        });

    return {
        allMethods: meths.concat(decoratedComponentsMethods),
        getElementByName,
    };
}
