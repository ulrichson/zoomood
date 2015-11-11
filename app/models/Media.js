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
  session: { type: Schema.Types.ObjectId, ref: "Session" }
});

MediaSchema.pre('remove', function(next) {
	var fileToDelete = config.publicPath + this.url;
	fs.unlink(fileToDelete, next);
});

mongoose.model('Media', MediaSchema);
