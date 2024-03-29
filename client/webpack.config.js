const currentTask = process.env.npm_lifecycle_event
const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const fse = require('fs-extra')

//our own plugin for copying the images folder into dist
class RunAfterCompile {
	apply(compiler){
		compiler.hooks.done.tap('Copy images', () => {
			fse.copySync('./app/assets/images', '../dist/assets/images')
			fse.copySync('./app/manifest.json', '../dist/manifest.json')
			fse.copySync('./app/sw.js', '../dist/sw.js')
			fse.copySync('./app/material-icons.woff', '../dist/material-icons.woff')
			fse.copySync('./app/material-icons.woff2', '../dist/material-icons.woff2')
		})
	}
}

const cssConfig = {
	// shared setting for processing css
	test: /\.css$/i,
	// css-loader allows to import css files into javascript like a module, 
	// it collects css from all the css files and puts them into a single javascript string
	// if you need to process scss, insert the sass-loader after css-loader so that it is processed first
	//use: ['css-loader?url=false', 'sass-loader']
	use: ['css-loader?url=false']
}

const config = {
	//here go shared settings for development and production

	//watch, process and bundle this js file which acts as an entry point for entire app
	entry: './app/assets/scripts/App.js',
	//the HtmlWebpackPlugin creates a new index.html file each time a new bundle with a different content hash is generated
	plugins: [
			new HtmlWebpackPlugin({filename: 'index.html', template: './app/template.html'}),
			// PreloadWebpackPlugin is an extension plugin for HtmlWebpackPlugin that automatically wires up asynchronous (and other types) of JavaScript chunks using <link rel='preload'>
			//this helps with lazy-loading
			new PreloadWebpackPlugin({
				rel: 'preload',
				include:['main','vendors~main']
			})
		],
	module: {
		rules: [
			cssConfig,
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						// @babel/preset-react will transpile jsx into normal js and html
						// @babel/preset-env will make sure our javascript works perfectly in older browsers
						presets: ['@babel/preset-react', '@babel/preset-env']
					}
				}
			}
		]
	}
}

// here go webpack configuration settings for development
if(currentTask == 'dev'){//this value comes from package.json
	// style-loader will take the output string generated by the css-loader
	// and add it to the DOM by injecting a <style> tag.
	// And it must come before the css-loader
	cssConfig.use.unshift('style-loader')
	config.output = {
		// for development save the resulting js file in memory
		filename: 'bundled.js',
		// in this location
		path: path.resolve(__dirname, 'app')
	}
	config.devServer = {
		// to reload the web browser automatically when we save a change
		 // to any html file anywhere within the app folder
		before(app,server){
			server._watch('./app/**/*.html')
		},
		// and serve up the app folder
		contentBase: path.join(__dirname, 'app'),
		// hot module replacement, whenever we save a change to css or js files, 
		// the code will be automatically injected into the browser's memory without a full reload
		hot: true, 
		port: 3000,
		// to view our development site on any device connected to the same lan
		// without this option it won't be possible
		host: '0.0.0.0'
	}
	config.mode = 'development'
}

// here go webpack configuration settings for production
if(currentTask == 'build'){
	//for production we need to extract css into separate files and for this we need to use MiniCssExtractPlugin 
	// instead of the style-loader which is used for development
	cssConfig.use.unshift(MiniCssExtractPlugin.loader)
	config.output = {
		// save the resulting js file in this location,
		//the file will be named differently each time there's an update in the code
		//to make the browser redownload it and not use the cached version (so called cache busting)
		filename: '[name].[chunkhash].js', 
		chunkFilename: '[name].[chunkhash].js',
		path: path.resolve(__dirname, '../dist')
	}
	config.mode = 'production'
	//split the resulting js into separate files (your own js and vendors)
	config.optimization = {
		splitChunks: {chunks: 'all'},
		minimizer: [
			//minimize the resulting css
			new CssMinimizerPlugin(),
			//because of minimizing css, we now need to explicitly minimize the resulting js
			// the TerserPlugin is used by Webpack by default to minimize js so we don't need to install it, only require it
			new TerserPlugin()
		]
	}
	config.plugins.push(
		// remove all the files inside the dist folder before generating a new build
		new CleanWebpackPlugin(), 
		// extract css from the bundled.js file into its own css file
		// vendors' css will also be saved into its own css file
		new MiniCssExtractPlugin({filename: 'styles.[chunkhash].css'}),
		// copy the images folder into the dist folder
		new RunAfterCompile()
	)
}

module.exports = config
