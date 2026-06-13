import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
    ...nextCoreWebVitals,
    {
        rules: {
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            // Downgrade exhaustive-deps from error to warning to prevent build failures
            'react-hooks/exhaustive-deps': 'warn',
            // React Compiler-oriented rules introduced by newer Next/React Hooks configs.
            // Keep current lint behavior until these can be addressed as focused code changes.
            'react-hooks/globals': 'off',
            'react-hooks/immutability': 'off',
            'react-hooks/preserve-manual-memoization': 'off',
            'react-hooks/purity': 'off',
            'react-hooks/refs': 'off',
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/static-components': 'off',
        },
    },
    {
        ignores: [
            'node_modules/**',
            '.yarn/**',
            '.next/**',
            'frontend/.next/**',
            'build/**',
            'dist/**',
            'wmlandscape/**',
            'models/**',
            'src/ui-components/**',
            '*.config.js',
            '**/*.config.js',
            'next-i18next.config.js',
            'test-i18n.js',
            'scripts/*.js',
            'sonar-project.js',
            'coverage/**',
            '.jest/**',
        ],
    },
];

export default eslintConfig;
