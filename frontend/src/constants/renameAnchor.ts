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
    return lines.map((line, index) => {
        try {
            const trimmedLine = line.trim();
            
            // Skip the anchor definition line itself (already updated)
            // But return the already updated line
            if (trimmedLine.startsWith('anchor ')) {
                return line;
            }
            
            // Update link references
            // Links can reference anchors like: Component->AnchorName or "Component"->"Anchor Name"
            let updatedLine = line;
            
            // Handle quoted references in links
            const quotedPattern = /"((?:[^"\\]|\\.)*)"/g;
            updatedLine = updatedLine.replace(quotedPattern, (match, content) => {
                try {
                    // Unescape the content to compare with the original name
                    const unescapedContent = content
                        .replace(/\\"/g, '"')
                        .replace(/\\n/g, '\n')
                        .replace(/\\\\/g, '\\');
                    
                    if (componentNamesMatch(unescapedContent, oldName)) {
                        // Replace with the formatted new name (already properly escaped)
                        return formattedNewName;
                    }
                    return match;
                } catch (e) {
                    console.error('Error processing quoted pattern:', e);
                    return match;
                }
            });
            
            // Handle unquoted references (for single-line names)
            if (!oldName.includes('\n')) {
                try {
                    // Use word boundaries and context-aware matching
                    // Match anchor names that are followed by -> or at the end of the line
                    const anchorNamePattern = new RegExp(
                        `\\b${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?=\\s*(?:->|$))`,
                        'g',
                    );
                    
                    updatedLine = updatedLine.replace(anchorNamePattern, () => {
                        // If the new name needs quoting (multi-line), use quoted format
                        if (formattedNewName.startsWith('"')) {
                            return formattedNewName;
                        }
                        return newName;
                    });
                } catch (e) {
                    console.error('Error processing unquoted pattern:', e);
                }
            }
            
            return updatedLine;
        } catch (e) {
            console.error('Error processing line:', index, line, e);
            return line;
        }
    });
}