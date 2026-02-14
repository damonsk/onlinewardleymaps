import {Moved, Replacer} from '../../../types/base';
import {normalizeComponentName} from '../../../utils/componentNameMatching';

export const ModernExistingCoordsMatcher: Replacer = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        // Handle both quoted and unquoted component names in coordinate matching
        const trimmedLine = line.trim();

        if (!trimmedLine.startsWith(type)) {
            return false;
        }

        const content = trimmedLine.substring(type.length).trim();

        // Extract component name from the line
        let componentNameInLine = '';
        if (content.startsWith('"')) {
            // Extract quoted component name
            const quotedMatch = content.match(/^"((?:[^"\\]|\\.)*)"/);
            if (quotedMatch) {
                componentNameInLine = quotedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
            }
        } else {
            // Extract unquoted component name (up to first bracket or special character)
            const unquotedMatch = content.match(/^([^\[\]]+?)(?:\s*\[|\s*label|\s*$)/);
            if (unquotedMatch) {
                componentNameInLine = unquotedMatch[1].trim();
            }
        }

        // Use normalized matching and check for coordinates
        return (
            normalizeComponentName(componentNameInLine) === normalizeComponentName(identifier) && line.includes('[') && line.includes(']')
        );
    },

    action: (line: string, moved: Moved): string => {
        const param1 = typeof moved.param1 === 'number' ? moved.param1.toString() : parseFloat(moved.param1).toString();
        const param2 = typeof moved.param2 === 'number' ? moved.param2.toString() : parseFloat(moved.param2).toString();
        const result = line.replace(/\[([^[\]]+)\]/g, `[${param1}, ${param2}]`);
        return result;
    },
};
