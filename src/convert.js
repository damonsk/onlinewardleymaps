export default class Convert {

    parse(data) {

        let jobj = {
            title: this.title(data),
            elements: this.elements(data),
            links: this.links(data),
            evolution: this.evolution(data),
            presentation: this.presentation(data),
            methods: this.method(data)
        };

        return jobj;
    }

    method(input) {
        let trimmed = input.trim();
        let elementsAsArray = trimmed.split('\n');

        let methodElements = [];

        for (let i = 0; i < elementsAsArray.length; i++) {
            const element = elementsAsArray[i];
            if (element.trim().indexOf('outsource ') == 0) {
                let name = element.split('outsource ')[1].trim();

                methodElements.push(
                    {
                        name: name,
                        method: "outsource"
                    });
            }
            else if (element.trim().indexOf('build ') == 0) {
                let name = element.split('build ')[1].trim();

                methodElements.push(
                    {
                        name: name,
                        method: "build"
                    });
            }
            else if (element.trim().indexOf('buy ') == 0) {
                let name = element.split('buy ')[1].trim();

                methodElements.push(
                    {
                        name: name,
                        method: "buy"
                    });
            }
        }

        return methodElements;
    }

    presentation(input) {
        let trimmed = input.trim();
        let elementsAsArray = trimmed.split('\n');
        for (let i = 0; i < elementsAsArray.length; i++) {
            const element = elementsAsArray[i];
            if (element.trim().indexOf('style') == 0) {
                let name = element.split('style ')[1].trim();
                return { style: name };
            }
        }
        return { style: 'plain' }
    }

    evolution(input) {
        let trimmed = input.trim();
        let elementsAsArray = trimmed.split('\n');
        for (let i = 0; i < elementsAsArray.length; i++) {
            const element = elementsAsArray[i];
            if (element.trim().indexOf('evolution') == 0) {
                let name = element.split('evolution ')[1].trim().split('->');
                return [{ line1: name[0], line2: '' }, { line1: name[1], line2: '' }, { line1: name[2], line2: '' }, { line1: name[3], line2: '' }]
            }
        }
        return [{ line1: "Genesis", line2: '' }, { line1: "Custom", line2: 'built' }, { line1: "Product", line2: '(+rental)' }, { line1: "Commodity", line2: '(+utility)' }]
    }

    title(input) {

        let trimmed = input.trim();
        let firstLine = trimmed.split('\n')[0];

        if (firstLine.indexOf('title') == 0) {
            return firstLine.split('title ')[1].trim();
        }

        return "Untitled Map";
    }

    elements(input) {

        let trimmed = input.trim();
        let elementsAsArray = trimmed.split('\n');

        let elementsToReturn = [];

        for (let i = 0; i < elementsAsArray.length; i++) {
            const element = elementsAsArray[i];
            if (element.trim().indexOf('component') == 0) {
                let name = element.split('component ')[1].trim().split(' [')[0].trim();
                let positionData = element.split('[')[1].trim().split(']')[0].trim().split(',');
                let newPoint;

                if (element.indexOf('evolve ') > -1) {
                    newPoint = element.split('evolve ')[1].trim();
                    newPoint = newPoint.replace('inertia', '').trim();
                }

                elementsToReturn.push(
                    {
                        name: name,
                        maturity: positionData[1],
                        visibility: positionData[0],
                        id: (1 + i),
                        evolving: (newPoint != null && newPoint != undefined),
                        evolveMaturity: newPoint,
                        inertia: (element.indexOf('inertia') > -1)
                    });
            }
        }

        return elementsToReturn;
    }

    links(input) {

        let trimmed = input.trim();
        let elementsAsArray = trimmed.split('\n');

        let linksToReturn = [];

        for (let i = 0; i < elementsAsArray.length; i++) {
            const element = elementsAsArray[i];
            console.log(element);
            if (element.trim().length > 0 &&
                element.trim().indexOf('evolution') == -1 &&
                element.trim().indexOf('component') == -1 &&
                element.trim().indexOf('style') == -1 &&
                element.trim().indexOf('build') == -1 &&
                element.trim().indexOf('buy') == -1 &&
                element.trim().indexOf('outsource') == -1 &&
                element.trim().indexOf('title') == -1) {

                // future
                if (element.indexOf('+>') > -1) {
                    let name = element.split('+>');
                    linksToReturn.push({ start: name[0].trim(), end: name[1].trim(), flow: true, future: true, past: false });
                }
                else if (element.indexOf('+<>') > -1) {
                    let name = element.split('+<>');
                    linksToReturn.push({ start: name[0].trim(), end: name[1].trim(), flow: true, future: true, past: true });
                }
                else if (element.indexOf('+<') > -1) {
                    let name = element.split('+<');
                    linksToReturn.push({ start: name[0].trim(), end: name[1].trim(), flow: true, future: false, past: true });
                }
                else if (element.indexOf('+\'') > -1) {

                    let flowValue;
                    let endName;
                    let isFuture = false;
                    let isPast = false;
                    // future 
                    if (element.indexOf("'>") > -1) {
                        flowValue = element.split("+'")[1].split("'>")[0];
                        endName = element.split("'>");
                        isFuture = true;
                    }
                    else if (element.indexOf("'<>") > -1) {
                        flowValue = element.split("+'")[1].split("'<>")[0];
                        endName = element.split("'<>");
                        isPast = true;
                        isFuture = true;
                    }
                    else if (element.indexOf("'<") > -1) {
                        flowValue = element.split("+'")[1].split("'<")[0];
                        endName = element.split("'<");
                        isPast = true;
                    }

                    let startName = element.split("+'");
                    linksToReturn.push({ start: startName[0].trim(), end: endName[1].trim(), flow: true, flowValue: flowValue, future: isFuture, past: isPast });
                }
                else {
                    let name = element.split('->');
                    linksToReturn.push({ start: name[0].trim(), end: name[1].trim(), flow: false });
                }
            }
        }

        return linksToReturn;
    }
};