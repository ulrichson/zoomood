/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    upload = require('jquery-file-upload-middleware'),
    mongoose = require('mongoose'),
    path = require('path');

var app = express();


/**
 * Configuration
 */

// Upload middleware
upload.configure({
    uploadDir: __dirname + '/public/uploads',
    uploadUrl: '/uploads',
    imageVersions: {
        thumbnail: {
            width: 80,
            height: 80
        }
    }
});

// App
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    // app.use(express.favicon());
    // app.use(express.logger('dev'));
    app.use('/upload', upload.fileHandler());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    // app.use(express.cookieParser('your secret here'));
    // app.use(express.session());
    app.use(app.router);
    app.use(require('less-middleware')({
        src: __dirname + '/public'
    }));
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

// Mongodb
mongoose.connect('localhost', 'zoomood');

var MediaSchema = mongoose.Schema({
    name: String,
    originalName: String,
    size: Number,
    type: String,
    delete_url: String,
    url: String,
    thumbnail_url: String,
    scale: Number,
    x: Number,
    y: Number,
});

var Media = mongoose.model('Media', MediaSchema);

upload.on('end', function(fileInfo) {
    new Media({
        name: fileInfo.name,
        originalName: fileInfo.originalName,
        size: fileInfo.size,
        type: fileInfo.type,
        delete_url: fileInfo.delete_url,
        url: fileInfo.url,
        thumbnail_url: fileInfo.thumbnail_url,
        scale: 0.2,
        x: 10,
        y: 10,
    }).save();
});

upload.on('error', function(e) {
    console.log(e.message);
});

/**
 * Routes.
 */

// GET index
app.get('/', function(req, res) {
    var media = Media.find({}, function(err, docs) {
        res.render('index', {
            media: docs,
            title: 'Welcome to zoomood!'
        });
    });
});

// GET all media
app.get('/media', function(req, res) {
    var media = Media.find({}, function(err, docs) {
        res.render('media', {
            media: docs,
            title: 'Media'
        });
    });
});

// GET media
app.get('/media/:name', function(req, res) {
    var media = Media.find({
        name: req.params.name
    }, function(err, docs) {
        res.format({
            html: function() {
                res.send('');
            },
            json: function() {
                res.json(docs[0]);
            },
            text: function() {
                res.send('');
            }
        });
    })
});

// DELETE all media
app.delete('/media/all', function(req, res) {
    Media.remove({}, function(err) {
        res.redirect('/');
    });
});

// DELETE media
app.delete('/media/:name', function(req, res) {
    Media.remove({
        name: req.params.name
    }, function(err)  {
        res.redirect('/');
    });
});

// UPDATE media
app.put('/media/:name', function(req, res) {
    var b = req.body;

    Media.update({
        name: req.params.name
    }, {
        scale: b.scale,
        x: b.x,
        y: b.y
    }, function(err) {
        res.format({
            html: function() {
                res.send(err);
            },
            json: function() {
                res.json(err)
            },
            text: function() {
                res.send(err);
            }
        });
    });
});

/**
 * Server.
 */
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});