#!/usr/bin/env bash

source /vagrant/vagrant/bashurator/init.sh

# Setup the environment.
configure_dependencies() {

    # Alias the docker-clean-containers script
    if [ ! -e /usr/local/bin/docker-clean-containers ]; then
        ln -s /vagrant/vagrant/scripts/docker-clean-containers.sh /usr/local/bin/docker-clean-containers
    fi

    # Alias the docker-clean-images script
    if [ ! -e /usr/local/bin/docker-clean-images ]; then
        ln -s /vagrant/vagrant/scripts/docker-clean-images.sh /usr/local/bin/docker-clean-images
    fi

    # Alias the lib-test-setup script
    if [ ! -e /usr/local/bin/lib-test-setup ]; then
        ln -s /vagrant/vagrant/scripts/lib-test-setup.sh /usr/local/bin/lib-test-setup
    fi

    # Alias the lib-test script
    if [ ! -e /usr/local/bin/lib-test ]; then
        ln -s /vagrant/vagrant/scripts/lib-test.sh /usr/local/bin/lib-test
    fi

    # Install gulp.
    npm install -g gulp

}

# Execute the function above, in an idempotent function.
bashurator.configure "dependencies" configure_dependencies
