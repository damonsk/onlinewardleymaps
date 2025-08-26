import {FlowLink} from '../types/unified/links';

export interface LinkTextUpdateResult {
    success: boolean;
    error?: string;
}

/**
 * Updates the context text of a link in the map text
 * @param mapText - The current map text
 * @param link - The link to update
 * @param newContextText - The new context text (empty string to remove context)
 * @returns Updated map text or the original if update fails
 */
export const updateLinkContextText = (
    mapText: string, 
    link: FlowLink, 
    newContextText: string
): {mapText: string; result: LinkTextUpdateResult} => {
    if (!mapText || typeof mapText !== 'string') {
        return {
            mapText,
            result: {success: false, error: 'Invalid map text provided'}
        };
    }

    // Sanitize the new context text (single line only, no special characters that could break syntax)
    const sanitizedContextText = newContextText.replace(/[\n\r]/g, '').trim();

    try {
        const lines = mapText.split('\n');
        let updated = false;

        const updatedLines = lines.map(line => {
            // Look for links that match our source and target components
            if (isMatchingLinkLine(line, link)) {
                updated = true;
                return updateLinkLineContext(line, sanitizedContextText);
            }
            return line;
        });

        if (!updated) {
            return {
                mapText,
                result: {success: false, error: 'Link not found in map text'}
            };
        }

        return {
            mapText: updatedLines.join('\n'),
            result: {success: true}
        };
    } catch (error) {
        return {
            mapText,
            result: {success: false, error: `Failed to update link context: ${error instanceof Error ? error.message : String(error)}`}
        };
    }
};

/**
 * Checks if a line matches the given link
 */
function isMatchingLinkLine(line: string, link: FlowLink): boolean {
    const trimmedLine = line.trim();
    
    // Skip empty lines or lines that don't contain arrows
    if (!trimmedLine || (!trimmedLine.includes('->') && !trimmedLine.includes('->>') && !trimmedLine.includes('+>'))) {
        return false;
    }

    // Extract the link part (before any semicolon)
    const linkPart = trimmedLine.split(';')[0].trim();
    
    // Handle different link syntaxes
    let sourcePattern = '';
    let targetPattern = '';
    let arrowPattern = '';

    // Determine the arrow type and extract components
    if (linkPart.includes('->>')) {
        [sourcePattern, targetPattern] = linkPart.split('->>');
        arrowPattern = '->>';
    } else if (linkPart.includes('->')) {
        [sourcePattern, targetPattern] = linkPart.split('->');
        arrowPattern = '->';
    } else if (linkPart.includes('+>')) {
        [sourcePattern, targetPattern] = linkPart.split('+>');
        arrowPattern = '+>';
    } else {
        return false;
    }

    // Clean and unescape component names for comparison
    const sourceName = unescapeComponentName(sourcePattern.trim());
    const targetName = unescapeComponentName(targetPattern.trim());

    // Check if source and target match our link
    return sourceName === link.start && targetName === link.end;
}

/**
 * Updates the context part of a link line
 */
function updateLinkLineContext(line: string, newContextText: string): string {
    const trimmedLine = line.trim();
    const leadingWhitespace = line.match(/^\s*/)?.[0] || '';
    
    // Split the line at the semicolon
    const parts = trimmedLine.split(';');
    const linkPart = parts[0].trim();
    
    if (newContextText) {
        // Add or update context
        return `${leadingWhitespace}${linkPart};${newContextText}`;
    } else {
        // Remove context (just return the link part)
        return `${leadingWhitespace}${linkPart}`;
    }
}

/**
 * Unescapes a component name from map text format
 */
function unescapeComponentName(name: string): string {
    // Remove quotes if present and unescape
    if (name.startsWith('"') && name.endsWith('"')) {
        return name.slice(1, -1)
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\');
    }
    return name;
}