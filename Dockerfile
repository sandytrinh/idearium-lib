FROM smebberson/alpine-nodejs:latest

# Setup dockerize.
ENV DOCKERIZE_VERSION v0.3.0
RUN apk add --no-cache curl openssl && \
    curl -sSL https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz | tar -C /usr/local/bin -xzvf - && \
    apk del curl openssl

# The working directory for our library.
RUN mkdir -p /app
WORKDIR /app

# Install Node.js
COPY ./idearium-lib/package.json /app/
RUN npm install --silent

# Copy across everything else (.dockerignore at play).
COPY ./idearium-lib /app

# Use dockerize to wait for RabbitMQ to be ready.
# This will help to minimize issues on Codefresh.
CMD ["dockerize", "-wait", "tcp://rabbitmq:5672", "npm", "test"]
