var mongoose = require('mongoose'),
    Session = mongoose.model('Session');

module.exports = function(config) {
  return {
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
          res.json({
          	session: data
          });
        }
      });
    },

    getAll: function(req, res) {
      Session.find({}, 'id, name', function(err, sessions) {
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