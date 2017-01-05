#!/usr/bin/env bash

source /vagrant/vagrant/bashurator/init.sh

# Setup the environment.
configure_docker() {

    # Install the latest version of Docker.
    curl -fsSL https://get.docker.com/ | sh

    # Install the user.
    usermod -aG docker vagrant

}

# Execute the function above, in an idempotent function.
bashurator.configure "docker" configure_docker
