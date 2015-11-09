var mongoose = require('mongoose');

// Media upload
var MediaSchema = mongoose.Schema({
  name: String,
  type: String,
  url: String,
  scale: Number,
  angle: Number,
  x: Number,
  y: Number,
});

mongoose.model('Media', MediaSchema);
