export const NotDefinedCoordsMatcher = {
	matcher: (line, identifier, type) => {
		return line.replace(/\s/g, '') === type + identifier.replace(/\s/g, '');
	},
	action: (line, moved) => {
		return `${line.trim()} [${moved.param1}, ${moved.param2}]`;
	},
};
