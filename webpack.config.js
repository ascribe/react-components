'use strict';

const path = require('path');

const webpack = require('webpack');
const autoPrefixer = require('autoprefixer');
const combineLoaders = require('webpack-combine-loaders');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const PRODUCTION = process.env.NODE_ENV === 'production';
const EXTRACT = process.env.NODE_ENV === 'extract';

const PATHS = {
    build: path.resolve(__dirname, 'build'),
    dist: path.resolve(__dirname, 'dist'),
    modules: path.resolve(__dirname, 'modules'),
    nodeModules: path.resolve(__dirname, 'node_modules')
};

// Browsers to target when prefixing CSS.
const COMPATIBILITY = ['Chrome >= 30', 'Safari >= 6.1', 'Firefox >= 35', 'Opera >= 32', 'iOS >= 8', 'Android >= 2.3', 'ie >= 10'];

// External libraries
// Catch all react lib related imports
const externals = [
    /^react(-dom|-addons.*)?$/
];

// Plugins
const plugins = [
    new webpack.DefinePlugin({
        'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development') }
    }),
    new webpack.NoErrorsPlugin(),
];

const extractPlugins = [
    new ExtractTextPlugin(PRODUCTION ? 'styles.min.css' : 'styles.css', {
        allChunks: true
    }),
];

const prodPlugins = [
    ...extractPlugins,
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        output: {
            comments: false
        }
    }),
    new webpack.LoaderOptionsPlugin({
        debug: false,
        minimize: true
    })
];

if (PRODUCTION) {
    plugins.push(...prodPlugins);
}

if (EXTRACT) {
    plugins.push(...extractPlugins);
}

// Modules
// CSS loader
const CSS_LOADER = combineLoaders([
    {
        loader: 'css',
        query: {
            modules: true,
            importLoaders: 2,
            localIdentName: '[path]__[name]__[local]_[hash:base64:5]',
            sourceMap: true
        }
    },
    {
        loader: 'postcss'
    },
    {
        loader: 'sass',
        query: {
            precision: '8', // See https://github.com/twbs/bootstrap-sass#sass-number-precision
            outputStyle: 'expanded',
            sourceMap: true
        }
    }
]);


const config = {
    entry: [
        PRODUCTION || EXTRACT ? 'bootstrap-loader/extractStyles' : 'bootstrap-loader',
        PATHS.modules
    ],

    output: {
        filename: PRODUCTION ? 'bundle.min.js' : 'bundle.js',
        library: 'ascribe-react-components',
        libraryTarget: 'umd',
        path: PRODUCTION ? PATHS.dist : PATHS.build,
        publicPath: PRODUCTION ? null :'/assets/'
    },

    externals: PRODUCTION ? externals : null,

    debug: !PRODUCTION,

    devtool: PRODUCTION ? '#source-map' : '#inline-source-map',

    resolve: {
        extensions: ['', '.js'],
        modules: ['node_modules'] // Don't use absolute path here to allow recursive matching
    },

    plugins: plugins,

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: [PATHS.nodeModules],
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['react', 'es2015-no-commonjs']
                }
            },
            {
                test: /\.s[ac]ss$/,
                exclude: [PATHS.nodeModules],
                loader: PRODUCTION || EXTRACT ? ExtractTextPlugin.extract('style', CSS_LOADER)
                                              : `style!${CSS_LOADER}`
            }
        ]
    },

    postcss: [autoPrefixer({ browsers: COMPATIBILITY })]
};

module.exports = config;
