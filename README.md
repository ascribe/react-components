react-components
================

Introduction
------------

Utility React components that can be reused across multiple apps.

Although the goal in the future will be to open source these components,
we've kept this repo private to begin the migration process, clean them up,
and remove left over dependencies from onion.

Installation
------------

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

Usage
-----

To start using these components, you can either import the entire built
library, including CSS, or pick and choose the modules you'd like to
use and build them yourself.

Although importing the entire library is easier to start with, it comes
with several disadvantages:

* The entire library will be included, regardless of how much you use
* It becomes impossible to compose classes from any of the components'
  CSS modules, making it much harder to extend those components
  style-wise

### Import entire library

To import the entire library, simply `import` or `require`
`ascribe-react-components`, and include
`ascribe-react-components/dist/styles.css` in your stylesheets or html.

##### Dependencies

* React >= 0.14
* React-addon-update >= 0.14 (should be same version as React)

##### Example

Components:

```javascript
import { Uploader } from 'ascribe-react-components';

// Use component
<Uploader.ReactS3FineUploader ... />
```

Styles:

```sass
// In your main stylesheet
@import 'node_modules/ascribe-react-components/dist/styles.css
```

### Import specific components

To import specific components, you can `import` or `require` from
`ascribe-react-components/modules/...`.

Note that if you do this, you will have to build these components
through babel (see our [babelrc](./.babelrc) for necessary presets and
plugins) and CSS Modules + SASS. This means that you'll need a module
bundler that can handle CSS Modules, SASS, style imports, and ES6 import
syntax (see [webpack](https://github.com/webpack/webpack),
[jspm](http://jspm.io/), or [cssify](https://github.com/davidguttman/cssify) +
[css-modulesify](https://github.com/css-modules/css-modulesify)).

Importing the components this way will also enable your bundler to
treeshake this library if it has that capability.

##### Dependencies

* React >= 0.14
* React-addon-update >= 0.14 (should be same version as React)
* [Babel](http://babeljs.io/) >= 6.5 (see [babelrc](./.babelrc))
* [CSS Modules](https://github.com/css-modules/css-modules)
* [SASS](http://sass-lang.com/)
* [Bootstrap 3](http://getbootstrap.com/) -- see [.bootstraprc](./.bootstraprc)
  and [Bootstrap-loader](https://github.com/shakacode/bootstrap-loader)

**Note**: You will have to load the bootstrap dependencies yourself, as
the components aren't able to import them directly. See the component's
documentation, as well as [.bootstraprc](/.bootstraprc) for the necessary
bootstrap stylesheets.

**NOTE**: You will have to make sure that `process.env.NODE_ENV` is
injected into your global environment, specifying if your environment is
for development (`NODE_ENV = development`) or production (`NODE_ENV =
production`).

##### Example

Components (with their styles):

```javascript
// Single component:
import ReactS3FineUploader from 'ascribe-react-components/modules/uploader/react_s3_fine_uploader';

// Use component
<ReactS3FineUploader ... />


// Whole module (each module exposes a index.js):
import Uploader from 'ascribe-react-components/modules/uploader';

// Use component
<Uploader.ReactS3FineUploader ... />

// or
import { ReactS3FineUploader } from 'ascribe-react-components/modules/uploader';

// Use component
<ReactS3FineUploader ... />
```

**Note** that if you directly import components from `/modules/...`, you will
have to load the bootstrap dependencies yourself, as the components aren't able
to import them directly. See the component's documentation, as well as
[.bootstraprc](/.bootstraprc) for the necessary bootstrap stylesheets.

Extending Components
--------------------

TODO

Deploying
---------

Because this is a private git repo, the deployment target, ie. Heroku,
needs to have a deploy key with the correct permissions to read this
repo. A good guide for setting up private repos as modules [can be
found here](http://fiznool.com/blog/2015/05/20/an-alternative-to-npm-private-modules/).


Developing
==========

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
  * [Array-prototype-inclues](https://github.com/tc39/Array.prototype.includes): Stage 4

CSS / SASS
----------

Every component should be styled using their own
[CSS module](https://github.com/css-modules/css-modules) in a
`[component_name].scss` file that's located in the same folder as the component.
Variables and mixins should be used when something can be generalized for
multiple components or be used in the future to more easily extend or
customize styles. Pure SASS script files (ie. variables and mixins) should be
placed in the [styles](./styles/) folder.

We use [React CSS Modules](https://github.com/gajus/react-css-modules)
to make it easier to apply styles from a component's CSS module.

### Bootstrap

In the future, it'd be nice if it were possible for a CSS Modules file to import
its global CSS dependencies without first mangling the class names; that way,
global style dependencies could be resolved from a single entry point similar to
what we do in JS module bundling. However, as this isn't possible yet, we're
left with using [Bootstrap-loader](https://github.com/shakacode/bootstrap-loader)
to load this external CSS without CSS Modulifying it first.

Although SASS can be configured to load a .css stylesheet into a `:global` block
(see what we do with react-datepicker's stylesheet in
[InputDate](./modules/form/inputs/input_date.scss), unfortunately this doesn't
work in all the cases because of the pesky nested `&` selector (see
bootstrap's buttons).


TODO
====
* [ ] Unit tests
* [ ] Create builds that seperate each of the modules into their own
      chunk so users can just import the modules they want to use.
* [ ] Add themable extensions, maybe forking [rethemable](https://github.com/andreypopp/rethemeable)
* [ ] Upgrade FineUploader, and don't use the commonJS hack
* [ ] Phase out [bootstrap overrides](./modules/styles/_bootstrap_defaults.scss)
      as new components are built / old components from Onion are removed
