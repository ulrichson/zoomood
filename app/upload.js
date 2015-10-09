var upload = require('jquery-file-upload-middleware'),
    mongoose = require('mongoose'),
    Media = mongoose.model('Media'),
    uuid = require('node-uuid');

module.exports = function(app, config) {

  // middleware
  upload.configure({
    uploadDir: config.root + '/public/files',
    uploadUrl: '/upload',
    imageVersions: {
      thumbnail: {
        width: 80,
        height: 80
      }
    }
  });

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
}
