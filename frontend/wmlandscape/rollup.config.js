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
        }),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: true,
            declarationDir: './dist',
            rootDir: 'src'
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
        '@mui/material/TextareaAutosize',
        '@mui/material/Button',
        '@mui/material/Dialog',
        '@mui/material/DialogActions',
        '@mui/material/DialogContent',
        '@mui/material/DialogTitle',
        '@mui/material/InputLabel',
        '@mui/material/MenuItem',
        '@mui/material/FormControl',
        '@mui/material/Select',
        '@mui/material/styles',
        '@mui/icons-material/FullscreenExit',
        '@mui/icons-material/Fullscreen',
    ],
};
