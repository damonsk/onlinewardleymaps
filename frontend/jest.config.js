module.exports = {
    moduleNameMapper: {
        '@/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/.jest/register-context.js', '<rootDir>/src/setupTests.js'],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', {presets: ['next/babel']}],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    reporters: [['summary', {summaryThreshold: 1}]],
};
