'use strict';

// plugins
var gulp  = require('gulp'),
    cssmin = require('gulp-cssmin'),
    less = require('gulp-less'),
    server = require('gulp-livereload'),
    autoprefixer = require('gulp-autoprefixer');

// other vars
var cssRoot = 'public/css/';

gulp.task('less', function() {
  gulp.src(cssRoot + 'less/style.less')
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(gulp.dest(cssRoot));
})

gulp.task('build', ['less'], function() {
  gulp.src(cssRoot + 'style.css') // DOES NOT WORK.........................
    .pipe(cssmin({keepSpecialComments:0}))
    .pipe(gulp.dest(cssRoot));
});

gulp.task('default', function () {
  server.listen();
  gulp.watch('public/css/less/**/*.less', ['less']);
  gulp.watch(['public/**/*.css','app/**/*']).on('change', function(file) {
    server.changed(file.path);
  });
});
