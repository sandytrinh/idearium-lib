# idearium-lib

This file is a history of the changes made to idearium-lib.

## 1.0.0-alpha.13

- Fix `Publisher` class.

## 1.0.0-alpha.12

- Added `Logger` instance to the common folder.
- Added new `util` to the library.
- Added new `mongodb` to the common folder.
- Added new `publisher` to the common folder.
- Added new `opbeat` to the common folder.
- Added new `session` to the common folder.
- Deprecated `utils` in favour of the new `util`. This also acts as a wrapper around the build in node `util` module.

## 1.0.0-alpha.11

- Large refactoring of the `mq.Connection` class.
- Large refactoring of the `mq.Client` class.

## 1.0.0-alpha.10

*Note:* this version is highly unstable. Don't use it :(

- **Breaking change**: `mq.Client().consume` now expects a Promise to be returned.
- `mq.Client().publish` now expects a Promise to be returned.
- The connection based code from `mq.Client` has been moved out into `mq.Connection`.
- The certificate loading code from `common/mq/client` has been moved out into `common/mq/certs`.
- Refactored `mq.Client` to make better use of Promises.
- Refactored `mq.Manager` to make better use of Promises.
- `mq.RpcServer` and `mq.RpcClient` have been created to facilitate RPC based messaging.

## 1.0.0-alpha.8

- You can now use `config.get('env')` to retrieve the value of `process.env.NODE_ENV`.
- `common/mq/client` is now `process.env.NODE_ENV` aware and will load SSL certs if they exist in the `mq-certs/{process.env.NODE_ENV}` directory.
- `common/mq/client` will now load certificate and key files separate to CA files. The loading of CA files is no longer dependent on a certificate and key file being present.
- `common/mq/client` now sets the `servername` option to better support SSL based connections.

## 1.0.0-alpha.7

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
