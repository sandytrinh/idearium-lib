#!/usr/bin/env bash

source /vagrant/vagrant/bashurator/init.sh

# Setup the environment.
configure_ruby() {

    # Install Ruby.
    apt-get install -y ruby2.1 ruby2.1-dev ruby-switch

    # Something but the docs told me too.
    # https://github.com/travis-ci/travis.rb#installation
    ruby-switch --set ruby2.1

}

# Execute the function above, in an idempotent function.
bashurator.configure "ruby" configure_ruby
