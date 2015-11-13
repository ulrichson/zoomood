/**
 * Module dependencies.
 */

var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var mongoose = require('mongoose');
var fs = require('fs');

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

// App
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'jade');

// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// error handling middleware should be loaded after the loading the routes
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// MongoDB
mongoose.connect(config.db);

// Bootstrap models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});

// Server
var server = http.createServer(app);

// Socket.io
var io = require('./app/socket')(server);

// Config
require('./app/routes')(app, config, io);

// Create files directory if not exists
if (!fs.existsSync(config.media)){
	fs.mkdirSync(config.media);
}

// Start server
server.listen(app.get('port'), function() {
  console.log('Whiteboard server listening on port ' + app.get('port'));
});
