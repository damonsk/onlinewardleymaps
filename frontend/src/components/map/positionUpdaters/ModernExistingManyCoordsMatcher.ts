import { ManyCoordsMoved, Replacer } from '../../../types/base';

/**
 * ModernExistingManyCoordsMatcher - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This matcher handles elements with multiple coordinate values,
 * like annotation boxes and other multi-point elements
 */
export const ModernExistingManyCoordsMatcher: Replacer = {
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
     * Replaces the coordinates in the line with new values for multi-point elements
     *
     * @param line The line of text to modify
     * @param moved The new position values with param1, param2, param3, param4
     * @returns The modified line
     */
    action: (line: string, moved: ManyCoordsMoved): string => {
        return line.replace(
            /\[(.?|.+?)\]/g,
            `[${moved.param1}, ${moved.param2}, ${moved.param3}, ${moved.param4}]`,
        );
    },
};
