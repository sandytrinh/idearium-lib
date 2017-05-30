# idearium-lib

This document covers how to use the library, for information on how to publish a new version of the library to NPM, [read PUBLISHING.md](https://github.com/idearium/idearium-lib/blob/master/idearium-lib/PUBLISHING.md).

idearium-lib provides [an API via classes](#api) and [some common uses of those classes](#common).

## Installation

```
npm install -S @idearium/idearium-lib
```

## Common

`idearium-lib` provides a bunch of files located at `@idearium/idearium-lib/common` which contain pre-instantiated versions of the libraries detailed below. They follow a standard pattern that all Idearium applications use and are essentially a quick start to getting up and running with common requirements of code:

- Connecting to RabbitMQ.
- Loading files from a directory.
- Loading configuration files (following Idearium's standard configuration file convention).
- Loading message files (following Idearium's standard message file convention).

### common/config

```
var config = require('@idearium/idearium-lib/common/config');
config.get('mqUrl');
```

`common/config` will load configuration files in the `config` directory located at the root of the Node.js application.

Files in the `config` directory can be used to provide information specific to environment (for example, a URL to connect to RabbitMQ or Redis).

Directory structure should be:

```
|- config
   |- config.json
   |- config.development.js
   |- config.production.js
```

`config.json` will always be loaded and must exist. This will contain the default properties for all environments.

Then create a file for each environment that matches `process.env.NODE_ENV`. For example `config.development.js` when `process.env.NODE_ENV === 'development'`. The JavaScript can do anything it requires but should export an `Object` of properties that may or may not overwrite values in `config.json`.

### common/mq/client

`common/mq/client` will create a connection to RabbitMQ assuming a configuration property `mqUrl` exists providing the URL in which to connect to RabbitMQ.

```
var mqClient = require('@idearium/idearium-lib/common/mq/client');
```

`common/mq/client` instantiates a class `Client` which extends `mq.Client`. You can close the connection to RabbitMQ with `require('@idearium/idearium-lib/common/mq/client').disconnect();`. You should configure this to occur when you Node.js application quits:

```
process.on('SIGTERM', function () {
    require('@idearium/idearium-lib/common/mq/client').disconnect();
});
```

#### SSL certs

If you need to connect to RabbitMQ with some SSL certs, create the following directory structure:

```
|- mq-certs
   |- {process.env.NODE_ENV}
      |- ca
           |- first.ca.cert
           |- second.ca.cert
      |- domain.cert
      |- domain.key
```

The `mq-certs` folder should live alongside you Node.js entry point (i.e. `server.js` and alongside the `messages` and `config` directories).

`common/mq/client` will look for a certificate and private key. If the paths `mq-certs/{process.env.NODE_ENV}/*.cert` and `mq-certs/{process.env.NODE_ENV}/*.key` exist, those files will be loaded and passed to RabbitMQ when connecting.

There should only be one primary certificate and private key. The certificate filename must end in `.cert` but the actual name doesn't matter. The private key filename must end in `.key` by the actual name doesn't matter.

`common/mq/client` will also look for certificate authority certificates and will attempt to load them all. If the path `mq-certs/{process.env.NODE_ENV}/ca` exists, all files within that directory will be loaded and passed to RabbitMQ when connecting.

The filenames of the certificate authority certificates don't matter.

### common/mq/messages

`common/mq/messages` will load files in the `messages` directory located at the root of the Node.js application. Files in the `messages` directory can be used to register RabbitMQ publish and consumer processes.

```
var mqMessages = require('@idearium/idearium-lib/common/mq/messages');
```

The name of the file will be the name of the message to use, when publishing a new message:

```
|- messages
   |- bounce-email.js
   |- unsubscribe-email.js
   |- spam-email.js
```

Within each file, you can export (`modules.export`) either a `publish` and/or `consume` function.

- `publish` function is used to publish a message to RabbitMQ.
- `consume` function is used to consume a message from RabbitMQ.

In each of the functions, you are required to utilise the supplied `channel` to create your exchange and queue for publishing or consuming messages. Refer to the [example](./examples/bounce-email.js).

To publish a message to RabbitMQ:

```
require('@idearium/idearium-lib/common/mq/messages').publish(messageName, data);
```

Will publish a message to RabbitMQ.

### common/mq/rpc-server

`common/mq/rpc-server` will create a connection to RabbitMQ assuming a configuration property `mqUrl` exists providing the URL in which to connect to RabbitMQ.

```
const RpcServer = require('@idearium/idearium-lib/common/mq/rpc-server');
const rpcServer = new RpcServer('rpc_name', () => {});
```

`common/mq/rpc-server` returns a class `RpcServer` which extends `mq.RpcServer`. You must provided it the name of the RPC, and callback function will be executed with a message to process.

The callback function with be passed `done`, which should be called with the results as the first argument to be returned to the RPC consumer.

### common/mq/rpc-client

`common/mq/rpc-client` will create a connection to RabbitMQ assuming a configuration property `mqUrl` exists providing the URL in which to connect to RabbitMQ.

You can set a configuration property of `mqRpcClientTimeout` to customise the timeout value from the default of 5000 to whatever you like.

```
const rpcClient = require('@idearium/idearium-lib/common/mq/rpc-client');
```

`common/mq/rpc-client` returns an instance of `mq.rpcClient`. With the instance you can call `mq.rpcClient.publish` with the name of the RPC you want to call as the first argument and the data you want to send to the RPC as the second argument.

A promise will be returned which will be resolved with the result of the RPC.

# API

```
let ideariumLib = require('@idearium/idearium-lib');
```

This provides access to:

```
ideariumLib.Config;
ideariumLib.Loader;
ideariumLib.mq.Client;
ideariumLib.mq.Manager;
ideariumLib.mq.RpcServer;
ideariumLib.mq.RpcClient;
```

## ideariumLib.Config(dir)

A class used to load in a configuration file, from a particular directory.

`ideariumLib.Config` will load a `config.js` file from a provided directory.

#### Example

```JavaScript
let config = new ideariumLib.Config(path.resolve(__dirname, '..', 'config'));
config.get('mqUrl');
```

#### Parameters

##### dir*

An absolute path to a directory containing (`.js` and `.json`) configuration files.

### config.get(config)

Used to retrieve the value of a particular configuration.

#### Parameters

##### config*

A string representing a property of the configuration object loaded from the config file.

### config.set(config, value)

Used to set the value of a configuration.

#### Parameters

##### config*

A string representing the name of the configuration.

##### value*

A value for the configuration.

---

## mq.Client(url)

A class used to create a connection to RabbitMQ, with methods to help publish and consume messages.

`ideariumLib.mq.Client` will connect to a running instance of RabbitMQ.

```
let mqClient = new ideariumLib.mq.Client('amqp://localhost:5672');
```

##### Parameters

###### connectionString*

A URL pointing to a running instance of RabbitMQ.

###### options = {}

An object that will be passed to RabbitMQ while connecting.

###### publishConcurrency = 3

An number that determines the number of messages that will be published concurrently.

###### queueTimeout = 5000ms

The amount of time that should pass before re-queueing publish and consumer tasks.

###### reconnectTimeout = 5000ms

The amount of time that should pass before attempting to reconnect to the RabbitMQ server.

### Client.consume(fn)

Used to register a consumer with RabbitMQ.

##### Parameters

###### fn*

A function that will be called, with a new `channel` in which to setup the exchange, queue and consuming function.

_**Please note**_: `fn` must `return` a promise.

### Client.publish(fn)

Used to register a consumer with RabbitMQ.

##### Parameters

###### fn*

A function that will be called, with a new `channel` in which to setup an exchange to publish a message to.

_**Please note**_: `fn` must `return` a promise.

---

## mq.RpcServer(connectionString, name, callback, options = {}, reconnectTimeout = 5000)

A class used to create a connection to RabbitMQ and setup and RPC server ready to process incoming messages based on `options.name`.

```
let mqRpcServer = new ideariumLib.mq.RpcServer('amqp://localhost:5672', 'rpc_process_queue', () => {}));
```

##### Parameters

###### connectionString*

A URL pointing to a running instance of RabbitMQ.

###### name*

An object that will be passed to RabbitMQ while connecting. You should also use it to pass the name of the RPC server queue.

###### callback*

An callback function that will be executed when there is a message to process. The callback will be given a `done` function as the first argument which should be called by the process function with a result to return to the RPC client.

###### options = {}

An object that will be passed to RabbitMQ while connecting.

###### reconnectTimeout = 5000ms

The amount of time that should pass before attempting to reconnect to the RabbitMQ server.

---

## mq.RpcClient(connectionString, options = {}, rpcTimeout = 5000, reconnectTimeout = 5000)

A class used to create a connection to RabbitMQ and setup an RPC client, ready to call RPCs. You should use this class to create a singleton for your application.

```
let rpcClient = new ideariumLib.mq.RpcClient('amqp://localhost:5672');
```

##### Parameters

###### connectionString*

A URL pointing to a running instance of RabbitMQ.

###### options = {}

An object that will be passed to RabbitMQ while connecting.

###### rpcTimeout = 5000ms

The default timeout for all RPC calls.

###### reconnectTimeout = 5000ms

The amount of time that should pass before attempting to reconnect to the RabbitMQ server.

### rpcClient.publish(name, data, timeout = this.rpcTimeout)

Used to call an RPC via RabbitMQ, with some data to process and return a response.

##### Parameters

###### name*

The name of the RPC to call with the data.

###### data*

The data to send to the RPC to process.

###### timeout = this.rpcTimeout

The timeout specific to this RPC call. Allows customisation of the timeout from the global value.

---

### ideariumLib.Loader

`ideariumLib.Loader` will load all `.js` files from a provided directory.

```
let loader = new ideariumLib.Loader();
```

#### ideariumLib.Loader.camelCase

Defaults to `true`. Will load a file named `log-exception.js` as `logException`.

#### ideariumLib.Loader.classCase

Defaults to `false`. Will load a file named `log-exception.js` as `LogException`.

#### ideariumLib.Loader.load(dir)

Will load all files in the directory and return an Object, keyed by the file name (after manipulation). Automatically ignores any file named `index.js`.

```
let loader = new ideariumLib.Loader();

loader.classCase = true;

let classes loader.load('path/to/classes');
```

## Tests

To run tests `npm test`. The first time might take a little while as it will download a Docker image to run RabbitMQ.
