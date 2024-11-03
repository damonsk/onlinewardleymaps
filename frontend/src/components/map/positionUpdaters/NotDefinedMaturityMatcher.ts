interface MatcherResult {
  matcher: (line: string, identifier: string, type: string) => boolean;
  action: (line: string, moved: { param1: string | number }) => string;
}
export const NotDefinedMaturityMatcher: MatcherResult = {
  matcher: (line: string, identifier: string, type: string): boolean => {
    return line.replace(/\s/g, '') === type + identifier.replace(/\s/g, '');
  },
  action: (line: string, moved: { param1: string | number }): string => {
    return `${line.trim()} [${parseFloat(moved.param1.toString()).toFixed(2)}]`;
  },
};
