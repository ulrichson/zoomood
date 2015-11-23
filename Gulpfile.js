'use strict';

// plugins
var gulp  = require('gulp'),
    cssmin = require('gulp-cssmin'),
    less = require('gulp-less'),
    server = require('gulp-livereload'),
    autoprefixer = require('gulp-autoprefixer'),
    apidoc = require('gulp-apidoc'),
    rename = require('gulp-rename'),
    path = require('path');

// other vars
var cssRoot = 'public/css/';
var lessRoot = 'public/less/'

gulp.task('less', function(done) {
  gulp.src(lessRoot + 'style.less')
    .pipe(less({
      relativeUrls: true
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(cssRoot))
    .pipe(cssmin({ keepSpecialComments: 0 }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(cssRoot));
  done();
})

gulp.task('apidoc', function(done) {
  apidoc({
    src: 'app/',
    dest: 'doc/'
  }, done);
});

gulp.task('build', ['apidoc', 'less'], function() {
});

gulp.task('default', function () {
  server.listen();
  gulp.watch(lessRoot + '**/*.less', ['less']);
  gulp.watch(['public/**/*.css','app/**/*']).on('change', function(file) {
    server.changed(file.path);
  });
});
