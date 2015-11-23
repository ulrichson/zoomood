'use strict';

// plugins
var gulp  = require('gulp'),
    cssmin = require('gulp-cssmin'),
    less = require('gulp-less'),
    server = require('gulp-livereload'),
    autoprefixer = require('gulp-autoprefixer'),
    apidoc = require('gulp-apidoc'),
    rename = require('gulp-rename');

// other vars
var cssRoot = 'public/css/';

gulp.task('less', function() {
  gulp.src(cssRoot + 'less/style.less')
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(gulp.dest(cssRoot));
})

gulp.task('apidoc', function(done) {
  apidoc({
    src: 'app/',
    dest: 'doc/'
  }, done);
});

gulp.task('build', ['apidoc', 'less'], function() {
  gulp.src(cssRoot + 'style.css')
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(cssRoot));
});

gulp.task('default', function () {
  server.listen();
  gulp.watch('public/css/less/**/*.less', ['less']);
  gulp.watch(['public/**/*.css','app/**/*']).on('change', function(file) {
    server.changed(file.path);
  });
});
