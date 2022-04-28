module.exports = {
	moduleNameMapper: {
		'@/(.*)$': '<rootDir>/src/$1',
	},
	setupTestFrameworkScriptFile: './src/setupTests.js',
	setupFiles: ['<rootDir>/.jest/register-context.js'],
};
