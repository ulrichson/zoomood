var mongoose = require('mongoose'),
    Media = mongoose.model('Media');

exports.home = function(req, res) {
  Media.find({}, function(err, docs) {
    res.render('index', {
      media: docs,
      title: 'Welcome to zoomood!'
    });
  })
}

exports.getAll = function(req, res) {
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
}

exports.show = function(req, res) {
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
}

exports.deleteAll = function(req, res) {
  Media.remove({}, function(err) {
    res.redirect('/');
  });
}

exports.deleteOne = function(req, res) {
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
}

exports.update = function(req, res) {
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
}
