const presets = ['@babel/preset-env', '@babel/preset-react'];
const env = {
	test: {
		plugins: ['require-context-hook'],
	},
};
module.exports = { presets, env };
