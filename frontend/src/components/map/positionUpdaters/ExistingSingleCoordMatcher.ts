interface Matcher {
    matcher: (line: string, identifier: string, type: string) => boolean;
    action: (line: string, moved: { param2: string }) => string;
}
export const ExistingSingleCoordMatcher: Matcher = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        return (
            line
                .replace(/\s/g, '')
                .indexOf(type + identifier.replace(/\s/g, '')) !== -1
        );
    },
    action: (line: string, moved: { param2: string }): string => {
        return line.replace(/\s([0-9]?\.[0-9]+[0-9]?)+/g, ` ${moved.param2}`);
    },
};
