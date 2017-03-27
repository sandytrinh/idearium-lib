#!/usr/bin/env bash

# Support `lib-test coverage`.
if [ "$1" = "coverage" ]; then
    dc run -w "/app" lib npm run test-coverage
    exit $?
fi

# Support `lib-test {anything}` and proxy it to NPM.
if [ ! -z "$@" ]; then
    dc run -w "/app" lib npm "$@"
    exit $?
fi

# Support lib-test to run the tests.
dc run lib
