# idearium-lib

This document covers how to publish any code updates, to the private NPM repository scoped with `@idearium`. If you want information on how to use the library, [read this](README.md).

The following is an overview of the steps required:

- Run `cd /vagrant/idearium-lib`.
- Run `gulp bump-version` to increment the build number for the module.
- Run `npm publish` to publish the new library.

## Versioning bumping

When bumping versions, you can control how the version will bump with the following.

- `gulp bump-version -t alpha` to bump an alpha version.
- `gulp bump-version -t beta` to bump a beta version.
- `gulp bump-version -t patch` to bump the patch version.
- `gulp bump-version -t minor` to bump the minor version.
- `gulp bump-version -t major` to bump the major version.
- `gulp bump-version -v v3.0.0` to bump to v3.0.0.
