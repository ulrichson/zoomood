var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
  development: {
    db: 'mongodb://localhost/zoomood',
    root: rootPath,
    app: {
      name: 'Nodejs Express Mongoose Demo'
    }
  },
  test: {
    db: 'mongodb://localhost/zoomood-test',
    root: rootPath,
    app: {
      name: 'Nodejs Express Mongoose Demo'
    }
  },
  production: {
    db: process.env.MONGO_URL, // this var is user:pass@host:port/dbname
    root: rootPath,
    app: {
      name: 'Nodejs Express Mongoose Demo'
    }
  }
}
