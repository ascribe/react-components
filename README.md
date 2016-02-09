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
        "react-components": "git@github.com:ascribe/react-components.git"
    }
    ...
}
```

to your `package.json`.

When deploying, ie. to Heroku, make sure that the target's deploy keys
have the correct permissions to read this repo. A good guide for setting
up private repos as modules [can be found here](http://fiznool.com/blog/2015/05/20/an-alternative-to-npm-private-modules/).

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
