import LinksBuilder from '../linkStrategies/LinksBuilder';

export function processLinks(
    mapLinks,
    mapElements,
    mapAnchors,
    showLinkedEvolved,
) {
    const linksBuilder = new LinksBuilder(
        mapLinks,
        mapElements,
        mapAnchors,
        showLinkedEvolved,
    );
    return linksBuilder.build();
}

export function processMapElements(elements, mapElements) {
    const asMethod = (m) =>
        Object.assign(
            {},
            {
                name: m.name,
                maturity: m.maturity,
                visibility: m.visibility,
                method: m.decorators.method,
            },
        );

    const getElementByName = function (elements, name) {
        var hasName = function (element) {
            return element.name === name;
        };
        return elements.find(hasName);
    };

    const decoratedComponentsMethods = mapElements
        .getMergedElements()
        .filter((m) => m.decorators && m.decorators.method)
        .map((m) => asMethod(m));

    const methods = elements
        .filter((m) =>
            getElementByName(mapElements.getNonEvolvedElements(), m.name),
        )
        .map((m) => {
            const el = getElementByName(
                mapElements.getNonEvolvedElements(),
                m.name,
            );
            const toTransform = Object.assign(el, {
                decorators: { method: m.method },
            });
            return asMethod(toTransform);
        });

    return {
        allMethods: methods.concat(decoratedComponentsMethods),
        getElementByName,
    };
}
