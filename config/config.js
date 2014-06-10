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
    db: 'mongodb://localhost/zoomood-production',
    root: rootPath,
    app: {
      name: 'Nodejs Express Mongoose Demo'
    }
  }
}
