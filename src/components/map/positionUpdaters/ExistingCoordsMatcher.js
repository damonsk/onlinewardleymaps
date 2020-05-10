export const ExistingCoordsMatcher = {
	matcher: (line, identifier, type) => {
		return (
			line
				.replace(/\s/g, '')
				.indexOf(type + identifier.replace(/\s/g, '') + '[') !== -1
		);
	},
	action: (line, moved) => {
		return line.replace(/\[(.?|.+?)\]/g, `[${moved.param1}, ${moved.param2}]`);
	},
};
