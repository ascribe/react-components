const path = require('path');

const webpack = require('webpack');
const autoPrefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const PATHS = {
    dist: path.join(__dirname, 'dist'),
    modules: path.join(__dirname, 'modules'),
    nodeModules: path.join(__dirname, 'node_modules')
};

// Browsers to target when prefixing CSS.
const COMPATIBILITY = ['Chrome >= 30', 'Safari >= 6.1', 'Firefox >= 35', 'Opera >= 32', 'iOS >= 8', 'Android >= 2.3', 'ie >= 10'];

// CSS loader
const CSS_LOADER = 'css?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass?sourceMap&output=expanded&precision=8';

// React externals
const REACT_EXTERNAL = {
    root: 'React',
    commonjs: 'react',
    commonjs2: 'react',
    amd: 'react'
};

module.exports = {
    entry: [
        'bootstrap-loader',
        PATHS.modules
    ],

    output: {
        filename: 'bundle.js',
        library: 'ascribe-react-components',
        libraryTarget: 'umd',
        path: PATHS.dist
    },

    externals: {
        'react': REACT_EXTERNAL,
        'react/addons': REACT_EXTERNAL
    },

    debug: true,

    devtool: '#inline-source-map',

    resolve: {
        extensions: ['', '.js'],
        modules: [PATHS.nodeModules]
    },

    plugins: [
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin('styles.css', {
            allChunks: true
        })
    ],

    module: {
        loaders: [
            {
                test: /\.js$/,
                include: [PATHS.modules],
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['react', 'es2015-no-commonjs']
                }
            },
            {
                test: /\.s[ac]ss$/,
                include: [PATHS.modules],
                /* FIXME: this apparently doesn't work with hot reloading, as we should be directly
                 * using `style!${CSS_LOADER}` instead. If we do that though, our html file will
                 * need to include the styles.css file based on the environment, or use a dummy
                 * file during development.
                 *
                 * See: https://github.com/webpack/extract-text-webpack-plugin/issues/30
                 */
                loader: ExtractTextPlugin.extract('style', CSS_LOADER)
            }
        ]
    },

    postcss: [ autoPrefixer({ browsers: COMPATIBILITY }) ]
};

