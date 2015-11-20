var mongoose = require('mongoose'),
  fs = require('fs'),
  rimraf = require('rimraf'),
  env = process.env.NODE_ENV || 'development',
  config = require('../../config/config')[env],
  Schema = mongoose.Schema,
  Media = mongoose.model('Media');

var SessionSchema = mongoose.Schema({
  _id: String,
  name: String,
  created: Date,
  updated: Date,
  media: [{type: Schema.Types.ObjectId, ref: 'Media'}]
});

mongoose.model('Session', SessionSchema);

SessionSchema.pre('save', function(next) {
  // set fields
  var d = new Date();

  if (this.isNew) {
    this._id = 'session_' + d.getFullYear() + '' + ('0'+(d.getMonth()+1)).slice(-2) + '' + ('0' + d.getDate()).slice(-2) + '_' + ('0' + d.getHours()).slice(-2) + '' + ('0' + d.getMinutes()).slice(-2) + '_' + mongoose.Types.ObjectId();    
    this.created = d;
  }

  this.updated = d;

  // create directory for files
  var dir = config.media + this._id;
  fs.exists(dir, function(exists) {
    if (!exists) {
      fs.mkdir(dir);
    }
  });

  // craete name
  var self = this;
  if (!this.name) {
    mongoose.model('Session').count({}, function(err, count) {
      self.name = 'Session (' + (count ? '' + (count + 1) : '1') + ')';
    }).then(next);
  } else {
    next();
  }
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
      rimraf(config.media + session.id, function(err) {
        if (err) {
          console.error('Error removong session directory: ' + err);
        }
        next();
      });
    });
});

var ActiveSchema = mongoose.Schema({
  _id: Number,
  session: {type: String, ref: 'Session'}
});

mongoose.model('Active', ActiveSchema);

