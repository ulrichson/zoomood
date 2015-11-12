module.exports = function(app, config, io) {

  var media = require('./controllers/media')(config, io);
  var session = require('./controllers/session')(config);

  // GET index
  app.get('/', media.home);

  // GET all media
  app.get('/media', media.getAll);

  // GET one media
  app.get('/media/:name', media.show);

  // DELETE one media
  app.delete('/media/:name', media.deleteOne);

  // UPDATE media
  app.put('/media/:name', media.update);

  // POST media
  app.post('/media', media.post);

  // POST session
  app.post('/session', session.post);

  // GET all sessions
  app.get('/session', session.getAll);

  // DETELE all session
  app.delete('/session', session.deleteAll);

  // DETELE one session
  app.delete('/session/:id', session.deleteOne);

  // GET active session
  app.get('/session/active', session.getActive);

  // PUT active session
  app.put('/session/active/:id', session.setActive);
}
