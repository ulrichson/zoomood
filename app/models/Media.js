var mongoose = require('mongoose');

// Media upload
var MediaSchema = mongoose.Schema({
  name: String,
  originalName: String,
  size: Number,
  type: String,
  delete_url: String,
  url: String,
  thumbnail_url: String,
  scale: Number,
  angle: Number,
  x: Number,
  y: Number,
});

mongoose.model('Media', MediaSchema);
