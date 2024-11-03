export const rename = (
    currentLine,
    toFind,
    replaceWith,
    mapText,
    mutateMapMethod,
) => {
    if (replaceWith !== toFind && replaceWith.length > 0) {
        let elementAtLine = mapText.split('\n')[currentLine - 1];
        let lines = mapText.split('\n');
        lines[currentLine - 1] = elementAtLine.replace(toFind, replaceWith);

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            if (line.includes(`->`) && line.split('->').length === 2) {
                const parts = line.split('->');
                const firstPart = parts[0].trim();
                const secondPart = parts[1].trim();

                if (firstPart == toFind) {
                    lines[i] = [replaceWith, secondPart].join('->');
                }
                if (secondPart == toFind) {
                    lines[i] = [firstPart, replaceWith].join('->');
                }
                if (
                    secondPart.includes(';') &&
                    secondPart.split(';')[0].trim() === toFind
                ) {
                    const optionalNote = secondPart.split(';')[1].trim();
                    lines[i] = [
                        firstPart,
                        `${replaceWith};${optionalNote}`,
                    ].join('->');
                }
            }

            ['pipeline', 'build', 'buy', 'outsource'].map(startsWith => {
                if (
                    line.startsWith(startsWith) &&
                    line.split(startsWith).length > 1 &&
                    line.split(startsWith)[1].trim() == toFind
                ) {
                    lines[i] = `${startsWith} ${line
                        .split(startsWith)[1]
                        .trim()
                        .replace(toFind, replaceWith)}`;
                }
            });
            ['evolve'].map(startsWith => {
                if (
                    line.startsWith(startsWith) &&
                    line.split(startsWith).length > 1
                ) {
                    const evolvedWithMaturity =
                        line
                            .split(startsWith)[1]
                            .trim()
                            .split(' ')[0]
                            .trim() == toFind;

                    if (evolvedWithMaturity) {
                        lines[i] = `${startsWith} ${line
                            .split(startsWith)[1]
                            .trim()
                            .replace(toFind, replaceWith)}`;
                    }

                    const cleanedPart = line
                        .split(startsWith)[1]
                        .trim()
                        .split(' ')[0]
                        .trim();

                    const evolvedWithNewName =
                        cleanedPart.includes(toFind) &&
                        cleanedPart.includes('->');

                    if (evolvedWithNewName) {
                        lines[i] = `${startsWith} ${line
                            .split(startsWith)[1]
                            .trim()
                            .replace(toFind, replaceWith)}`;
                    }
                }
            });
        }
        mutateMapMethod(lines.join('\n'));
    }
};
