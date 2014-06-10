// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones,
requirejs.config({
    baseUrl: '/',
    shim: {
      'socketio': {
        exports: 'io'
      }
    },
    paths: {
      app: 'js/app',
      jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min',
      socketio: '/socket.io/socket.io',
      fabric: 'lib/fabric/dist/fabric.require',
      'jquery.fileupload': 'lib/jquery-file-upload/js/jquery.fileupload',
      'jquery.ui.widget': 'lib/jquery-file-upload/js/vendor/jquery.ui.widget'
    }
});

// Load the main app module to start the app
requirejs(['app/main']);
