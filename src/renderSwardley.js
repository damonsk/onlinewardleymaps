
var visToY = function (visibility, mapHeight) {
    return (1 - visibility) * mapHeight;
};

var matToX = function (maturity, mapWidth) {
    return maturity * mapWidth;
};

var renderLink = function (startElement, endElement, link, mapWidth, mapHeight) {
    var x1 = matToX(startElement.maturity, mapWidth);
    var x2 = matToX(endElement.maturity, mapWidth);
    var y1 = visToY(startElement.visibility, mapHeight);
    var y2 = visToY(endElement.visibility, mapHeight);
    var returnString = '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + ((startElement.evolved || endElement.evolved) ? 'red' : 'grey') + '" />';

    if (link.flow && (
        (link.future == link.past) // both
        || (link.past == true && endElement.evolving == false && startElement.evolving == true)
        || (link.past == true && endElement.evolving == true && startElement.evolving == false)

        || (link.future == true && startElement.eolving == true)
        || (link.future == true && startElement.evolved == true)
        || (link.future == true && endElement.evolved == true)
    )
    ) {

        var text = '<g id="flow_' + endElement.name + '" transform="translate(' + x2 + ',' + y2 + ')">' +
            ((link.flowValue != null && link.flowValue != undefined) ? '<text class="draggable label" id="flow_text_' + startElement.id + '_' + endElement.id + '" x="' + (10) + '" y="' + (-30) + '" text-anchor="start" fill="#03a9f4">' + link.flowValue + '</text>' : '') +
            '</g>' +
            '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke-width="10" stroke="#99c5ee9e" />';

        returnString = returnString + text;
    }
    return returnString;
};

var renderEvolvedElementsLink = function (startElement, endElement, mapWidth, mapHeight) {
    var x1 = matToX(startElement.maturity, mapWidth);
    var x2 = matToX(endElement.maturity, mapWidth);
    var y1 = visToY(startElement.visibility, mapHeight);
    var y2 = visToY(endElement.visibility, mapHeight);
    var returnString = '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="red" stroke-dasharray="5 5" marker-start="url(#arrow)" />';
    if (endElement.inertia) {

        var boundary = x1;
        if(startElement.maturity >= 0.25){
            boundary = 0.25;
        }
        if (startElement.maturity >= 0.5){
            boundary = 0.5;
        }
        if (startElement.maturity >= 0.75){
            boundary = 0.75;
        }
        var boundaryX = matToX(boundary, mapWidth);
        returnString = returnString + '<line x1="' + (boundaryX) + '" y1="' + (y2 - 10) + '" x2="' + (boundaryX) + '" y2="' + (y2 + 10) + '" stroke="black" stroke-width="6" />';
    }

    return returnString;
};

var getElementByName = function (elements, name) {
    var hasName = function (element) {
        return element.name === name;
    };
    return elements.find(hasName);
};

var getEvolveElementByName = function (elements, name) {
    var hasName = function (element) {
        return element.name === name;
    };
    return elements.find(hasName);
};

var renderLinks = function (links, elements, mapWidth, mapHeight) {
    var mapLink = function (link) {
        return renderLink(getElementByName(elements, link.start), getElementByName(elements, link.end), link, mapWidth, mapHeight);
    };
    return links.map(mapLink).join('');
};

var renderEvolvingEndLinks = function (links, noneEvolvedElements, evolvedElements, mapWidth, mapHeight) {
    try {
        var mapLink = function (link) {
            return renderLink(getElementByName(noneEvolvedElements, link.start), getElementByName(evolvedElements, link.end), link, mapWidth, mapHeight);
        };
        return links.map(mapLink).join('');
    } catch (error) {
        console.log(error);
    }
};

var renderEvolvingBothLinks = function (links, evolving, evolved, mapWidth, mapHeight) {
    var mapLink = function (link) {
        return renderLink(getElementByName(evolved, link.start), getElementByName(evolving, link.end), link, mapWidth, mapHeight);
    };
    return links.map(mapLink).join('');
};


var renderEvolvedLinks = function (evolvedElements, evolveElements, mapWidth, mapHeight) {
    var mapLink = function (link) {
        return renderEvolvedElementsLink(getEvolveElementByName(evolvedElements, link.name), getElementByName(evolveElements, link.name), mapWidth, mapHeight);
    };
    return evolveElements.map(mapLink).join('');
};

var renderEvolvingStartEvolvedEndLinks = function (links, evolveElements, evolvedElements, mapWidth, mapHeight) {
    try {
        var mapLink = function (link) {
            return renderLink(getEvolveElementByName(evolveElements, link.start), getElementByName(evolvedElements, link.end), link, mapWidth, mapHeight);
        };
        return links.map(mapLink).join('');
    } catch (error) {
        console.log(error);
    }
};


var renderEvolvingStartEvolvingEndLinks = function (links, evolveElements, mapWidth, mapHeight) {
    try {
        var mapLink = function (link) {
            return renderLink(getEvolveElementByName(evolveElements, link.start), getEvolveElementByName(evolveElements, link.end), link, mapWidth, mapHeight);
        };
        return links.map(mapLink).join('');
    } catch (error) {
        console.log(error);
    }
};

var renderEvolvingStartLinks = function (links, noneEvolvedElements, evolvedElements, mapWidth, mapHeight) {
    try {
        var mapLink = function (link) {
            return renderLink(getEvolveElementByName(evolvedElements, link.start), getElementByName(noneEvolvedElements, link.end), link, mapWidth, mapHeight);
        };
        return links.map(mapLink).join('');
    } catch (error) {
        console.log(error);
    }
};


var renderMethod = function (element, method, mapWidth, mapHeight) {
    var x = matToX(element.maturity, mapWidth);
    var y = visToY(element.visibility, mapHeight);

    var elementSvg =
        '<g id="method_' + element.id + '" transform="translate(' + x + ',' + y + ')">' +
        '<circle id="element_circle_' + element.id + '" cx="0" cy="0" r="20" stroke="' + (method.method == "outsource" ? '#444444' : (method.method == "build" ? "#000000" : '#D6D6D6')) + '" fill="' + (method.method == "outsource" ? '#444444' : (method.method == "build" ? "#D6D6D6" : '#AAA5A9')) + '" />' +
        '</g>';

    return elementSvg;
};

var renderElement = function (element, mapWidth, mapHeight) {
    var x = matToX(element.maturity, mapWidth);
    var y = visToY(element.visibility, mapHeight);

    var text = '<text id="element_text_' + element.id + '" class="draggable label" x="10" y="-5" text-anchor="start" fill="' + (element.evolved ? 'red' : 'black') + '">' +
        element.name +
        '</text>';

    if (element.name.length > 15) {
        text = '<text id="element_text_' + element.id + '" x="10" y="-20" transform="translate(30, 10)" class="draggable label">';
        var labels = element.name.trim().split(' ');
        for (let i = 0; i < labels.length; i++) {
            const element = labels[i];
            text = text + '<tspan x="0" dy="' + ((i > 0) ? 15 : 0) + '" text-anchor="middle">' + element.trim() + '</tspan>';
        }
        text = text + '</text>';
    }

    var elementSvg =
        '<g id="element_' + element.id + '" transform="translate(' + x + ',' + y + ')">' +
        '<circle id="element_circle_' + element.id + '" cx="0" cy="0" r="5" stroke="' + (element.evolved ? 'red' : 'black') + '" fill="white" />' +
        text +
        '</g>';

    return elementSvg;
};

var renderMethods = function (elements, methods, mapWidth, mapHeight) {

    var mapElement = function (method, elements) {
        var el = getElementByName(elements, method.name);
        return renderMethod(el, method, mapWidth, mapHeight);
    };
    return methods.map(m => mapElement(m, elements)).join('');
};

var renderElements = function (elements, mapWidth, mapHeight) {
    var mapElement = function (element) {
        return renderElement(element, mapWidth, mapHeight);
    };
    return elements.map(mapElement).join('');
};

export var renderSvg = function (mapScript, mapWidth, mapHeight) {

    var evolveElements = mapScript.elements.filter(el => el.evolving);
    var noneEvolving = mapScript.elements.filter(el => el.evolving == false);
    var evolvedElements = evolveElements.map(el => {
        return {
            name: el.name,
            id: (el.id + 'ev'),
            maturity: el.evolveMaturity,
            visibility: el.visibility,
            evoving: false,
            evolved: true
        };
    });

    var nonEvolvedElements = noneEvolving.concat(evolveElements);
    var mergedElements = noneEvolving.concat(evolvedElements).concat(evolveElements);
    var evolveEndLinks = mapScript.links.filter(li => evolvedElements.find(i => i.name == li.end) && noneEvolving.find(i => i.name == li.start));
    var evolveStartLinks = mapScript.links.filter(li => evolvedElements.find(i => i.name == li.start) && noneEvolving.find(i => i.name == li.end));
    var bothEvolving = mapScript.links.filter(li => evolveElements.find(i => i.name == li.start) && evolveElements.find(i => i.name == li.end));
    var evolveToEvolved = mapScript.links.filter(li => evolveElements.find(i => i.name == li.start) && evolvedElements.find(i => i.name == li.end));
    var bothEvolved = mapScript.links.filter(li => evolvedElements.find(i => i.name == li.start) && evolvedElements.find(i => i.name == li.end));
    var evolvedToEvolving = mapScript.links.filter(li => evolvedElements.find(i => i.name == li.start) && evolveElements.find(i => i.name == li.end));

    var mapSvg =
        '<g id="methods">' +
        renderMethods(nonEvolvedElements, mapScript.methods, mapWidth, mapHeight) +
        '</g>' +
        '<g id="links">' +
        renderLinks(mapScript.links, mergedElements, mapWidth, mapHeight) +
        '</g>' +
        '<g id="evolvingEndLinks">' +
        renderEvolvingEndLinks(evolveEndLinks, noneEvolving, evolveElements, mapWidth, mapHeight) +
        '</g>' +
        '<g id="evolvingBothLinks">' +
        renderEvolvingBothLinks(bothEvolved, evolvedElements, evolvedElements, mapWidth, mapHeight) +
        '</g>' +
        '<g id="evolvedToEvolvingLinks">' +
        renderEvolvingEndLinks(evolvedToEvolving, evolvedElements, evolveElements, mapWidth, mapHeight) +
        '</g>' +
        '<g id="evolvingStartLinks">' +
        renderEvolvingStartLinks(evolveStartLinks, noneEvolving, evolveElements, mapWidth, mapHeight) +
        '</g>' +
        '<g id="evolvingStartEvolvingEndLinks">' +
        renderEvolvingStartEvolvingEndLinks(bothEvolving, evolveElements, mapWidth, mapHeight) +
        '</g>' +
        '<g id="evolvedStartEvolvingEndLinks">' +
        renderEvolvingStartEvolvedEndLinks(evolveToEvolved, evolveElements, evolvedElements, mapWidth, mapHeight) +
        '</g>' +
        '<g id="evolvedLinks">' +
        renderEvolvedLinks(evolvedElements, evolveElements, mapWidth, mapHeight) +
        '</g>' +
        '<g id="elements">' +
        renderElements(mergedElements, mapWidth, mapHeight) +
        '</g>';

    return mapSvg;
};