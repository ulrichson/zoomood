var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    mediaPath = rootPath + '/public/files/';
    canvas = { initPosition: { x: 10, y: 10 }, initMaxSize: { w: 150, h: 150} };

module.exports = {
  development: {
    db: 'mongodb://localhost/zoomood',
    root: rootPath,
    media: mediaPath,
    canvas: canvas,
    app: {
      name: 'Zoomood Whiteboard Development'
    }
  },
  test: {
    db: 'mongodb://localhost/zoomood-test',
    root: rootPath,
    media: mediaPath,
    ncanvas: canvas,
    app: {
      name: 'Zoomood Whiteboard Test'
    }
  },
  production: {
    db: process.env.MONGO_URL, // this var is user:pass@host:port/dbname
    root: rootPath,
    media: mediaPath,
    canvas: canvas,
    app: {
      name: 'Zoomood Whiteboard'
    }
  }
}
