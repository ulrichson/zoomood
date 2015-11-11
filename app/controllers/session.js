var mongoose = require('mongoose'),
    Session = mongoose.model('Session');

module.exports = function(config) {
  return {
  	post: function(req, res) {
      // Save session
      new Session().save(function(err, data) {
      	if (err) {
      		msg = 'Creating session failed'
          console.error(msg + ' (' + err + ')');
          res.json({
            error: true,
            msg: msg
          });
        } else {
        	console.log('Session "' + data.name + '" created');
          res.json({
          	session_name: data.name
          });
        }
      });
    },

    getAll: function(req, res) {
      Session.find({}, "name", function(err, sessions) {
        res.json(sessions);
      });
    },

    deleteAll: function(req, res) {
      Session.remove({}, function(err) {
      	console.log('All sessions deleted');
        res.json({ msg: 'all sessions deleted'});
      });
    },

    deleteOne: function(req, res) {
    	Session.findOne({ name: req.params.name }, function(err, session) {
    		if (session) {
    			session.remove(function (err) {
	    			if (err) {
		    			console.error('Session delete from datebase failed for "' + req.params.name + '"" (' + err + ')');
		          return res.json({
		            error: true,
		            msg: 'Session delete failed for "' + req.params.name + '"'
		          });
		    		}

		    		console.info('Session "' + req.params.name + '" deleted');
		        res.json({
		          error: false,
		          msg: 'Session "' + req.params.name + '" deleted'
		        });
	    		});
    		} else {
    			res.json({ error: true, msg: 'Session not available' });
    		}
    	});
    }
  }
}