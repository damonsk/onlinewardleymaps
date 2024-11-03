interface Moved {
    param1: number;
    param2: number;
}

export const ExistingCoordsMatcher = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        return (
            line
                .replace(/\s/g, '')
                .indexOf(type + identifier.replace(/\s/g, '') + '[') !== -1
        );
    },
    action: (line: string, moved: Moved): string => {
        return line.replace(
            /\[(.?|.+?)\]/g,
            `[${moved.param1}, ${moved.param2}]`,
        );
    },
};
