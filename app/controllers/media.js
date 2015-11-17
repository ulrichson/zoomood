var mongoose = require('mongoose'),
    Media = mongoose.model('Media'),
    Session = mongoose.model('Session'),
    Active = mongoose.model('Active'),
    uuid = require('node-uuid'),
    fs = require('fs'),
    fileType = require('file-type'),
    sizeOf = require('image-size');

require('buffer');

module.exports = function(config, io) {
  return {
    home: function(req, res) {
      Media.find({}, function(err, docs) {
        res.render('canvas', {
          media: docs,
          title: 'Welcome to zoomood!'
        });
      });
    },

    getAll: function(req, res) {
      Active.where({}).findOne(function(err, active) {
        if (active) {
          Media.find({ session: active.session }).sort('order').exec(function(err, docs) {
            res.format({
              html: function() {
                res.render('media', {
                  media: docs,
                  title: 'Media'
                });
              },
              json: function() {
                res.json(docs);
              }
            });
          });
        } else {
          res.format({
            html: function() {
              res.render('media', {
                media: [],
                title: 'Media'
              });
            },
            json: function() {
              res.json();
            }
          });
        }
      });
    },

    show: function(req, res) {
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
    },

    deleteOne: function(req, res) {
      Media.where({ name: req.params.name }).findOne(function(err, media) {
        if (media) {
          media.remove();
          console.info('Media "' + req.params.name + '" deleted');
          res.json({ message: 'media deleted', media_name: req.params.name });
        } else {
          res.status(404).json({ error: 'media not available'});
        }
      });
    },

    update: function(req, res) {
      var b = req.body;
      Media.update({
        name: req.params.name
      }, {
        scale: b.scale,
        angle: b.angle,
        x: b.x,
        y: b.y,
        order: b.order
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
    },

    post: function(req, res) {
      // Check required fields
      if (!req.body.image_base64) {
        return res.status(500).json({ error: 'field image_base64 is missing' });
      }

      Active.where({}).findOne(function(err, active) {
        if (active) {
          Session.where({ _id: active.session }).findOne(function(err, session) {
            if (!session) {
              return res.status(500).json({ error: 'session is invalid' });
            }

            var fb = new Buffer(req.body.image_base64, 'base64');
            var ft = fileType(fb);

            if (ft == null || (ft.mime != 'image/jpeg' && ft.mime != 'image/png')) {
              return res.status(500).json({ error: 'file type not supported (must be image/jpeg or image/png)' });
            }

            var size = sizeOf(fb);

            // Save media
            var fn = uuid.v4() + '.' + ft.ext;
            var s = req.body.scale || Math.min(config.canvas.initMaxSize.w / size.width, config.canvas.initMaxSize.h / size.height);
            var a = req.body.angle || 0.0;
            var type = req.body.type || "unknown";
            
            // Center image
            var scaleWidth = size.width * s;
            var scaledHeight = size.height * s;
            var offsetX = 0;
            var offsetY = 0;

            var longerEdge = Math.max(scaleWidth, scaledHeight);
            if (scaleWidth > scaledHeight) {
              offsetY = Math.round((longerEdge - scaledHeight) / 2);
            } else {
              offsetX = Math.round((longerEdge - scaleWidth) / 2);
            }

            var x = req.body.x || config.canvas.initPosition.x + offsetX;
            var y = req.body.y || config.canvas.initPosition.y + offsetY;

            fs.writeFile(config.media + session.id + '/' + fn, fb, function(err) {
              if (err) {
                console.error('Media upload failed' + ' (' + err + ')');
                return res.status(500).json({ error: 'media upload failed' });
              }
              new Media({
                name: fn,
                url: '/files/' + session.name + '/' + fn,
                scale: s,
                angle: a,
                x: x,
                y: y,
                type: type,
                session: session,
                order: 9999 // easy workaround instead of finding the maximum order
              }).save(function(err, data) {
                if (err) {
                  console.error(msg + ' (' + err + ')');
                  return res.status(500).json({ error: 'media upload failed' });
                }

                msg = 'Media "' + fn + '" uploaded to session "' + session.name + '"';
                console.info(msg);
                res.json({ message: 'media upload susccessful', media: data });

                // Notify client(s) that new media was uploaded
                io.emit('media uploaded', data);
              });
            });

          });
        } else {
          res.status(500).json({ error: 'no active session set' });
        }
      });
    }
  }
}