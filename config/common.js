const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const __root = path.resolve(__dirname, '../');

module.exports = {
	entry: {
		index: ['core-js/stable', './src/scripts/index.js'],
	},
	output: {
		path: path.resolve(__root, 'dist'),
		filename: 'scripts/[name].[chunkhash].js',
		chunkFilename: 'scripts/[name].[chunkhash].js',
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							['@babel/preset-env', {
								useBuiltIns: 'entry',
								corejs: 3
							}]
						],
						plugins: ['@babel/plugin-syntax-dynamic-import']
					}
				},
				exclude: /node_modules/
			},
			{
				test: /\.(glsl|frag|vert)$/,
				use: ['raw-loader', 'glslify-loader']
			},
			{
				test: /three\/examples\/js/,
				use: {
					loader: 'imports-loader',
					options: {
						type: 'commonjs',
						imports: 'single three THREE'
					}
				}
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				type: 'asset/resource'
			},
			{
				test: /\.(jpe?g|png|gif)$/i,
				type: 'asset/resource'
			}
		]
	},
	resolve: {
		alias: {
			'three-examples': path.join(__root, './node_modules/three/examples/js'),
		}
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(__root, 'static'),
					to: path.resolve(__root, 'dist')
				}
			]
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',
		}),
		new webpack.ProvidePlugin({
			'THREE': 'three'
		})
	]
};
