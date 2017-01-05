#!/usr/bin/env bash

source /vagrant/vagrant/bashurator/init.sh

# Setup the environment.
configure_nodejs() {

  # install nodejs v6+
  curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
  apt-get install -y nodejs

  # Use the latest version of npm
  npm install -g npm

}

# Execute the function above, in an idempotent function.
bashurator.configure "nodejs" configure_nodejs
