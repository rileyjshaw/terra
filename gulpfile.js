var
  gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  mocha = require('gulp-mocha'),
  stripDebug = require('gulp-strip-debug'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename');
  sass = require('gulp-ruby-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  minifyCSS = require('gulp-minify-css');

var paths = {
  src: {
    firstScripts: [ 'node_modules/lodash/lodash.js', 'scripts/terra.js', 'scripts/terra.util.js' ],
    scripts: 'scripts/*.js',
    tests: 'tests/*.js',
    stylesheets: 'stylesheets/*.sass'
  }
};

gulp.task('lint', function() {
  return gulp.src(paths.src.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function() {
  return gulp.src(paths.src.tests)
    .pipe( mocha( { reporter: 'spec' } ) )
});

gulp.task('scripts', function() {
  return gulp.src( [ paths.src.firstScripts[0], paths.src.firstScripts[1], paths.src.firstScripts[2], paths.src.scripts ] )
    .pipe(stripDebug())
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('all.min.js'))
    .pipe(uglify( { outSourceMap: true } ))
    .pipe(gulp.dest('dist'));
});

gulp.task('sass', function () {
  return gulp.src(paths.src.stylesheets)
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist'))
});

gulp.task('watch', function() {
  gulp.watch(paths.src.scripts, ['lint', 'scripts']);
  gulp.watch(paths.src.stylesheets, ['sass']);
});

gulp.task( 'default', [ 'lint', 'scripts', 'sass', 'watch' ] );
