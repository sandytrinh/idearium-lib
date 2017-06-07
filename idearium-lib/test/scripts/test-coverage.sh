#!/usr/bin/env sh

# Review code coverage while running the test.
DEBUG=lib:logger:*,idearium-lib:common:exception "/app/node_modules/.bin/istanbul" cover "/app/node_modules/.bin/_mocha" -- --trace-deprecation --check-leaks
