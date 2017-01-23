#!/usr/bin/env bash

source /vagrant/vagrant/bashurator/init.sh

# Setup the environment.
configure_dependencies() {

    # Install gulp.
    npm install -g gulp

    # Install Travis CLI.
    gem install travis -v 1.8.5 --no-rdoc --no-ri

}

# Execute the function above, in an idempotent function.
bashurator.configure "dependencies" configure_dependencies
