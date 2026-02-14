import {componentNamesMatch} from '../utils/componentNameMatching';

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
        // For quoted names, we need to check for the escaped version in the line
        let nameToFind = toFind;
        if (elementAtLine.includes('"')) {
            // This might be a quoted component, try to find the escaped version
            const escapedToFind = toFind.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
            if (elementAtLine.includes(escapedToFind)) {
                nameToFind = escapedToFind;
            }
        }

        if (!elementAtLine.includes(nameToFind)) {
            return {
                success: false,
                error: 'The component has been modified by another operation. Please refresh and try again.',
            };
        }

        // Handle sanitization differently for quoted vs unquoted names
        let sanitizedName = replaceWith.trim();

        if (replaceWith.startsWith('"') && replaceWith.endsWith('"')) {
            // For quoted names, validate the format but don't sanitize the content
            // The content inside quotes can contain special characters
            const innerContent = replaceWith.slice(1, -1); // Remove quotes

            // Validate that the quoted content doesn't contain unescaped quotes
            const unescapedQuoteRegex = /(?<!\\)"/;
            if (unescapedQuoteRegex.test(innerContent)) {
                return {
                    success: false,
                    error: 'Component name contains unescaped quotes. Use \\" for literal quotes.',
                };
            }

            // For quoted names, we don't sanitize the content as it's already properly escaped
            // Just validate it's not empty when unescaped
            const unescapedContent = innerContent.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');

            if (unescapedContent.trim().length === 0) {
                return {
                    success: false,
                    error: 'Component name cannot be empty',
                };
            }
        } else {
            // For unquoted names, check if this is a single-to-multi-line transition that needs automatic quoting
            const isOriginalSingleLine = !toFind.includes('\n');
            const isNewMultiLine = replaceWith.includes('\n');
            const needsAutoQuoting = isOriginalSingleLine && isNewMultiLine;

            if (needsAutoQuoting) {
                // Automatically quote and escape for single-to-multi-line transitions
                const escapedContent = replaceWith
                    .replace(/\\/g, '\\\\') // Escape backslashes first
                    .replace(/"/g, '\\"') // Escape quotes
                    .replace(/\n/g, '\\n'); // Escape line breaks
                sanitizedName = `"${escapedContent}"`;
            } else {
                // For single-line names or multi-line to multi-line renames, apply traditional sanitization
                sanitizedName = replaceWith.replace(/[\[\]\->]/g, ''); // Remove characters that could break syntax

                // Validate the new name doesn't contain reserved keywords or patterns (only for single-line)
                if (!replaceWith.includes('\n')) {
                    const reservedKeywords = ['note', 'pipeline', 'build', 'buy', 'outsource', 'evolve', 'anchor'];
                    if (reservedKeywords.some(keyword => sanitizedName.toLowerCase() === keyword)) {
                        return {
                            success: false,
                            error: `"${sanitizedName}" is a reserved keyword and cannot be used as a component name`,
                        };
                    }
                }
            }
        }

        // Handle quoted component names (multi-line support)
        let updatedLine = elementAtLine;

        // Check if we're dealing with a quoted component name
        if (replaceWith.startsWith('"') && replaceWith.endsWith('"')) {
            // This is a quoted name (potentially multi-line)
            // Find the original quoted name in the line and replace it
            const quotedNameRegex = /"([^"\\]|\\.)*"/;
            const match = elementAtLine.match(quotedNameRegex);

            if (match) {
                // Replace the entire quoted section
                updatedLine = elementAtLine.replace(match[0], replaceWith);
            } else {
                // Fallback to simple replacement if no quoted section found
                updatedLine = elementAtLine.replace(nameToFind, replaceWith);
            }
        } else {
            // Regular (non-quoted) replacement
            updatedLine = elementAtLine.replace(nameToFind, sanitizedName);
        }

        lines[currentLine - 1] = updatedLine;

        // Extract the actual component name for reference matching
        // For quoted names, we need to match against the unescaped content
        let nameForMatching = toFind;
        let replacementForMatching = sanitizedName;

        if (replaceWith.startsWith('"') && replaceWith.endsWith('"')) {
            // For quoted replacement, extract the unescaped content for matching
            replacementForMatching = replaceWith.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
        }

        // Update all references to the component throughout the map
        // For multi-line component names, we need to handle references that span multiple lines
        const mapTextContent = lines.join('\n');
        let updatedMapText = mapTextContent;

        // Replace all occurrences of the component name in references
        // This handles both single-line to multi-line transitions and multi-line to multi-line updates

        // Determine if we need to use quoted format for the replacement
        const needsQuoting = replaceWith.startsWith('"') && replaceWith.endsWith('"');
        const isTransitioningToMultiLine = !nameForMatching.includes('\n') && replacementForMatching.includes('\n');

        // Always use the enhanced approach that handles both quoted and unquoted references
        const mapLines = updatedMapText.split('\n');
        const updatedLines = mapLines.map(line => {
            // Handle different types of references in the line

            // 1. Check for quoted references in links like "Component Name"->"Target"
            const quotedPattern = /"((?:[^"\\]|\\.)*)"/g;
            let updatedLine = line.replace(quotedPattern, (match, content) => {
                // Unescape the content to compare with the original name
                const unescapedContent = content.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');

                // Use normalized matching to check if this is our component
                if (componentNamesMatch(unescapedContent, nameForMatching)) {
                    // Replace with the new name, properly escaped for DSL format
                    const newEscapedContent = replacementForMatching.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
                    return `"${newEscapedContent}"`;
                }
                return match;
            });

            // 2. Check for unquoted references (for single-line names or transitions to multi-line)
            // This handles cases like: ComponentName->Target or evolve ComponentName 0.5
            if (!nameForMatching.includes('\n') || isTransitioningToMultiLine) {
                // Build pattern to match whole component names, not partial words
                // Use word boundaries and context-aware matching
                const componentNamePattern = new RegExp(
                    `\\b${nameForMatching.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?=\\s*(?:->|;|\\s+\\d+(?:\\.\\d+)?|$))`,
                    'g',
                );

                updatedLine = updatedLine.replace(componentNamePattern, match => {
                    // If the replacement needs quoting (multi-line), use quoted format
                    if (needsQuoting || isTransitioningToMultiLine) {
                        const escapedReplacement = replacementForMatching.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
                        return `"${escapedReplacement}"`;
                    }
                    return replacementForMatching;
                });
            }

            return updatedLine;
        });

        updatedMapText = updatedLines.join('\n');

        // Update the lines array with the modified content
        const finalLines = updatedMapText.split('\n');
        lines.length = 0; // Clear the array
        lines.push(...finalLines); // Add all updated lines

        mutateMapMethod(lines.join('\n'));
        return {success: true};
    } catch (error) {
        return {
            success: false,
            error: `Failed to rename component: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
};
