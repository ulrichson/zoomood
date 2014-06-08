var http = require('http');

module.exports = function(app, Media) {
  // GET index
  app.get('/', function(req, res) {
    Media.find({}, function(err, docs) {
      res.render('index', {
        media: docs,
        title: 'Welcome to zoomood!'
      });
    });
  });

  // GET all media
  app.get('/media', function(req, res) {
    Media.find({}, function(err, docs) {
      res.format({
        html: function() {
          res.render('media', {
            media: docs,
            title: 'Media'
          });
        },
        json: function() {
          res.json(docs);
        },
        text: function() {
          res.send('');
        }
      });
    });
  });

  // GET media
  app.get('/media/:name', function(req, res) {
    Media.find({
      name: req.params.name
    }, function(err, docs) {
      res.format({
        html: function() {
          res.render('media', {
            media: docs,
            title: 'Media'
          });
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
    }, function(err) {
      res.format({
        html: function() {
          res.redirect('/');
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

  // UPDATE media
  app.put('/media/:name', function(req, res) {
    var b = req.body;
    Media.update({
      name: req.params.name
    }, {
      scale: b.scale,
      angle: b.angle,
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
}
