#!/usr/bin/env bash

WP="/vagrant"

if test ! -z "$TRAVIS_BUILD_DIR"; then
    WP="$TRAVIS_BUILD_DIR"
fi

# Make sure RabbitMQ is setup as we need it to be.
"${WP}/idearium-lib/test/scripts/pretest.sh"

# Review code coverage while running the test.
DEBUG=lib:logger:* "${WP}/idearium-lib/node_modules/.bin/istanbul" cover "${WP}/idearium-lib/node_modules/.bin/_mocha" -- --trace-deprecation --check-leaks
