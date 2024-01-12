export const NotDefinedMaturityMatcher = {
  matcher: (line, identifier, type) => {
    return line.replace(/\s/g, '') === type + identifier.replace(/\s/g, '');
  },
  action: (line, moved) => {
    return `${line.trim()} [${parseFloat(moved.param1).toFixed(2)}]`;
  },
};
