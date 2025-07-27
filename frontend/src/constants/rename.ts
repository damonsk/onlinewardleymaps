export const rename = (
    currentLine: number,
    toFind: string,
    replaceWith: string,
    mapText: string,
    mutateMapMethod: (updatedText: string) => void,
): {success: boolean; error?: string} => {
    // Validate inputs
    if (!mapText || typeof mapText !== 'string') {
        return {success: false, error: 'Invalid map text provided'};
    }

    if (!replaceWith || replaceWith.trim().length === 0) {
        return {success: false, error: 'New component name cannot be empty'};
    }

    if (replaceWith === toFind) {
        return {success: true}; // No change needed
    }

    try {
        const lines: string[] = mapText.split('\n');

        // Check if the line number is valid
        if (currentLine < 1 || currentLine > lines.length) {
            return {success: false, error: `Line number ${currentLine} is out of bounds (1-${lines.length})`};
        }

        const elementAtLine: string = lines[currentLine - 1];

        // Check if the line still contains the original component name (concurrent edit detection)
        if (!elementAtLine.includes(toFind)) {
            return {
                success: false,
                error: 'The component has been modified by another operation. Please refresh and try again.',
            };
        }

        // Sanitize the new name to prevent breaking the map syntax
        const sanitizedName = replaceWith.trim().replace(/[\[\]\->]/g, ''); // Remove characters that could break syntax

        // Validate the new name doesn't contain reserved keywords or patterns
        const reservedKeywords = ['note', 'pipeline', 'build', 'buy', 'outsource', 'evolve', 'anchor'];
        if (reservedKeywords.some(keyword => sanitizedName.toLowerCase() === keyword)) {
            return {
                success: false,
                error: `"${sanitizedName}" is a reserved keyword and cannot be used as a component name`,
            };
        }

        // Replace the component name on its definition line
        lines[currentLine - 1] = elementAtLine.replace(toFind, sanitizedName);

        // Update all references to the component throughout the map
        for (let i = 0; i < lines.length; i++) {
            const line: string = lines[i].trim();

            // Handle link references (component1 -> component2)
            if (line.includes(`->`) && line.split('->').length === 2) {
                const parts: string[] = line.split('->');
                const firstPart: string = parts[0].trim();
                const secondPart: string = parts[1].trim();

                if (firstPart === toFind) {
                    lines[i] = [sanitizedName, secondPart].join('->');
                }
                if (secondPart === toFind) {
                    lines[i] = [firstPart, sanitizedName].join('->');
                }
                if (secondPart.includes(';') && secondPart.split(';')[0].trim() === toFind) {
                    const optionalNote: string = secondPart.split(';')[1].trim();
                    lines[i] = [firstPart, `${sanitizedName};${optionalNote}`].join('->');
                }
            }

            // Handle pipeline references
            ['pipeline', 'build', 'buy', 'outsource'].forEach((startsWith: string) => {
                if (line.startsWith(startsWith) && line.split(startsWith).length > 1 && line.split(startsWith)[1].trim() === toFind) {
                    lines[i] = `${startsWith} ${line.split(startsWith)[1].trim().replace(toFind, sanitizedName)}`;
                }
            });

            // Handle evolution references
            ['evolve'].forEach((startsWith: string) => {
                if (line.startsWith(startsWith) && line.split(startsWith).length > 1) {
                    const evolvedWithMaturity: boolean = line.split(startsWith)[1].trim().split(' ')[0].trim() === toFind;

                    if (evolvedWithMaturity) {
                        lines[i] = `${startsWith} ${line.split(startsWith)[1].trim().replace(toFind, sanitizedName)}`;
                    }

                    const cleanedPart: string = line.split(startsWith)[1].trim().split(' ')[0].trim();
                    const evolvedWithNewName: boolean = cleanedPart.includes(toFind) && cleanedPart.includes('->');

                    if (evolvedWithNewName) {
                        lines[i] = `${startsWith} ${line.split(startsWith)[1].trim().replace(toFind, sanitizedName)}`;
                    }
                }
            });
        }

        mutateMapMethod(lines.join('\n'));
        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: `Failed to rename component: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
};
