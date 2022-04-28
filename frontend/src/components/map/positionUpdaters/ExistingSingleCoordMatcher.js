export const ExistingSingleCoordMatcher = {
	matcher: (line, identifier, type) => {
		return (
			line.replace(/\s/g, '').indexOf(type + identifier.replace(/\s/g, '')) !==
			-1
		);
	},
	action: (line, moved) => {
		return line.replace(/\s([0-9]?\.[0-9]+[0-9]?)+/g, ` ${moved.param2}`);
	},
};
