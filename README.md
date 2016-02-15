react-components
================

Introduction
------------

Utility react components that can be reused across multiple apps.

For now, the dependencies are mainly based on ascribe/onion, since onion
is the main consumer of these components right now.

Although the goal in the future will be to open source these components,
we've kept this repo private to begin the migration process, clean them up,
and remove left over dependencies from onion.

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

When deploying, ie. to Heroku, make sure that the target's deploy keys
have the correct permissions to read this repo. A good guide for setting
up private repos as modules [can be found here](http://fiznool.com/blog/2015/05/20/an-alternative-to-npm-private-modules/).

To import components, you can either import the entire library, for example:

```javascript
import { Uploader } from 'ascribe-react-components';
```

Or, if you're not yet treeshaking and only want a particular component
or module, you can also import directly from `ascribe-react-components/lib/...`:

```javascript
// Single component:
import { ReactS3FineUploader } from 'ascribe-react-components/lib/uploader/react_s3_fine_uploader';

// Whole module (each module exposes a index.js):
import * as Uploader from 'ascribe-react-components/lib/uploader/index';
```

**Note**: If you do import only particular components or modules, make
sure to include the babel runtime polyfill to your app.

```javascript
// At the top of your app
import 'babel-runtime';
```

Versioning
----------

We can use git branch names, commits, and tags to specify a specific
version of this repo to include as a module (see the [npm docs](https://docs.npmjs.com/files/package.json#git-urls-as-dependencies)
for more info).

```javascript
{
    ...
    "dependencies": {
        "react-components": "git@github.com:ascribe/react-components.git#v0.0.1"
    }
    ...
}
```

Style guide
-----------

See the [ascribe/javascript](https://github.com/ascribe/javascript) styleguide.

Future ES features
------------------

This project uses a few experimental features not yet in ES2015:
  * [Extended-export-from](https://github.com/leebyron/ecmascript-more-export-from): Stage 1
  * [Object-rest-spread](https://github.com/sebmarkbage/ecmascript-rest-spread): Stage 2
