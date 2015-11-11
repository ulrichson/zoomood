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

mongoose.model('Media', MediaSchema);


MediaSchema.pre('remove', function(next) {
	Media.findOne({ _id: this._id }).populate('session').exec(function(err, media) {
		var fileToDelete = config.media + media.session.name + "/" + media.name;
		console.log(fileToDelete);
		fs.unlink(fileToDelete, next);
	});
	// var media = this;
	/*.populate('session').exec(function (err, session) {
		console.log(JSON.stringify(session));
	});*/
	
	
	

});
