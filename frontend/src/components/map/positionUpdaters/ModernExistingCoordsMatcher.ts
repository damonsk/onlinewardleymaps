import { Moved, Replacer } from '../../../types/base';

/**
 * ModernExistingCoordsMatcher - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This matcher checks if a line contains the specified element and
 * replaces its coordinates with new values.
 */
export const ModernExistingCoordsMatcher: Replacer = {
    /**
     * Determines if the line contains the specified element
     *
     * @param line The line of text to check
     * @param identifier The element identifier
     * @param type The element type
     * @returns true if the line contains the element
     */
    matcher: (line: string, identifier: string, type: string): boolean => {
        return (
            line
                .replace(/\s/g, '')
                .indexOf(type + identifier.replace(/\s/g, '') + '[') !== -1
        );
    },

    /**
     * Replaces the coordinates in the line with new values
     *
     * @param line The line of text to modify
     * @param moved The new position values
     * @returns The modified line
     */
    action: (line: string, moved: Moved): string => {
        const param1 =
            typeof moved.param1 === 'number'
                ? moved.param1.toString()
                : parseFloat(moved.param1).toString();
        const param2 =
            typeof moved.param2 === 'number'
                ? moved.param2.toString()
                : parseFloat(moved.param2).toString();
        const result = line.replace(/\[([^[\]]+)\]/g, `[${param1}, ${param2}]`);
        return result;
    },
};
