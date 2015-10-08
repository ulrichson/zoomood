var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    mediaPath = rootPath + '/public/files/';

module.exports = {
  development: {
    db: 'mongodb://localhost/zoomood',
    root: rootPath,
    media: mediaPath,
    app: {
      name: 'Nodejs Express Mongoose Demo'
    }
  },
  test: {
    db: 'mongodb://localhost/zoomood-test',
    root: rootPath,
    media: mediaPath,
    app: {
      name: 'Nodejs Express Mongoose Demo'
    }
  },
  production: {
    db: process.env.MONGO_URL, // this var is user:pass@host:port/dbname
    root: rootPath,
    media: mediaPath,
    app: {
      name: 'Nodejs Express Mongoose Demo'
    }
  }
}
