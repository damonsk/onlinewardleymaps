import sass from 'rollup-plugin-sass';
import pkg from './package.json';
import babel from '@rollup/plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
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
    sass({ insert: true }),
    babel({
      exclude: 'node_modules/**',
    }),
    resolve(),
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
