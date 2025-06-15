import {ManyCoordsMoved, Replacer} from '../../../types/base';

export const NotDefinedManyCoordsMatcher: Replacer = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        return line.replace(/\s/g, '') === type + identifier.replace(/\s/g, '');
    },
    action: (line: string, moved: ManyCoordsMoved): string => {
        return `${line.trim()} [${moved.param1}, ${moved.param2}, ${moved.param3}, ${moved.param4}]`;
    },
};
