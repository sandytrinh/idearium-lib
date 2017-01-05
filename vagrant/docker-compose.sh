#!/usr/bin/env bash

source /vagrant/vagrant/bashurator/init.sh

# Setup the environment.
configure_docker_compose() {

    # Install compose.
    curl -sSL https://github.com/docker/compose/releases/download/1.9.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # Make it avaiable as `dc`.
    if [ ! -e /usr/local/bin/dc ]; then
        ln -s /usr/local/bin/docker-compose /usr/local/bin/dc
    fi

}

# Execute the function above, in an idempotent function.
bashurator.configure "docker-compose" configure_docker_compose
