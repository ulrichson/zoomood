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
      jquery: 'lib/jquery/dist/jquery.min',
      bootstrap: 'lib/bootstrap/dist/js/bootstrap.min',
      socketio: '/socket.io/socket.io',
      fabric: 'lib/fabric/dist/fabric.require',
      moment: 'lib/moment/min/moment.min',
      toastr: 'lib/toastr/toastr.min'
    }
});

// Load the main app module to start the app
requirejs(['app/main']);
