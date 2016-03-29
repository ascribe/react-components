react-components
================

Introduction
------------

Utility React components that can be reused across multiple apps.

Although the goal in the future will be to open source these components,
we've kept this repo private to begin the migration process, clean them up,
and remove left over dependencies from onion.

Usage Dependencies
------------------

* React >= 0.14
* React-addon-update >= 0.14 (should be same version as React)
* [Babel-polyfill](https://babeljs.io/docs/usage/polyfill/) (cause babel can't statically transform 'em all)
* CSS Modules, with [React CSS Modules](https://github.com/gajus/react-css-modules)
* [SASS](http://sass-lang.com/)
* [Bootstrap 3](http://getbootstrap.com/) -- see [.bootstraprc](./.bootstraprc)
  and [Bootstrap-loader](https://github.com/shakacode/bootstrap-loader)

Because of the dependency on CSS Modules, you should be using a module
bundler that can support CSS Modules (see [webpack](https://github.com/webpack/webpack),
[jspm](http://jspm.io/), or [cssify](https://github.com/davidguttman/cssify) +
[css-modulesify](https://github.com/css-modules/css-modulesify)) and
then configure the tools to include this library.

If you're stuck with a bundler that doesn't support CSS Modules or don't
care to set it up, you can use the bundled `dist/` files instead.

### Bootstrap

In an optimal version of this world, where everything would just
work, it'd be sweet if we could load our global CSS dependecies without
their names being mangled by CSS Modules by just declaring them in the
same CSS Modules file we composed / needed them from. However, as this
obviously isn't the case, we're left with using
[Bootstrap-loader](https://github.com/shakacode/bootstrap-loader) to
load this external CSS without CSS Modulifying it first.

SASS can be configured to load a .css stylesheet into a `:global` block
(see what we do with react-datepicker's stylesheet in form/inputs/input_date.scss),
but unfortunately this doesn't work in all the cases because of the
pesky nested `&` selector.

Usage
-----

Because this repo is private, and we don't want to pay for npm private
modules yet, we can use npm's git features to include this module in
other projects.

Simply add:

```javascript
{
    ...
    "dependencies": {
        "ascribe-react-components": "git@github.com:ascribe/react-components.git"
    }
    ...
}
```

to your `package.json`.

You should now be able to import the components as any other normal
node_module. **Note that this repo is exported as
`ascribe-react-components`**.

To import components, you can either import the entire library, for example:

```javascript
// Whole library using the bundled files (so you don't have to worry
about CSS Modules or building anything)
import { Uploader } from 'ascribe-react-components';

// Use component
...
<Uploader.ReactS3FineUploader ... />

// And include ascribe-react-components/dist/styles.css in your html
```

Or, if you're using a bundler that can handle CSS Modules, style imports, SASS,
and ES6 import syntax, you can also import particular components directly from
`ascribe-react-components/modules/...`. Using this will also enable your bundler
to treeshake if it has that capability.

```javascript
// Single component:
import ReactS3FineUploader from 'ascribe-react-components/modules/uploader/react_s3_fine_uploader';


// Whole module (each module exposes a index.js):
import Uploader from 'ascribe-react-components/modules/uploader';

// or
import { ReactS3FineUploader } from 'ascribe-react-components/modules/uploader';
```

Note that if you directly import components from `/modules/...`, you will have to
load the bootstrap dependencies yourself, as the components aren't able to import
them directly. See the component's documentation, as well as
[.bootstraprc](/.bootstraprc) for the necessary bootstrap stylesheets.

Extending Components
--------------------

TODO

Versioning
----------

We can use git branch names, commits, and tags to specify a specific
version of this repo to include as a module (see the [npm docs](https://docs.npmjs.com/files/package.json#git-urls-as-dependencies)
for more info).

```javascript
{
    ...
    "dependencies": {
        "ascribe-react-components": "git@github.com:ascribe/react-components.git#v0.0.1"
    }
    ...
}
```

Deploying
---------

Because this is a private git repo, the deployment target, ie. Heroku,
needs to have a deploy key with the correct permissions to read this
repo. A good guide for setting up private repos as modules [can be
found here](http://fiznool.com/blog/2015/05/20/an-alternative-to-npm-private-modules/).


Developing
==========

Demo server
-----------

There's a (currently ugly) demo page that allows you to test components
that's served with webpack-dev-server. To run it:

```bash
npm install
npm run start
```

Style guide
-----------

See the [ascribe/javascript](https://github.com/ascribe/javascript) styleguide.

Future ES features
------------------

This project uses a few experimental features not yet in ES2015,
transpiled by Babel:
  * [Extended-export-from](https://github.com/leebyron/ecmascript-more-export-from): Stage 1
  * [Object-rest-spread](https://github.com/sebmarkbage/ecmascript-rest-spread): Stage 2
  * [Object-values-entries](https://github.com/tc39/proposal-object-values-entries): Stage 3

CSS / SASS
----------

Every component should be styled using their own CSS Module. Variables
and mixins should be used when something can be generalized for multiple
components or be used in the future to more easily extend or customize
styles. They should be placed in the [styles](./styles/) folder.

[Sass-resources-loader](https://github.com/shakacode/sass-resources-loader)
is used to inject variables and mixins from bootstrap and our
[styles](./styles/) folder into all sass files during compile time (so
you don't have to declare imports for them, but **make sure** that any
file injected by sass-resources-loader doesn't contain real css;
otherwise, that css will be injected into every file as well).


TODO
====
* [ ] Unit tests
* [ ] Add themable extensions, maybe forking [rethemable](https://github.com/andreypopp/rethemeable)
* [ ] Upgrade FineUploader, and don't use the commonJS hack
* [ ] Phase out [bootstrap overrides](./modules/styles/_bootstrap_defaults.scss)
      as new components are built / old components from Onion are removed
