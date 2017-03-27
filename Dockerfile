FROM smebberson/alpine-nodejs:latest

RUN mkdir -p /app
WORKDIR /app

COPY ./idearium-lib/package.json /app/
RUN npm install --silent

COPY ./idearium-lib /app

CMD [ "npm", "test" ]
