#!/usr/bin/env bash

# Is it already running?
docker ps | grep rabbitmq > /dev/null 2>&1

# Check the previous command
if [ $? -ne 0 ]; then

    echo "RabbitMQ is not running... starting it now..."

    # We're not sure of the exact state it's in, so let's stop and remove rabbitmq.
    docker stop rabbitmq > /dev/null 2>&1
    docker rm rabbitmq > /dev/null 2>&1

    # Let's get it running again.
    docker run -d --name rabbitmq -p "5672:5672" -e "RABBITMQ_USER=lib" -e "RABBITMQ_PASS=lib" smebberson/alpine-rabbitmq > /dev/null 2>&1

    echo "RabbitMQ started... sleeping for 10s to allow it to initialize..."

    # Wait for RabbitMQ to be running in the container.
    sleep 10

fi
