var mongoose = require('mongoose'),
	fs = require('fs'),
	rimraf = require('rimraf'),
	env = process.env.NODE_ENV || 'development',
	config = require('../../config/config')[env],
	Schema = mongoose.Schema,
	Media = mongoose.model('Media');

var SessionSchema = mongoose.Schema({
	name: String,
	created: Date,
	updated: Date,
	media: [{type: Schema.Types.ObjectId, ref: "Media"}]
});

SessionSchema.pre('save', function(next) {
	var d = new Date();

	if (!this.name) {
		this.name = "session_" + d.getFullYear() + "" + ("0"+(d.getMonth()+1)).slice(-2) + "" + ("0" + d.getDate()).slice(-2) + "_" + ("0" + d.getHours()).slice(-2) + "" + ("0" + d.getMinutes()).slice(-2) + "_" + this.id;		
	}  

	if (!this.created) {
		this.created = d;
	}

  this.updated = d;

  // create directory for files
  fs.mkdir(config.media + this.name);

  next();
});

SessionSchema.pre('remove', function(next) {
	var session = this;
	
	// Remove all the media that reference the removed session
	Media.find({ session: session }).stream()
	  .on('data', function(media) {
	    media.remove();
	  })
	  .on('error', function(err) {
	    console.error('Error removing session: ' + err);
	  })
	  .on('end', function() {
	    rimraf(config.media + session.name, function(err) {
	    	if (err) {
	    		console.error('Error removong session directory: ' + err);
	    	}
	    	next();
	    });
	  });
});

mongoose.model('Session', SessionSchema);
