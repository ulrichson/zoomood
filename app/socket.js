var mongoose = require('mongoose'),
    Media = mongoose.model('Media');

module.exports = function(server) {
  var io = require('socket.io')(server);

  io.on('connection', function(socket) {
    console.log('Whiteboard connected');

    socket.on('disconnect', function() {
      console.log('Whiteboard disconnected');
    });

    socket.on('update media', function(data) {
      Media.update({
        name: data.name
      }, {
        scale: data.scale,
        angle: data.angle,
        x: data.x,
        y: data.y,
        order: data.order
      }, function(err) {
        if (err) {
          console.error('Error updating media "' + data.name + '" (' + err + ')');
        }
      });
    });
  });

  return io;
}
