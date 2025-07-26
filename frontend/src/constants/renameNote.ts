export const renameNote = (
    currentLine: number,
    originalText: string,
    newText: string,
    mapText: string,
    mutateMapMethod: (updatedText: string) => void,
): void => {
    if (newText !== originalText && newText.trim().length > 0) {
        const lines: string[] = mapText.split('\n');

        // Check if the line number is valid
        if (currentLine < 1 || currentLine > lines.length) {
            return; // Silently return if line number is out of bounds
        }

        const elementAtLine: string = lines[currentLine - 1];

        // Parse note syntax: "note <text> [<visibility>, <maturity>]"
        // The text part is everything after "note " until the first "["
        const notePattern = /^(\s*note\s+)(.+?)(\s+\[[^\]]+\])(\s*)$/;
        const match = elementAtLine.match(notePattern);

        if (match) {
            const [, prefix, , coordinates, suffix] = match;
            // Reconstruct the line with new text while preserving coordinates and formatting
            lines[currentLine - 1] = `${prefix}${newText.trim()}${coordinates}${suffix}`;
            mutateMapMethod(lines.join('\n'));
        } else {
            // Fallback: simple text replacement if pattern doesn't match
            // This handles edge cases where the note format might be slightly different
            lines[currentLine - 1] = elementAtLine.replace(originalText, newText.trim());
            mutateMapMethod(lines.join('\n'));
        }
    }
};
