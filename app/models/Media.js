var mongoose = require('mongoose'),
	fs = require('fs'),
	env = process.env.NODE_ENV || 'development',
	config = require('../../config/config')[env],
	Schema = mongoose.Schema;

var MediaSchema = mongoose.Schema({
  name: String,
  type: String,
  url: String,
  scale: Number,
  angle: Number,
  x: Number,
  y: Number,
  order: { type: Number, default: -1 },
  session: { type: String, ref: 'Session' }
});

MediaSchema.pre('remove', function(next) {
  var media = this;
	var fileToDelete = config.publicPath + this.url;
	fs.unlink(fileToDelete, function(err) {
    if (err) {
      console.error('Media delete from filesystem failed for "' + media.name + '"" (' + err + ')')
    }
  });
  next();
});

mongoose.model('Media', MediaSchema);
