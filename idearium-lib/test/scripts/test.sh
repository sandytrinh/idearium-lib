#!/usr/bin/env sh

DEBUG=lib:logger:* BLUEBIRD_WARNINGS=0 "/app/node_modules/.bin/_mocha"
