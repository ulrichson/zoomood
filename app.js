/**
 * Module dependencies.
 */

var express = require('express'),
    mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    fs = require('fs'),
    config = require('./config/config')[env];

// Bootstrap models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

var app = express();

// Config
require('./config/express')(app, config);

// Mongodb
mongoose.connect(config.db);

// Media upload
require('./config/upload')(app, config);

// Routes
require('./config/routes')(app);
