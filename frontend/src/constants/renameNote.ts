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

        // Check if the line still contains the original text (concurrent edit detection)
        if (!elementAtLine.includes(originalText)) {
            return {
                success: false,
                error: 'The note has been modified by another operation. Please refresh and try again.',
            };
        }

        // Parse note syntax: "note <text> [<visibility>, <maturity>]"
        // The text part is everything after "note " until the first "["
        const notePattern = /^(\s*note\s+)(.+?)(\s+\[[^\]]+\])(\s*)$/;
        const match = elementAtLine.match(notePattern);

        if (match) {
            const [, prefix, currentNoteText, coordinates, suffix] = match;

            // Verify the original text matches what we expect
            if (currentNoteText.trim() !== originalText.trim()) {
                return {
                    success: false,
                    error: 'The note content has changed. Please refresh and try again.',
                };
            }

            // Sanitize the new text to prevent breaking the map syntax
            const sanitizedText = newText.trim().replace(/[\[\]]/g, ''); // Remove brackets that could break syntax

            // Reconstruct the line with new text while preserving coordinates and formatting
            lines[currentLine - 1] = `${prefix}${sanitizedText}${coordinates}${suffix}`;
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
