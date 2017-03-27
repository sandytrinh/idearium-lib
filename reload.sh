#!/usr/bin/env bash

# Use this to restart the virtual machine, as vagrant-hostmanager doesn't run on `vagrant reload`.

echo "Restarting the VM..."

vagrant halt
vagrant up
