# idearium-lib

This document covers how to publish any code updates, to the private NPM repository scoped with `@idearium`. If you want information on how to use the library, [read this](README.md).

The following is an overview of the steps required. Before starting these steps make sure you have:

- Written tests for your code.
- Documented changes in the `CHANGELOG.md`, under an `Unreleased` heading.
- Create a pull request on GitHub and request verification.

Once the PR is approved (but not merged), then you're ready to go through the release process:

- [Host]    Run `cd /vagrant/idearium-lib`.
- [Host]    Run `gulp bump-version` to increment the build number for the module (see below).
- [Host]    Update the `CHANGELOG.md` `Unreleased` heading with the new version.
- [Guest]   Execute `git commit .` and `git commit -m "Version bump to <version>."` to commit the updates.
- [Guest]   Execute `git push` to push the changes to GitHub.
- [Guest]   Request your PR reviewer to merge your code.
- [Guest]   Switch to the master branch with `git checkout master`, and execute `git fetch --all` and `git pull`.
- [Guest]   Execute `git tag -a v<version> -m "Tagging v<version>."`.
- [Guest]   Execute `git push --follow-tags` to push the latest commits, and tags.

Travis CI will kick in, and if all of the tests pass, will publish a new version to NPM.

## Versioning bumping

When bumping versions, you can control how the version will bump with the following.

- `gulp bump-version -t alpha` to bump an alpha version.
- `gulp bump-version -t beta` to bump a beta version.
- `gulp bump-version -t patch` to bump the patch version.
- `gulp bump-version -t minor` to bump the minor version.
- `gulp bump-version -t major` to bump the major version.
- `gulp bump-version -v v3.0.0` to bump to v3.0.0.
