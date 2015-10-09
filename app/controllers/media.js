var mongoose = require('mongoose'),
    Media = mongoose.model('Media'),
    uuid = require('node-uuid')
    fs = require('fs');

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

    deleteAll: function(req, res) {
      Media.remove({}, function(err) {
        res.redirect('/');
      });
    },

    deleteOne: function(req, res) {
      var fileToDelete = config.media + req.params.name;
      fs.unlink(fileToDelete, function(err) {
        if (err) {
          console.error('Media delete from filesystem failed for "' + req.params.name + '"" (' + err + ')');
          res.json({
            error: true,
            msg: 'Media delete failed for ' + req.params.name
          });
        } else {
          Media.remove({
            name: req.params.name
          }, function(err) {
            if (err) {
              console.error('Media delete from datebase failed for "' + req.params.name + '"" (' + err + ')');
              res.json({
                error: true,
                msg: 'Media delete failed for "' + req.params.name + '"'
              });
            } else {
              console.info('Media "' + req.params.name + '" deleted')
              res.json({
                error: false,
                msg: 'Media "' + req.params.name + '" deleted'
              });
            }
          });
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
      var fileName = uuid.v4() + '.jpg';
      fs.writeFile(config.media + fileName, req.body.image_base64, 'base64', function(err) {
        if (err)  {
          msg = 'Media upload failed'
          console.log(msg + ' (' + err + ')');
          res.json({
            error: true,
            msg: msg
          });
        } else {
          new Media({
            name: fileName,
            // originalName: fileInfo.originalName,
            // size: fileInfo.size,
            // type: fileInfo.type,
            // delete_url: fileInfo.delete_url,
            url: '/files/' + fileName,
            // thumbnail_url: fileInfo.thumbnail_url,
            scale: 0.2,
            angle: 0,
            x: 300,
            y: 300,
          }).save(function(error, data) {
            if (error) {
              msg = 'Media upload failed'
              console.log(msg + ' (' + error + ')');
              res.json({
                error: true,
                msg: msg
              });
            } else {
              msg = 'Media "' + fileName + '" uploaded';
              console.log(msg);
              res.json({
                error: false,
                msg: msg
              });

              // Notify client(s) that new media was uploaded
              io.emit('media uploaded', data);
            }
          });
        }        
      });
    }
  }
}