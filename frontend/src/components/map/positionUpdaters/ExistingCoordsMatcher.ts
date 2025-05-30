import { Moved, Replacer } from '../../../types/base';

export const ExistingCoordsMatcher: Replacer = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        return (
            line
                .replace(/\s/g, '')
                .indexOf(type + identifier.replace(/\s/g, '') + '[') !== -1
        );
    },
    action: (line: string, moved: Moved): string => {
        const param1 =
            typeof moved.param1 === 'number'
                ? moved.param1.toString()
                : parseFloat(moved.param1).toString();
        const param2 =
            typeof moved.param2 === 'number'
                ? moved.param2.toString()
                : parseFloat(moved.param2).toString();
        const result = line.replace(/\[(.?|.+?)\]/g, `[${param1}, ${param2}]`);
        return result;
    },
};
