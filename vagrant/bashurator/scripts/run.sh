#!/usr/bin/env bash

if [ ! -n "$1" ]
then
    echo "Please define which provision step you'd like to run..."
else
    # used to quickly and easily reset an installation step
    sudo sh "/vagrant/vagrant/$1"
fi
