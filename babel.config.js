const presets = [
	[
		'@babel/env',
		{
			//     targets: {
			//       edge: '17',
			//       firefox: '60',
			//       chrome: '67',
			//       safari: '11.1',
			//     },
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
