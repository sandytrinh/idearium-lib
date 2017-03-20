#!/usr/bin/env bash

WP="."

if test ! -z "$TRAVIS_BUILD_DIR"; then
    WP="$TRAVIS_BUILD_DIR"
fi

# Make sure RabbitMQ is setup as we need it to be.
"${WP}/test/scripts/pretest.sh"

# Review code coverage while running the test.
DEBUG=lib:logger:* "${WP}/node_modules/.bin/istanbul" cover "${WP}/node_modules/.bin/_mocha" -- --trace-deprecation --check-leaks
