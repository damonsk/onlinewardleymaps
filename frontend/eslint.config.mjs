import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
    recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
    ...compat.config({
        extends: ['next/core-web-vitals'],
        rules: {
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            // Downgrade exhaustive-deps from error to warning to prevent build failures
            'react-hooks/exhaustive-deps': 'warn',
        },
    }),
    {
        ignores: [
            'node_modules/**',
            '.yarn/**',
            '.next/**',
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
