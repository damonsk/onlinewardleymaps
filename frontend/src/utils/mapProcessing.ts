import LinksBuilder from '../linkStrategies/LinksBuilder';
import { UnifiedMapElements } from '../processing/UnifiedMapElements';
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
    mapElements: UnifiedMapElements,
    mapAnchors: MapAnchors[],
    showLinkedEvolved: boolean,
): ProcessedLinkGroup[] {
    const linksBuilder = new LinksBuilder(
        mapLinks,
        mapElements,
        mapAnchors,
        showLinkedEvolved,
    );
    const result = linksBuilder.build();

    // Filter out any links where startElement or endElement is undefined
    return result.map((group) => ({
        name: group.name,
        links: group.links.filter(
            (link) => link.startElement && link.endElement,
        ) as ProcessedLink[],
    }));
}

interface ProcessedMethodElement {
    id: string;
    name: string;
    maturity?: number;
    visibility: string | number;
    method?: string;
}

export function processMapElements(
    elements: MapMethods[],
    mapElements: UnifiedMapElements,
) {
    // Use legacy adapter for compatibility with existing type expectations
    const legacyAdapter = mapElements.createLegacyMapElementsAdapter();

    const asMethod = (m: MapElement): ProcessedMethodElement => ({
        id: m.id,
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

    const decoratedComponentsMethods = legacyAdapter
        .getMergedElements()
        .filter((m: MapElement) => m.decorators && 'method' in m.decorators)
        .map((m: MapElement) => asMethod(m));

    const nonEvolvedElements = legacyAdapter.getNoneEvolvedOrEvolvingElements();
    const methods = elements
        .filter((m: any) => {
            const element = getElementByName(nonEvolvedElements, m.name);
            return element !== undefined;
        })
        .map((m: any) => {
            const el = getElementByName(nonEvolvedElements, m.name);
            if (!el)
                return {
                    id: `method_${m.name}`, // Generate a unique ID for method elements without component
                    name: m.name,
                    visibility: m.visibility || 0,
                    method: m.method,
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
        allMethods: methods.concat(decoratedComponentsMethods),
        getElementByName,
    };
}
