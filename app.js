/**
 * Module dependencies.
 */

var express = require('express'),
    mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

var app = express();

// Config
require('./config/express')(app, config);

// Mongodb
mongoose.connect(config.db);

// Media upload
var Media = require('./config/upload')(app, config, mongoose);

// Routes
require('./config/routes')(app, Media);