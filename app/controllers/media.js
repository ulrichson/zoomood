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
        res.render('index', {
          media: docs,
          title: 'Welcome to zoomood!'
        });
      });
    },

    getAll: function(req, res) {
      Active.where({}).findOne(function(err, active) {
        if (active) {
          Media.find({ session: active.session }, function(err, docs) {
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
        } else {
          res.json();
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
          res.json({ error: false, msg: 'Media "' + req.params.id + '" deleted' });
        } else {
          res.json({ error: true, msg: 'Media not available'});
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
    },

    post: function(req, res) {
      // Check required fields
      if (!req.body.image_base64) {
        return res.json({
          error: true,
          msg: 'field image_base64 is missing'
        });
      }

      Active.where({}).findOne(function(err, active) {
        if (active) {
          Session.where({ _id: active.session }).findOne(function(err, session) {
            if (!session) {
              return res.json({
                error: true,
                msg: 'session is invalid'
              });
            }

            var fb = new Buffer(req.body.image_base64, 'base64');
            var ft = fileType(fb);

            if (ft == null || (ft.mime != 'image/jpeg' && ft.mime != 'image/png')) {
              return res.json({
                error: true,
                msg: 'file type not supported (needs to be image/jpeg or image/png)'
              });
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
                msg = 'Media upload failed'
                console.log(msg + ' (' + err + ')');
                return res.json({
                  error: true,
                  msg: msg
                });
              }
              new Media({
                name: fn,
                url: '/files/' + session.name + '/' + fn,
                scale: s,
                angle: a,
                x: x,
                y: y,
                type: type,
                session: session
              }).save(function(err, data) {
                if (err) {
                  msg = 'Media upload failed'
                  console.log(msg + ' (' + err + ')');
                  return res.json({
                    error: true,
                    msg: msg
                  });
                }

                msg = 'Media "' + fn + '" uploaded to session "' + session.name + '"';
                console.log(msg);
                res.json({
                  error: false,
                  msg: msg
                });

                // Notify client(s) that new media was uploaded
                io.emit('media uploaded', data);
              });
            });

          });
        } else {
          res.json({ error: true, msg: 'no active session set' });
        }
      });
    }
  }
}