const htmlWebpackPlugin = require('html-webpack-plugin');
const miniCssExtractPlugin = require('mini-css-extract-plugin');
const optimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
const { spawn } = require('child_process');
const path = require('path');

const PAGE_TITLE = 'Offline Wardley Maps';
const HTML_LOCATION = 'src/app/index.html';

function getRules(isProduction) {
	let rules = [
		{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			use: 'babel-loader',
		},
		{
			test: /\.s?css$/,
			use: [
				isProduction ? miniCssExtractPlugin.loader : 'style-loader',
				'css-loader',
				'sass-loader',
			],
		},
	];

	return rules;
}

function getPlugins(isProduction) {
	let htmlWebpackPluginOptions = {
		title: PAGE_TITLE,
		template: HTML_LOCATION,
	};

	let copyWebpackPluginOptions = {
		from: 'src/mode-owm.js',
		to: 'mode-owm.js',
	};

	if (isProduction) {
		htmlWebpackPluginOptions.minify = {
			collapseWhitespace: true,
			removeComments: true,
			removeRedundantAttributes: true,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true,
			useShortDoctype: true,
		};
	}

	let plugins = [
		new htmlWebpackPlugin(htmlWebpackPluginOptions),
		new copyWebpackPlugin([copyWebpackPluginOptions]),
	];

	if (isProduction) {
		let miniCssExtractPluginOptions = {
			filename: '[name].css',
			chunkFilename: '[id].css',
		};

		let optimizeCSSAssetsPluginOptions = {
			cssProcessor: require('cssnano'),
			cssProcessorPluginOptions: {
				preset: ['default', { discardComments: { removeAll: true } }],
			},
			canPrint: true,
		};

		plugins.push(
			new miniCssExtractPlugin(miniCssExtractPluginOptions),
			new optimizeCSSAssetsPlugin(optimizeCSSAssetsPluginOptions)
		);
	}

	if (!isProduction) {
		plugins.push(new HotModuleReplacementPlugin());
	}

	return plugins;
}

function webpackBuilder({ isProduction }) {
	const isProductionBuild = isProduction === 'true' ? true : false;
	const plugins = getPlugins(isProductionBuild);
	const rules = getRules(isProductionBuild);
	const devtool = isProductionBuild ? '' : 'source-map';
	const watch = !isProductionBuild;
	const mode = isProduction ? 'production' : 'development';

	process.env.NODE_ENV = mode;
	process.env.BABEL_ENV = mode;

	let r = {
		entry: './src/app/index.js',
		mode,
		devtool,
		watch,
		plugins,
		target: 'electron-renderer',
		module: {
			rules,
		},
	};

	if (isProductionBuild == false) {
		r.devServer = {
			contentBase: path.resolve(__dirname, 'dist'),
			stats: {
				colors: true,
				chunks: false,
				children: false,
			},
			before() {
				spawn('electron', ['.'], {
					shell: true,
					env: process.env,
					stdio: 'inherit',
				})
					.on('close', () => process.exit(0))
					.on('error', spawnError => console.error(spawnError));
			},
		};
	}

	return r;
}

module.exports = webpackBuilder;
