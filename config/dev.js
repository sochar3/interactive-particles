const { merge } = require('webpack-merge');
const common = require('./common.js');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		static: './dist',
		host: '0.0.0.0',
		port: 8080,
		open: true,
		hot: true
	}
});
