var mongoose = require('mongoose'),
    fs = require('fs'),
    fileType = require('file-type'),
    Session = mongoose.model('Session'),
    Active = mongoose.model('Active');

require('buffer');

module.exports = function(config) {
  return {

    getActive: function(req, res) {
      Active.where({}).findOne(function(err, active) {
        if (active) {
          res.json(active.session);
        } else {
          res.json();
        }
      });
    },

    setActive: function(req, res) {
      Active.update({ _id: 0 }, { session: req.params.id }, { upsert: true }, function (err, data) {
        if (err) {
          res.json();
        } else {
          res.json({ message: 'session activated', session: data });
        }
      });
    },

  	post: function(req, res) {
      // Save session
      new Session({ name: req.body.name }).save(function(err, data) {
      	if (err) {
          console.error('Creating session failed' + ' (' + err + ')');
          res.status(500).json({ error: 'creating session failed' });
        } else {
        	console.log('Session "' + data.id + '" created');
          Active.update({ _id: 0 }, { session: data._id }, { upsert: true }, function (err) {});
          res.json({ message: 'session created', session: data });
        }
      });
    },

    getAll: function(req, res) {
      Session.find({}).select('name created updated').exec(function(err, sessions) {
        res.format({
          html: function() {
            res.render('session', {
              sessions: sessions,
              title: 'Sessions'
            });
          },
          json: function() {
            res.json(sessions);
          }
        });
      });
    },

    deleteAll: function(req, res) {
      Session.find().stream()
      .on('data', function(session) {
        session.remove();
      })
      .on('error', function(err) {
        console.error('Error removing session: ' + err);
      })
      .on('end', function() {
          Active.remove({ _id: 0 }, function(err) {});
          console.log('All sessions deleted');
          res.json({ message: 'all sessions deleted'});
      });
    },

    deleteOne: function(req, res) {
    	Session.findById(req.params.id, function(err, session) {
    		if (session) {
    			session.remove(function (err) {
	    			if (err) {
		    			console.error('Session delete from datebase failed for "' + req.params.id + '"" (' + err + ')');
		          return res.status(500).json({ error: 'deleting session failed' });
		    		}

            // Remove active session if it was deleted
            Active.where({}).findOne(function(err, active) {
              if (active && active.session == req.params.id) {
                Active.remove({ _id: 0 }, function(err) {});
              }
            });

		    		console.info('Session "' + req.params.id + '" deleted');
		        res.json({ message: 'session deleted' });
	    		});
    		} else {
    			res.status(404).json({ error: 'session not available' });
    		}
    	});
    },

    postCanvas: function(req, res) {
      // Check required fields
      if (!req.body.image_base64) {
        return res.status(500).json({ error: 'field image_base64 is missing' });
      }

      Active.where({}).findOne(function(err, active) {
        if (active) {
          Session.where({ _id: active.session }).findOne(function(err, session) {
            if (!session) {
              return res.status(500).json({ error: 'session invalid' });
            }

            var fb = new Buffer(req.body.image_base64, 'base64');
            var ft = fileType(fb);

            if (ft == null || (ft.mime != 'image/jpeg' && ft.mime != 'image/png')) {
              return res.status(500).json({ error: 'file type not supported (must be image/jpeg or image/png)' });
            }

            // Save canvas
            var fn = '__session.' + ft.ext;

            fs.writeFile(config.media + session.id + '/' + fn, fb, function(err) {
              if (err) {
                console.error('Canvas upload failed' + ' (' + err + ')');
              }
              res.json({ message: 'canvas uploaded' });
            });
          });
        } else {
          res.status(500).json({ error: 'no active session set' });
        }
      });
    }
  }
}