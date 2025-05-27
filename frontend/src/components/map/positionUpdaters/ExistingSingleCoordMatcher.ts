import { Replacer, SingleCoordMoved } from '../../../types/base';

export const ExistingSingleCoordMatcher: Replacer = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        return (
            line
                .replace(/\s/g, '')
                .indexOf(type + identifier.replace(/\s/g, '')) !== -1
        );
    },
    action: (line: string, moved: SingleCoordMoved): string => {
        return line.replace(/\s([0-9]?\.[0-9]+[0-9]?)+/g, ` ${moved.param2}`);
    },
};
