#!/usr/bin/env bash

WP="/vagrant"

# Set WP based on $TRAVIS_BUILD_DIR.
if test ! -z "$TRAVIS_BUILD_DIR"; then
    WP="$TRAVIS_BUILD_DIR"
fi

# Set WP based on $SEMAPHORE_PROJECT_DIR.
if test ! -z "$SEMAPHORE_PROJECT_DIR"; then
    WP="$SEMAPHORE_PROJECT_DIR"
fi

# Make sure RabbitMQ is setup as we need it to be.
"${WP}/idearium-lib/test/scripts/pretest.sh"

DEBUG=lib:logger:* MQ_PORT=56722 "${WP}/idearium-lib/node_modules/.bin/_mocha"
