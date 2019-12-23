import MapPositionCalculator from "./MapPositionCalculator";

var _mapHelper = new MapPositionCalculator();

var renderElement = function (element, mapWidth, mapHeight) {
    var x = _mapHelper.maturityToX(element.maturity, mapWidth);
    var y = _mapHelper.visibilityToY(element.visibility, mapHeight);

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
        '<g class="draggable node ' + (element.evolved ? "evolved" : '') + ' " id="element_' + element.id + '" transform="translate(' + x + ',' + y + ')">' +
        '<circle id="element_circle_' + element.id + '" cx="0" cy="0" r="5" stroke="' + (element.evolved ? 'red' : 'black') + '" fill="white" />' +
        text +
        '</g>';

    return elementSvg;
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

    var mergedElements = noneEvolving.concat(evolvedElements).concat(evolveElements);

    var mapSvg =
        '<g id="elements">' +
        renderElements(mergedElements, mapWidth, mapHeight) +
        '</g>';
    return mapSvg;
};
