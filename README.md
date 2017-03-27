# idearium-lib

[![Build Status](https://travis-ci.org/idearium/idearium-lib.svg?branch=master)](https://travis-ci.org/idearium/idearium-lib)
[![codecov.io](https://codecov.io/github/idearium/idearium-lib/coverage.svg?branch=master)](https://codecov.io/github/idearium/idearium-lib?branch=master)


This repository contains `idearium-lib`, which is a Node.js shared library for Idearium applications running on Node.js. Any code that is used across multiple applications (or within multiple Docker containers) should live here.

The following documents the development environment, read [idearium-lib/README.md](idearium-lib/README.md) for information on the library itself.

## Requirements

To program, test and publish these libraries, you will need:

- Vagrant.
- VMWare Fusion (and Vagrant-VMware provider plugin) or Virtualbox.
- Vagrant Host Manager plugin (execute `vagrant plugin install vagrant-hostmanager` to install).
- Git.

__Please note:__ this has only been tested on Mac OS X environments.

## Getting started with development

Follow these steps to setup the VM:

- [Host]    `cd` into the directory containing this Git repository.
- [Host]    Execute `vagrant up --provider=virtualbox` to have Vagrant create a virtual machine.

With the VM started, update it to the latest setup (including a kernel update which is important for Docker):

- [Host]    `vagrant ssh`.
- [Guest]   `sudo apt-get update` to update the Aptitude repositories.
- [Guest]   `sudo apt-get -y dist-upgrade` (you might have to answer a few prompts).
- [Guest]   With everything updated reload the VM, type `exit` or `CTRL + d`.
- [Host]    `./reload.sh`.

Everything should be updated and ready to go. Once the VM has restarted, continue with the process:

- [Host]    Execute `vagrant ssh` to be provided with a bash shell within the virtual machine.
- [Guest]   Get into the `/vagrant` directory, by executing `cd /vagrant`.
- [Guest]   Setup NPM the test environment with `lib-test-setup`.

## Testing

This library is tested by Codefresh, which employs a Docker-driven test environment. As such, testing from the VM also follows this approach.

Using the `lib-test-setup` and `lib-test` scripts, Docker and Docker Compose are used to bring up an environment suitable for testing (one that includes RabbitMQ) and tests are run via `npm test` inside a running Docker image.

This repository has a complete test suite, which can be run by:

- [Host]    Execute `vagrant ssh` to be provided with a bash shell within the virtual machine.
- [Guest]   Get into the `/vagrant` directory, by executing `cd /vagrant`.
- [Guest]   If you've only just restarted the virtual machine, execute `dc up -d`.
- [Guest]   Then you can execute `lib-test` to run the tests, as many times as you need.

### Code coverage

This repository offers code coverage insights via Istanbul and codecov.io.

Run code coverage insights by:

- [Host]    Execute `vagrant ssh` to be provided with a bash shell within the virtual machine.
- [Guest]   Get into the `/vagrant` directory, by executing `cd /vagrant`.
- [Guest]   If you've only just restarted the virtual machine, execute `dc up -d`.
- [Guest]   Execute `lib-test coverage` to run the tests.

Upon any push to GitHub, Codefresh will run the tests (reviewed at https://travis-ci.org/idearium/idearium-lib) and the code coverage report will be updated (reviewed at https://codecov.io/gh/idearium/idearium-lib).

### Accessing NPM

If you want to run any other NPM command within the context of the container:

- [Host]    Execute `vagrant ssh` to be provided with a bash shell within the virtual machine.
- [Guest]   Get into the `/vagrant` directory, by executing `cd /vagrant`.
- [Guest]   If you've only just restarted the virtual machine, execute `dc up -d`.
- [Guest]   Execute `lib-test {npm-command}` to run an NPM command. For example, `lib-test whoami` to run `npm whoami` within the context of `./idearium-lib` within the container.

## Logging into NPM

In order to publish this package to NPM, you need to log into NPM to provide authentication details. Follow these steps:

- [Host]    Execute `vagrant ssh` to be provided with a bash shell within the virtual machine.
- [Guest]   Get into the `/vagrant` directory, by executing `cd /vagrant`.
- [Guest]   Execute `npm login` and follow the prompts.

Each Idearium developer should have their own NPM account, that is a member of the `@idearium` organisation.
Now you have everything required to start coding and testing.
