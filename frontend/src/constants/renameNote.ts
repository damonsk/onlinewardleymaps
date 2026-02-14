export const renameNote = (
    currentLine: number,
    originalText: string,
    newText: string,
    mapText: string,
    mutateMapMethod: (updatedText: string) => void,
): {success: boolean; error?: string} => {
    // Validate inputs
    if (!mapText || typeof mapText !== 'string') {
        return {success: false, error: 'Invalid map text provided'};
    }

    if (!newText || newText.trim().length === 0) {
        return {success: false, error: 'New text cannot be empty'};
    }

    if (newText === originalText) {
        return {success: true}; // No change needed
    }

    try {
        const lines: string[] = mapText.split('\n');

        // Check if the line number is valid
        if (currentLine < 1 || currentLine > lines.length) {
            return {success: false, error: `Line number ${currentLine} is out of bounds (1-${lines.length})`};
        }

        const elementAtLine: string = lines[currentLine - 1];

        // For quoted syntax, we need to check if the line contains the text in either escaped or unescaped form
        // For unquoted syntax, we check for literal inclusion
        const quotedPattern = /^(\s*note\s+)"((?:[^"\\]|\\.)*)"(\s+\[[^\]]+\])(\s*)$/;
        const isQuotedSyntax = quotedPattern.test(elementAtLine);

        let containsOriginalText = false;
        if (isQuotedSyntax) {
            // For quoted syntax, extract and unescape the text to compare
            const quotedMatch = elementAtLine.match(quotedPattern);
            if (quotedMatch) {
                const currentNoteText = quotedMatch[2];
                const unescapedCurrentText = currentNoteText
                    .replace(/\\n/g, '\n') // Convert \n to line breaks
                    .replace(/\\"/g, '"') // Unescape quotes
                    .replace(/\\\\/g, '\\'); // Unescape backslashes (must be last)
                containsOriginalText = unescapedCurrentText === originalText;
            }
        } else {
            // For unquoted syntax, check literal inclusion
            containsOriginalText = elementAtLine.includes(originalText);
        }

        if (!containsOriginalText) {
            return {
                success: false,
                error: 'The note has been modified by another operation. Please refresh and try again.',
            };
        }

        // Parse note syntax: supports both quoted and unquoted formats
        // We already determined if it's quoted syntax above

        if (isQuotedSyntax) {
            // We already have the quotedMatch from above
            const quotedMatch = elementAtLine.match(quotedPattern);
            if (quotedMatch) {
                const [, prefix, currentNoteText, coordinates, suffix] = quotedMatch;

                // Determine if we need quoted syntax for the new text
                const needsQuoting = newText.includes('\n') || newText.includes('"') || newText.includes('\\');

                if (needsQuoting) {
                    // Escape the new text for quoted syntax
                    const escapedText = newText
                        .replace(/\\/g, '\\\\') // Escape backslashes first
                        .replace(/"/g, '\\"') // Escape quotes
                        .replace(/\n/g, '\\n'); // Convert line breaks to \n

                    // Reconstruct with quoted syntax
                    lines[currentLine - 1] = `${prefix}"${escapedText}"${coordinates}${suffix}`;
                } else {
                    // Simple text, can use unquoted syntax
                    const sanitizedText = newText.trim().replace(/[\[\]]/g, ''); // Remove brackets that could break syntax
                    lines[currentLine - 1] = `${prefix}${sanitizedText}${coordinates}${suffix}`;
                }

                mutateMapMethod(lines.join('\n'));
                return {success: true};
            }
        }

        // Try unquoted syntax
        const unquotedPattern = /^(\s*note\s+)(.+?)(\s+\[[^\]]+\])(\s*)$/;
        const unquotedMatch = elementAtLine.match(unquotedPattern);

        if (unquotedMatch) {
            const [, prefix, currentNoteText, coordinates, suffix] = unquotedMatch;

            // Verify the original text matches what we expect
            if (currentNoteText.trim() !== originalText.trim()) {
                return {
                    success: false,
                    error: 'The note content has changed. Please refresh and try again.',
                };
            }

            // Determine if we need quoted syntax for the new text
            const needsQuoting = newText.includes('\n') || newText.includes('"') || newText.includes('\\');

            if (needsQuoting) {
                // Escape the new text for quoted syntax
                const escapedText = newText
                    .replace(/\\/g, '\\\\') // Escape backslashes first
                    .replace(/"/g, '\\"') // Escape quotes
                    .replace(/\n/g, '\\n'); // Convert line breaks to \n

                // Reconstruct with quoted syntax
                lines[currentLine - 1] = `${prefix}"${escapedText}"${coordinates}${suffix}`;
            } else {
                // Simple text, keep unquoted syntax
                const sanitizedText = newText.trim().replace(/[\[\]]/g, ''); // Remove brackets that could break syntax
                lines[currentLine - 1] = `${prefix}${sanitizedText}${coordinates}${suffix}`;
            }

            mutateMapMethod(lines.join('\n'));
            return {success: true};
        } else {
            // Check if this is still a note line (might have different format)
            if (!elementAtLine.toLowerCase().includes('note')) {
                return {
                    success: false,
                    error: 'The line is no longer a note. Please refresh and try again.',
                };
            }

            // Fallback: simple text replacement if pattern doesn't match
            // This handles edge cases where the note format might be slightly different
            const sanitizedText = newText.trim().replace(/[\[\]]/g, '');
            lines[currentLine - 1] = elementAtLine.replace(originalText, sanitizedText);
            mutateMapMethod(lines.join('\n'));
            return {success: true};
        }
    } catch (error) {
        return {
            success: false,
            error: `Failed to update note: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
};
