var less = require('less-middleware'),
    express = require('express'),
    path = require('path'),
    upload = require('jquery-file-upload-middleware');

module.exports = function(app, config) {
  app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use('/upload', upload.fileHandler());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(less(
        config.root + '/public'
    ));
    app.use(express.static(path.join(config.root, 'public')));
  });

  app.configure('development', function() {
    app.use(express.errorHandler());
  });
}
