var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    publicPath = rootPath + '/public',
    mediaPath = publicPath + '/files/',
    canvas = { initPosition: { x: 10, y: 10 }, initMaxSize: { w: 150, h: 150} };

module.exports = {
  development: {
    db: 'mongodb://localhost/zoomood',
    root: rootPath,
    media: mediaPath,
    publicPath: publicPath,
    canvas: canvas,
    app: {
      name: 'Zoomood Whiteboard Development'
    }
  },
  test: {
    db: 'mongodb://localhost/zoomood-test',
    root: rootPath,
    media: mediaPath,
    publicPath: publicPath,
    canvas: canvas,
    app: {
      name: 'Zoomood Whiteboard Test'
    }
  },
  production: {
    db: process.env.MONGO_URL, // this var is user:pass@host:port/dbname
    root: rootPath,
    media: mediaPath,
    publicPath: publicPath,
    canvas: canvas,
    app: {
      name: 'Zoomood Whiteboard'
    }
  }
}
