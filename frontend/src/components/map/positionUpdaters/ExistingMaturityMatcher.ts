interface MatcherResult {
    matcher: (line: string, identifier: string, type: string) => boolean;
    action: (line: string, moved: { param1: string | number }) => string;
}
export const ExistingMaturityMatcher: MatcherResult = {
    matcher: (line: string, identifier: string, type: string): boolean => {
        return (
            line
                .replace(/\s/g, '')
                .indexOf(type + identifier.replace(/\s/g, '') + '[') !== -1
        );
    },
    action: (line: string, moved: { param1: string | number }): string => {
        return line.replace(
            /\[([^[\]]+)\]/g,
            `[${parseFloat(moved.param1.toString()).toFixed(2)}]`,
        );
    },
};
