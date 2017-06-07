'use strict';

const config = require('./config');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

module.exports = session({
    resave: false,
    saveUninitialized: false,
    secret: config.get('sessionSecret'),
    store: new RedisStore({ url: config.get('cacheUrl') }),
});
