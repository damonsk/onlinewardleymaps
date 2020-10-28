const presets = [
	[
		'@babel/env',
		{
			useBuiltIns: 'usage',
			corejs: 3,
		},
		'react-app',
	],
];
const env = {
	test: {
		plugins: ['require-context-hook'],
	},
};
module.exports = { presets, env };
