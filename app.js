/**
 * Module dependencies.
 */

var express = require('express'),
    mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    fs = require('fs'),
    http = require('http'),
    config = require('./config/config')[env];

/**
 * Main app.
 */

// App
var app = express();

// DB
mongoose.connect(config.db);

// Bootstrap models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

// Config
require('./config/express')(app, config);
require('./config/upload')(app, config);
require('./config/routes')(app);

// Server
var server = http.createServer(app);

// Socket.io
require('./config/socket')(server);

// Start server
server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
