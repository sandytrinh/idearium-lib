#!/usr/bin/env sh

# Review code coverage while running the test.
DEBUG=lib:logger:* /app/node_modules/.bin/istanbul cover /app/node_modules/.bin/_mocha -- --trace-deprecation --check-leaks
