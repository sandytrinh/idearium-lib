#!/usr/bin/env bash

source /vagrant/vagrant/bashurator/init.sh

# Setup the environment.
configure_apt_get() {

    # Update apt-get.
    apt-get update

    # Required for add-apt-repository.
    apt-get install -y software-properties-common build-essential zip unzip

    # For mongodb.
	apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
	echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.0.list

    # Required for latest Git.
    add-apt-repository ppa:git-core/ppa

    # Required for latest Ruby.
    apt-add-repository ppa:brightbox/ruby-ng

    # Update apt-get.
    apt-get update

}

# Execute the function above, in an idempotent function.
bashurator.configure "apt-get" configure_apt_get
