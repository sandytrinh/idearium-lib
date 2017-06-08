#!/usr/bin/env sh

DEBUG=lib:logger:*,idearium-lib:common:exception BLUEBIRD_WARNINGS=0 "/app/node_modules/.bin/_mocha"
