export const rename = (
    currentLine: number,
    toFind: string,
    replaceWith: string,
    mapText: string,
    mutateMapMethod: (updatedText: string) => void,
): void => {
    if (replaceWith !== toFind && replaceWith.length > 0) {
        const lines: string[] = mapText.split('\n');
        const elementAtLine: string = lines[currentLine - 1];
        lines[currentLine - 1] = elementAtLine.replace(toFind, replaceWith);

        for (let i = 0; i < lines.length; i++) {
            const line: string = lines[i].trim();

            if (line.includes(`->`) && line.split('->').length === 2) {
                const parts: string[] = line.split('->');
                const firstPart: string = parts[0].trim();
                const secondPart: string = parts[1].trim();

                if (firstPart === toFind) {
                    lines[i] = [replaceWith, secondPart].join('->');
                }
                if (secondPart === toFind) {
                    lines[i] = [firstPart, replaceWith].join('->');
                }
                if (
                    secondPart.includes(';') &&
                    secondPart.split(';')[0].trim() === toFind
                ) {
                    const optionalNote: string = secondPart
                        .split(';')[1]
                        .trim();
                    lines[i] = [
                        firstPart,
                        `${replaceWith};${optionalNote}`,
                    ].join('->');
                }
            }

            ['pipeline', 'build', 'buy', 'outsource'].forEach(
                (startsWith: string) => {
                    if (
                        line.startsWith(startsWith) &&
                        line.split(startsWith).length > 1 &&
                        line.split(startsWith)[1].trim() === toFind
                    ) {
                        lines[i] = `${startsWith} ${line
                            .split(startsWith)[1]
                            .trim()
                            .replace(toFind, replaceWith)}`;
                    }
                },
            );
            ['evolve'].forEach((startsWith: string) => {
                if (
                    line.startsWith(startsWith) &&
                    line.split(startsWith).length > 1
                ) {
                    const evolvedWithMaturity: boolean =
                        line
                            .split(startsWith)[1]
                            .trim()
                            .split(' ')[0]
                            .trim() === toFind;

                    if (evolvedWithMaturity) {
                        lines[i] = `${startsWith} ${line
                            .split(startsWith)[1]
                            .trim()
                            .replace(toFind, replaceWith)}`;
                    }

                    const cleanedPart: string = line
                        .split(startsWith)[1]
                        .trim()
                        .split(' ')[0]
                        .trim();

                    const evolvedWithNewName: boolean =
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
