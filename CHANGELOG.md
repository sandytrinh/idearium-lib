# idearium-lib

This file is a history of the changes made to idearium-lib.

## Unreleased

- `common/mq/client` will now load SSL certs if they exist.

## 1.0.0-alpha.6

- Added the `Email` class and passing tests.
- Added the `emailServices` package.
- Added the `emailServices.Mandrill` class.
- Added the `Hash` class and passing tests.

## 1.0.0-alpha.5

- Improved `middleware.logRequest` and added a passing test case.

## 1.0.0-alpha.4

- Added the `common/exception`.
- Added the `middleware` package with `middlware.configSettings`, `middlware.logError` and `middlware.logRequest`.

## 1.0.0-alpha.3

- Added the `utils` package.

## 1.0.0-alpha.2

### Breaking changes

- Will no longer read environment specific configuration files such as `config.development.json` or `config.production.json`.

### Features

- Updated to a more simple `config` directory format. It will now only attempt to load one file `./config/config.js`. This file should contain defaults setup for the `development` environment. All other environment specific configuration changes should be made through ENV variables.

## 1.0.0-alpha.1

Initial commit of the library, based off `focusbooster-lib`.
