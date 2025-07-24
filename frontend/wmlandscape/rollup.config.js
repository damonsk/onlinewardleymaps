const pkg = require('./package.json');
const babel = require('@rollup/plugin-babel').default;
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve').default;
const typescript = require('@rollup/plugin-typescript');

module.exports = {
    input: 'src/index.js',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
            strict: false,
        },
    ],
    plugins: [
        resolve({
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            mainFields: ['browser', 'module', 'main'],
            preferBuiltins: false,
        }),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: true,
            declarationDir: './dist',
            rootDir: 'src',
            include: ['src/**/*', 'global.d.ts'],
            compilerOptions: {
                skipLibCheck: true,
                emitDeclarationOnly: false,
            },
        }),
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'bundled',
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            presets: ['@babel/preset-env', '@babel/preset-react', ['@babel/preset-typescript', {allowNamespaces: true}]],
        }),
        commonjs(),
    ],
    external: [
        'react',
        'react-dom',
        'core-js',
        'lodash.merge',
        'prop-types',
        '@mui/icons-material',
        '@mui/material',
        '@mui/styles',
        '@mui/system',
        '@mui/utils',
        '@emotion/react',
        '@emotion/styled',
        '@emotion/cache',
        'i18next',
        'react-i18next',
        'react-svg-pan-zoom',
        'next',
        'next/router',
        'next/head',
        /@mui\/.*/,
        /@emotion\/.*/,
        /next\/.*/,
        // Exclude all relative imports that might be problematic
        id => {
            // Don't bundle Next.js internals or relative imports from Next.js
            if (id.includes('next/dist/') || id.includes('./utils/') || id.includes('../')) {
                return true;
            }
            return false;
        },
    ],
};
