#!/usr/bin/env bash

WP="/vagrant"

# Set WP based on $TRAVIS_BUILD_DIR.
if test ! -z "$TRAVIS_BUILD_DIR"; then
    WP="$TRAVIS_BUILD_DIR"
fi

# Make sure RabbitMQ is setup as we need it to be.
"${WP}/test/scripts/pretest.sh"

DEBUG=lib:logger:* "${WP}/idearium-lib/node_modules/.bin/istanbul" cover "${WP}/idearium-lib/node_modules/.bin/_mocha" -- -R spec
