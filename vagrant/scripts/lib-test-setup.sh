#!/usr/bin/env bash

# Setup NPM.
cd /vagrant/idearium-lib

# Build the NPM modules.
npm install

# Setup Docker.
cd /vagrant

# Pull the images.
dc pull

# Build the images.
dc build

# Start docker-compose.
dc up -d
