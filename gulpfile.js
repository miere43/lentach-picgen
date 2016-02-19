'use strict';

var gulp = require('gulp');
var minifyJs = require('gulp-uglify');
var minifyCss = require('gulp-cssnano');
var minifyHtml = require('gulp-htmlmin');

var DEST_DIR = 'build/';

gulp.task('release-html', function() {
	return gulp.src('index.html')
		.pipe(minifyHtml({
			collapseWhitespace: true,
			removeComments: true,
			minifyJS: true,
			minifyCSS: true
		}))
		.pipe(gulp.dest(DEST_DIR));
});

gulp.task('release-css', function() {
	return gulp.src('master.css')
		.pipe(minifyCss())
		.pipe(gulp.dest(DEST_DIR));
})

gulp.task('release-bower', function() {
	gulp.src('bower_components/html5shiv/dist/html5shiv.min.js')
		.pipe(gulp.dest(DEST_DIR + 'bower_components/html5shiv/dist/'));
	gulp.src('bower_components/respond/dest/respond.min.js')
		.pipe(gulp.dest(DEST_DIR + 'bower_components/respond/dest'));
});

gulp.task('copy-assets', function() {
	return gulp.src('assets/*')
		.pipe(gulp.dest(DEST_DIR + 'assets/'));
});

gulp.task('release-misc', function() {
	gulp.src('favicon.png')
		.pipe(gulp.dest(DEST_DIR));
});

gulp.task('default', ['release-html', 'release-css', 'release-bower', 'release-misc', 'copy-assets'], function() {
	return gulp.src(['js/*.js'])
	 	.pipe(minifyJs())
		.pipe(gulp.dest(DEST_DIR + 'js/'));
});