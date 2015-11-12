var mongoose = require('mongoose'),
    Session = mongoose.model('Session'),
    Active = mongoose.model('Active');

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
      Active.update({ _id: 0 }, { session: req.params.id }, { upsert: true }, function (err) {
        if (err) {
          res.json();
        } else {
          res.json(req.params.id);
        }
      });
    },

  	post: function(req, res) {
      // Save session
      new Session({ name: req.body.name }).save(function(err, data) {
      	if (err) {
      		msg = 'Creating session failed'
          console.error(msg + ' (' + err + ')');
          res.json({
            error: true,
            msg: msg
          });
        } else {
        	console.log('Session "' + data.id + '" created');
          Active.update({ _id: 0 }, { session: data._id }, { upsert: true }, function (err) {});
          res.json({
          	session: data
          });
        }
      });
    },

    getAll: function(req, res) {
      Session.find({}).select('name created').exec(function(err, sessions) {
        res.json(sessions);
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
          res.json({ msg: 'all sessions deleted'});
      });
    },

    deleteOne: function(req, res) {
    	Session.findById(req.params.id, function(err, session) {
    		if (session) {
    			session.remove(function (err) {
	    			if (err) {
		    			console.error('Session delete from datebase failed for "' + req.params.id + '"" (' + err + ')');
		          return res.json({
		            error: true,
		            msg: 'Session delete failed for "' + req.params.id + '"'
		          });
		    		}

            // Remove active session if it was deleted
            Active.count({ session: req.params.id}, function(count) {
              if (count > 0) {
                Active.remove({ _id: 0 }, function(err) {});
              }
            });

		    		console.info('Session "' + req.params.id + '" deleted');
		        res.json({
		          error: false,
		          msg: 'Session "' + req.params.id + '" deleted'
		        });
	    		});
    		} else {
    			res.json({ error: true, msg: 'Session not available' });
    		}
    	});
    }
  }
}