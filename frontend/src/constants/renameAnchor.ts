import {componentNamesMatch} from '../utils/componentNameMatching';

export interface RenameAnchorResult {
    success: boolean;
    error?: string;
}

/**
 * Renames an anchor in the map text and updates all references to it.
 * Handles both single-line and multi-line anchor names with proper quoting.
 * 
 * @param line - The line number where the anchor is defined (1-based)
 * @param oldName - The current anchor name
 * @param newName - The new anchor name
 * @param mapText - The complete map text
 * @param mutateMapText - Function to update the map text
 * @returns Result object indicating success or failure with error message
 */
export function renameAnchor(
    line: number,
    oldName: string,
    newName: string,
    mapText: string,
    mutateMapText: (newText: string) => void,
): RenameAnchorResult {
    // Validate inputs
    if (!mapText || typeof mapText !== 'string') {
        return {success: false, error: 'Invalid map text provided'};
    }

    if (!newName || newName.trim().length === 0) {
        return {success: false, error: 'New anchor name cannot be empty'};
    }

    if (newName === oldName) {
        return {success: true}; // No change needed
    }

    // Validate that the new name doesn't contain forbidden characters
    const forbiddenChars = ['[', ']', '-', '>', ';'];
    const containsForbidden = forbiddenChars.some(char => newName.includes(char));
    if (containsForbidden) {
        return {
            success: false,
            error: `Anchor name cannot contain the following characters: ${forbiddenChars.join(', ')}`,
        };
    }

    try {
        const lines: string[] = mapText.split('\n');

        // Check if the line number is valid
        if (line < 1 || line > lines.length) {
            return {success: false, error: `Line number ${line} is out of bounds (1-${lines.length})`};
        }

        const elementAtLine: string = lines[line - 1];

        // Check if this is actually an anchor line
        if (!elementAtLine.trim().startsWith('anchor ')) {
            return {success: false, error: 'The specified line does not contain an anchor definition'};
        }

        // Check if the line still contains the original anchor name (concurrent edit detection)
        const anchorRegex = /^anchor\s+(.+?)\s+\[([^\]]+)\](?:\s+label\s+\[([^\]]+)\])?/;
        const match = elementAtLine.trim().match(anchorRegex);

        if (!match) {
            return {success: false, error: 'Invalid anchor format found'};
        }

        let anchorNameInLine = match[1].trim();

        // Handle quoted anchor names
        if (anchorNameInLine.startsWith('"') && anchorNameInLine.endsWith('"')) {
            anchorNameInLine = anchorNameInLine
                .slice(1, -1)
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\\\/g, '\\');
        }

        // Verify this is the correct anchor
        if (!componentNamesMatch(anchorNameInLine, oldName)) {
            return {
                success: false,
                error: 'The anchor has been modified by another operation. Please refresh and try again.',
            };
        }

        // Check for name conflicts with existing components and anchors
        const nameConflictResult = checkForNameConflicts(newName, oldName, mapText);
        if (!nameConflictResult.success) {
            return nameConflictResult;
        }

        // Determine if we need quoted format for the new name
        const needsQuotes = 
            newName.includes('\n') || 
            newName.includes('"') || 
            newName.includes("'") || 
            newName.includes('\\') ||
            newName.includes(' ');

        let formattedNewName = newName;
        if (needsQuotes) {
            // Escape the name for DSL format
            const escapedName = newName
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n');
            formattedNewName = `"${escapedName}"`;
        }

        // Update the anchor definition line
        const coordinates = match[2];
        const labelPart = match[3] ? ` label [${match[3]}]` : '';
        const newAnchorLine = `anchor ${formattedNewName} [${coordinates}]${labelPart}`;
        
        lines[line - 1] = elementAtLine.replace(elementAtLine.trim(), newAnchorLine);

        // Update all references to the anchor throughout the map
        const updatedLines = updateAnchorReferences(lines, oldName, newName, formattedNewName);

        mutateMapText(updatedLines.join('\n'));
        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: `Failed to rename anchor: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Check for name conflicts with existing components and anchors
 */
function checkForNameConflicts(newName: string, oldName: string, mapText: string): RenameAnchorResult {
    const lines = mapText.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Check component definitions
        if (trimmedLine.startsWith('component ')) {
            const componentMatch = trimmedLine.match(/^component\s+(.+?)\s+\[/);
            if (componentMatch) {
                let componentName = componentMatch[1].trim();
                
                // Handle quoted component names
                if (componentName.startsWith('"') && componentName.endsWith('"')) {
                    componentName = componentName
                        .slice(1, -1)
                        .replace(/\\"/g, '"')
                        .replace(/\\n/g, '\n')
                        .replace(/\\\\/g, '\\');
                }
                
                if (componentNamesMatch(componentName, newName) && !componentNamesMatch(componentName, oldName)) {
                    return {success: false, error: `A component named "${newName}" already exists`};
                }
            }
        }
        
        // Check other anchor definitions
        if (trimmedLine.startsWith('anchor ')) {
            const anchorMatch = trimmedLine.match(/^anchor\s+(.+?)\s+\[/);
            if (anchorMatch) {
                let anchorName = anchorMatch[1].trim();
                
                // Handle quoted anchor names
                if (anchorName.startsWith('"') && anchorName.endsWith('"')) {
                    anchorName = anchorName
                        .slice(1, -1)
                        .replace(/\\"/g, '"')
                        .replace(/\\n/g, '\n')
                        .replace(/\\\\/g, '\\');
                }
                
                if (componentNamesMatch(anchorName, newName) && !componentNamesMatch(anchorName, oldName)) {
                    return {success: false, error: `An anchor named "${newName}" already exists`};
                }
            }
        }
    }
    
    return {success: true};
}

/**
 * Update all references to the anchor throughout the map text
 */
function updateAnchorReferences(lines: string[], oldName: string, newName: string, formattedNewName: string): string[] {
    const isDefinitionLine = (text: string) =>
        /^(component|anchor|market|ecosystem|note|pipeline)\s/i.test(text) || /^evolve\s/i.test(text);

    const parseEndpoint = (endpointRaw: string): {raw: string; name: string; quoted: boolean} => {
        const ep = endpointRaw.trim();
        if (ep.startsWith('"')) {
            const match = ep.match(/^"((?:[^"\\]|\\.)*)"/);
            if (match) {
                const unescaped = match[1]
                    .replace(/\\"/g, '"')
                    .replace(/\\n/g, '\n')
                    .replace(/\\\\/g, '\\');
                return {raw: match[0], name: unescaped, quoted: true};
            }
        }
        const nameMatch = ep.match(/^(\S+)/);
        const name = nameMatch ? nameMatch[1] : ep;
        return {raw: name, name, quoted: false};
    };

    const renderNewEndpoint = (endpoint: {quoted: boolean}): string => {
        return endpoint.quoted || formattedNewName.startsWith('"') ? formattedNewName : newName;
    };

    return lines.map((line, index) => {
        try {
            const trimmed = line.trim();
            if (!trimmed.includes('->') || isDefinitionLine(trimmed)) {
                return line;
            }

            const arrowIndex = trimmed.indexOf('->');
            const leftRaw = trimmed.slice(0, arrowIndex);
            const rightRaw = trimmed.slice(arrowIndex + 2);

            const left = parseEndpoint(leftRaw);
            const right = parseEndpoint(rightRaw);

            let leftOut = left.raw;
            let rightOut = right.raw;

            if (componentNamesMatch(left.name, oldName)) {
                leftOut = renderNewEndpoint(left);
            }

            if (componentNamesMatch(right.name, oldName)) {
                rightOut = renderNewEndpoint(right);
            }

            const leftStart = leftRaw.length - leftRaw.trimStart().length;
            const leftTokenStart = leftStart;
            const leftTokenEnd = leftTokenStart + left.raw.length;
            const leftRebuilt = `${leftRaw.slice(0, leftTokenStart)}${leftOut}${leftRaw.slice(leftTokenEnd)}`;

            const rightStart = rightRaw.length - rightRaw.trimStart().length;
            const rightTokenStart = rightStart;
            const rightTokenEnd = rightTokenStart + right.raw.length;
            const rightRebuilt = `${rightRaw.slice(0, rightTokenStart)}${rightOut}${rightRaw.slice(rightTokenEnd)}`;

            const reconstructed = `${leftRebuilt}->${rightRebuilt}`;
            return line.replace(trimmed, reconstructed);
        } catch (e) {
            console.error('Error processing line:', index, line, e);
            return line;
        }
    });
}
