import {ManyCoordsMoved, Replacer} from '../../../types/base';

export const ExistingManyCoordsMatcher: Replacer = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        return line.replace(/\s/g, '').indexOf(type + identifier.replace(/\s/g, '') + '[') !== -1;
    },

    action: (line: string, moved: ManyCoordsMoved): string => {
        return line.replace(/\[([^[\]]+)\]/g, `[${moved.param1}, ${moved.param2}, ${moved.param3}, ${moved.param4}]`);
    },
};
