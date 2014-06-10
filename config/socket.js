module.exports = function(server) {
  var io = require('socket.io')(server);

  io.on('connection', function(socket){
    console.log('client connected');

    socket.on('lol', function() {
      console.log('recieved looool');
    })

    socket.on('update media', function(data) {
      console.log('a client update media', data);

      io.emit('update media', data);
    })
  });
}

// var sio = require('socket.io');

// module.exports = function(app) {
//   var io = sio.listen(app),
//       users = {};

//   // Set our transports
//   io.configure(function () {
//     io.set('transports', ['xhr-polling']);
//     io.set('polling duration', 20);
//   });

//   io.sockets.on('connection', function (socket) {
//     socket.on('user message', function (msg) {
//       socket.broadcast.emit('user message', socket.nickname, msg);
//     });

//     socket.on('nickname', function (nick, fn) {
//       if (nicknames[nick]) {
//         fn(true);
//       } else {
//         fn(false);
//         nicknames[nick] = socket.nickname = nick;
//         socket.broadcast.emit('announcement', nick + ' connected');
//         io.sockets.emit('nicknames', nicknames);
//       }
//     });

//     socket.on('disconnect', function () {
//       if (!socket.nickname) return;

//       delete nicknames[socket.nickname];
//       socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
//       socket.broadcast.emit('nicknames', nicknames);
//     });
//   });
// }
