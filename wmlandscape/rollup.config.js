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
		'bootstrap',
		'core-js',
		'lodash.merge',
		'prop-types',
		'react-bootstrap',
		'react-icons',
	],
};
