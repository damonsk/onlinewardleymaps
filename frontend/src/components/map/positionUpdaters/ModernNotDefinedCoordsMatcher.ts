import {Moved, Replacer} from '../../../types/base';

/**
 * ModernNotDefinedCoordsMatcher - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This matcher handles the case when coordinates are not defined in the component declaration
 */
export const ModernNotDefinedCoordsMatcher: Replacer = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        return line.replace(/\s/g, '') === type + identifier.replace(/\s/g, '');
    },
    action: (line: string, moved: Moved): string => {
        return `${line.trim()} [${moved.param1}, ${moved.param2}]`;
    },
};
