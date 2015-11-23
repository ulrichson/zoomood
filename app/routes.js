module.exports = function(app, config, io) {

  var media = require('./controllers/media')(config, io);
  var session = require('./controllers/session')(config);

  // Index page (canvas)
  app.get('/', media.home);

  /**
   * @api {get} /media Get all media
   * @apiGroup Media
   *
   * @apiParam {String} name Media name.
   *
   * @apiSuccess {Object[]} -               List of media.
   * @apiSuccess {String}   -.name          The name.
   * @apiSuccess {Number}   -.x             The x position on canvas.
   * @apiSuccess {Number}   -.y             The y position on canvas.
   * @apiSuccess {Number}   -.scale         The scale.
   * @apiSuccess {String}   -.url           The URL.
   * @apiSuccess {Object}   -.x             The x position on canvas.
   * @apiSuccess {Number}   -.angle         The angle.
   * @apiSuccess {String}   -.type          The type (e.g. 'whiteboard').
   * @apiSuccess {Number}   -.order         The order on canvas (layer).
   * @apiSuccess {Number}   -.session       The session id.
   */
  app.get('/media', media.getAll);

  /**
   * @api {get} /media/:name Get one media
   * @apiGroup Media
   *
   * @apiParam {String}     name              Media name.
   *
   * @apiSuccess {String}   name              The name.
   * @apiSuccess {Number}   x                 The x position on canvas.
   * @apiSuccess {Number}   y                 The y position on canvas.
   * @apiSuccess {Number}   scale             The scale.
   * @apiSuccess {String}   url               The URL.
   * @apiSuccess {Object}   x                 The x position on canvas.
   * @apiSuccess {Number}   angle             The angle.
   * @apiSuccess {String}   type              The type (e.g. 'whiteboard').
   * @apiSuccess {Number}   order             The order on canvas (layer).
   * @apiSuccess {Number}   session           The session id.
   */
  app.get('/media/:name', media.show);

  /**
   * @api {delete} /media/:name Delete one media
   * @apiGroup Media
   *
   * @apiParam {String}     name               Media name.
   *
   * @apiSuccess {String}   message            Return message.
   * @apiSuccess {String}   media_name         Name of deleted media.
   */
  app.delete('/media/:name', media.deleteOne);

  /**
   * @api {put} /media/:name Update media
   * @apiGroup Media
   *
   * @apiExample Example usage:
   *     body:
   *     {
   *       "scale": 0.2,
   *       "x": 30,
   *       "y": 400,
   *       "order": 2
   *     }
   *
   * @apiParam {String}     name                Media name.
   * @apiParam {Number}     scale               The scale factor.
   * @apiParam {Number}     x                   The x position on canvas.
   * @apiParam {Number}     y                   The y position on canvas.
   * @apiParam {Number}     order               The order on canvas (layer).
   */
  app.put('/media/:name', media.update);

  /**
   * @api {post} /media Upload new media
   * @apiGroup Media
   *
   * @apiParam {String}     image_base64        Base64 encoded image in png or jpg.
   *
   * @apiSuccess {String}   message             Return message.
   * @apiSuccess {String}   media               Uploaded media object.
   */
  app.post('/media', media.post);

  /**
   * @api {post} /session Create new session
   * @apiGroup Session
   *
   * @apiParam {String}     [name]              Name for session.
   *
   * @apiSuccess {String}   message             Return message.
   * @apiSuccess {String}   session             Uploaded session object.
   */
  app.post('/session', session.post);

  /**
   * @api {get} /session Get all sessions
   * @apiGroup Session
   *
   * @apiSuccess {Object[]} sessions            List of sessions.
   * @apiSuccess {String}   sessions.id         The id.
   * @apiSuccess {String}   sessions.name       The name.
   * @apiSuccess {Date}     created             Date when created.
   * @apiSuccess {Date}     updated             Date when updated.
   */
  app.get('/session', session.getAll);

  /**
   * @api {delete} /session Delete all sessions
   * @apiGroup Session
   *
   * @apiSuccess {String}   message             Return message.
   */
  app.delete('/session', session.deleteAll);

  /**
   * @api {delete} /session/:id Delete one session
   * @apiGroup Session
   *
   * @apiParam {String} id Session id.
   *
   * @apiSuccess {String}   message             Return message.
   */
  app.delete('/session/:id', session.deleteOne);

  /**
   * @api {get} /session/active Get active session
   * @apiGroup Session

   * @apiSuccess {String}   -                   The session id.
   */
  app.get('/session/active', session.getActive);

  /**
   * @api {put} /session/:id Set active session
   * @apiGroup Session
   *
   * @apiParam {String}     id                  Session id that will be activated.
   *
   * @apiSuccess {String}   message             Return message.
   * @apiSuccess {String}   session             Session object.
   */
  app.put('/session/active/:id', session.setActive);

  /**
   * @api {post} /session/canvas Upload session canvas to active canvas
   * @apiGroup Session
   *
   * @apiParam {String}     image_base64        Base64 encoded image in png or jpg.
   *
   * @apiSuccess {String}   message             Return message.
   */
  app.post('/session/canvas', session.postCanvas);
}
