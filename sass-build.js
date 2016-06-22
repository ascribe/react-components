#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Sass-build
 *
 * Builds sass files from given input dir into given output dir, resolving dependencies with webpack
 * if necessary.
 *
 * Usage:
 *   --in-dir (-i):         Input dir of source sass files.
 *   --out-dir (-o):        Output dir of built sass files, keeping the source folder structure.
 *   --webpack-config (-c): Location of webpack configuration.
 *                          If none specified, all assumed webpack dependencies will be resolved
 *                          through node_modules.
 *   --no-error:            Stop processing file immediately when an error occurs
 */

const path = require('path');

const chalk = require('chalk');
const fileExists = require('file-exists');
const fs = require('fs-extra');
const glob = require('glob');
const removeTrailingSlash = require('remove-trailing-slash');
const sass = require('node-sass');

const argv = require('yargs')
    .usage('Usage: $0 -i [dir] -o [dir] -c [file] --no-error')
    .default('in-dir', './modules')
    .alias('i', 'in-dir')
    .default('out-dir', './lib')
    .alias('o', 'out-dir')
    .alias('c', 'webpack-config')
    .boolean('no-error')
    .default('no-error', true)
    .argv;


const SASS_OPTIONS = {
    outputStyle: 'expanded',
    precision: 8, // Necessary for bootstrap; see https://github.com/twbs/bootstrap-sass#sass-number-precision
    sourceMap: true
};
const SCSS_GLOB = '**/*.s[ac]ss';

const IN_DIR = removeTrailingSlash(argv.i);
const OUT_DIR = argv.o;
const NO_ERROR = argv['no-error'];
const WEBPACK_CONFIG = argv.c;

const MODULE_RESOLVE_DIRS = [];
if (WEBPACK_CONFIG) {
    // eslint-disable-next-line global-require
    const { resolve: { modules, fallback } } = require(WEBPACK_CONFIG);

    if (Array.isArray(modules)) {
        MODULE_RESOLVE_DIRS.push(...modules);
    }

    if (Array.isArray(fallback)) {
        MODULE_RESOLVE_DIRS.push(...fallback);
    } else if (fallback) {
        MODULE_RESOLVE_DIRS.push(fallback);
    }
}

// Add node_modules as a module resolver by default
if (MODULE_RESOLVE_DIRS.length === 0) {
    MODULE_RESOLVE_DIRS.push('node_modules');
}


function webpackImporter(url) {
    // If using webpack to resolve SASS dependencies (through `~`), inspect the webpack config to
    // best-effort resolve it ourselves.
    // See '~' syntax: https://github.com/jtangelder/sass-loader#imports
    if (url[0] === '~') {
        const importName = url.slice(1);

        const file = MODULE_RESOLVE_DIRS.reduce((resolved, dir) => {
            const importPath = path.join(dir, importName);

            // Check any extensions resolved by sass -- scss, sass, or css
            if (!resolved &&
                (fileExists(importPath) ||
                 fileExists(`${importPath}.sass`) ||
                 fileExists(`${importPath}.scss`) ||
                 fileExists(`${importPath}.css`))) {
                return importPath;
            }

            return resolved;
        }, null);

        if (file) {
            return { file };
        } else {
            return new Error(`Could not resolve import of ${url} based on webpack config. If you ` +
                             "haven't already, you might need to specify where your webpack " +
                             'config is by using -c or --webpack-config.');
        }
    } else {
        // Otherwise, return the url as-is.
        return url;
    }
}

// Glob for all SCSS files and compile to out file
glob(`${IN_DIR}/${SCSS_GLOB}`, (error, files) => {
    if (error) {
        console.error('Exiting sass build due to error:');
        console.error(error);

        process.exit(1);
    }

    files.forEach((file) => {
        const outFile = file.replace(IN_DIR, OUT_DIR).replace(/scss$/, 'css');

        try {
            // Build Sass
            const result = sass.renderSync(Object.assign({
                file,
                outFile,
                importer: webpackImporter
            }, SASS_OPTIONS));

            if (process.env.NODE_ENV !== 'production') {
                console.log(chalk.green(`Successfully built ${file} -> ${outFile}`));
            }

            try {
                // Write to file
                fs.outputFileSync(outFile, result.css);
            } catch (fileError) {
                console.error(chalk.red(`Could not write generated file ${outFile} (from ${file}) ` +
                                        'to disk:'));
                console.error(chalk.red(fileError));

                if (NO_ERROR) {
                    console.error(chalk.red(`Exiting sass-build because ${file} failed...`));
                    process.exit(1);
                }
            }
        } catch (sassError) {
            console.error(chalk.red(`Sass error on ${file} with status ${sassError.status}:\n`));
            console.error(chalk.red(sassError.message));
            console.error(chalk.red(`On line ${sassError.line} (col ${sassError.column}) of ${file}\n`));

            if (NO_ERROR) {
                console.error(chalk.red(`Exiting sass-build because ${file} failed...`));
                process.exit(1);
            }
        }
    });
});
