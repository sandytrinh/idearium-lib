#!/usr/bin/env sh

cd /app

# Review code coverage while running the test.
DEBUG=lib:logger:* ./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha --report lcovonly -- --trace-deprecation --check-leaks -R spec && ./node_modules/.bin/codecov
