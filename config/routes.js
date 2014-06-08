var media = require('../app/controllers/media');

module.exports = function(app, Media) {
  // GET index
  app.get('/', media.home);

  // GET all media
  app.get('/media', media.getAll);

  // GET media
  app.get('/media/:name', media.show);

  // DELETE all media
  app.delete('/media/all', media.deleteAll);

  // DELETE media
  app.delete('/media/:name', media.deleteOne);

  // UPDATE media
  app.put('/media/:name', media.update);
}
