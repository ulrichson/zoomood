var upload = require('jquery-file-upload-middleware');

module.exports = function(app, config, mongoose) {

  // middleware
  upload.configure({
    uploadDir: config.root + '/public/uploads',
    uploadUrl: '/uploads',
    imageVersions: {
      thumbnail: {
        width: 80,
        height: 80
      }
    }
  });

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

  var Media = mongoose.model('Media', MediaSchema);

  upload.on('begin', function(fileInfo) {
    var ext = fileInfo.name.substr(fileInfo.name.lastIndexOf('.') + 1);
    fileInfo.name = uuid.v4() + '.' + ext;
  });

  upload.on('end', function(fileInfo) {
    new Media({
      name: fileInfo.name,
      originalName: fileInfo.originalName,
      size: fileInfo.size,
      type: fileInfo.type,
      delete_url: fileInfo.delete_url,
      url: fileInfo.url,
      thumbnail_url: fileInfo.thumbnail_url,
      scale: 0.2,
      angle: 0,
      x: 300,
      y: 300,
    }).save();
    console.log('File uploaded: ' + fileInfo.name);
  });

  upload.on('delete', function(fileName) {
    Media.remove({
      name: fileName
    }, function(err) {
      console.log('File deleted: ' + fileName);
    });
  });

  upload.on('error', function(e) {
    console.log(e.message);
  });

  return Media;
}
