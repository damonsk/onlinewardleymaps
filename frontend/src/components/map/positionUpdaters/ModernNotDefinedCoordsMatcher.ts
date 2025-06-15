import {Moved, Replacer} from '../../../types/base';

export const ModernNotDefinedCoordsMatcher: Replacer = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        return line.replace(/\s/g, '') === type + identifier.replace(/\s/g, '');
    },
    action: (line: string, moved: Moved): string => {
        return `${line.trim()} [${moved.param1}, ${moved.param2}]`;
    },
};
