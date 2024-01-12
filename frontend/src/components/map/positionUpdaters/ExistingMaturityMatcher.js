export const ExistingMaturityMatcher = {
  matcher: (line, identifier, type) => {
    return (
      line
        .replace(/\s/g, '')
        .indexOf(type + identifier.replace(/\s/g, '') + '[') !== -1
    );
  },
  action: (line, moved) => {
    return line.replace(
      /\[(.?|.+?)\]/g,
      `[${parseFloat(moved.param1).toFixed(2)}]`,
    );
  },
};
