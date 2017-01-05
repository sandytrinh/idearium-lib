#!/usr/bin/env bash

source /vagrant/vagrant/bashurator/init.sh

# Setup the environment.
configure_env() {

    cat "/vagrant/vagrant/config/env.sh" >> "/etc/profile.d/development.sh"
    chmod a+x "/etc/profile.d/development.sh"

}

# Execute the function above, in an idempotent function.
bashurator.configure "env" configure_env
