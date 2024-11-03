import { Replacer } from './LineNumberPositionUpdater';

interface ManyCoordsMoved {
    param1: number;
    param2: number;
    param3: number;
    param4: number;
}

export const ExistingManyCoordsMatcher: Replacer = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        return (
            line
                .replace(/\s/g, '')
                .indexOf(type + identifier.replace(/\s/g, '') + '[') !== -1
        );
    },

    action: (line: string, moved: ManyCoordsMoved): string => {
        return line.replace(
            /\[(.?|.+?)\]/g,
            `[${moved.param1}, ${moved.param2}, ${moved.param3}, ${moved.param4}]`,
        );
    },
};
