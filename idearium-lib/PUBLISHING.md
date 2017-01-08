# idearium-lib

This document covers how to publish any code updates, to the private NPM repository scoped with `@idearium`. If you want information on how to use the library, [read this](README.md).

The following is an overview of the steps required:

- [Host]    Run `cd /vagrant/idearium-lib`.
- [Host]    Run `gulp bump-version` to increment the build number for the module (see below).
- [Host]    Update the `CHANGELOG.md` file with your changes.
- [Guest]   Execute `git commit .` and `git commit -m "Version bump to <version>."` to commit the updates.
- [Guest]   Execute `git tag -a v<version> -m "Tagging v<version>."`.
- [Guest]   Execute `git push --follow-tags` to push the latest commits, and tags.
- [Host]    Run `npm publish` to publish the new library version to NPM.

## Versioning bumping

When bumping versions, you can control how the version will bump with the following.

- `gulp bump-version -t alpha` to bump an alpha version.
- `gulp bump-version -t beta` to bump a beta version.
- `gulp bump-version -t patch` to bump the patch version.
- `gulp bump-version -t minor` to bump the minor version.
- `gulp bump-version -t major` to bump the major version.
- `gulp bump-version -v v3.0.0` to bump to v3.0.0.
