module.exports = {
    moduleNameMapper: {
        '@/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/.jest/register-context.js'],
};
