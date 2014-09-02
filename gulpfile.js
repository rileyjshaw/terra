var gulp = require('gulp');
var $ = require('gulp-load-plugins')({lazy: false});
var source = require('vinyl-source-stream');
var browserify = require('browserify');

var argv = require('minimist')(process.argv.slice(2));

var paths = {
  app: {
    entry: './app/main.js',
    all: './app/**/*.js',
    ext: ['./bower_components/**/*.js', './lodash_custom/**/*.js']
  },
  demo: {
    entry: './demo/scripts/main.js',
    scripts: './demo/scripts/**/*.js',
    extraScripts: [
      './bower_components/smooth-scroll.js/dist/js/bind-polyfill.min.js',
      './bower_components/smooth-scroll.js/dist/js/smooth-scroll.min.js',
      './demo/scripts/prism.js',
      './demo/scripts/analytics.js'
    ],
    stylesheets: {
      css: './demo/stylesheets/**/*.css',
      sass: './demo/stylesheets/**/*.sass'
    },
    temp: './demo/temp'
  },
  dist: {
    scripts: './dist',
    demo: './demo'
  },
  tests: './tests'
};

gulp.task('lint', function() {
  return gulp.src(paths.app.all)
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'));
});

gulp.task('test', function() {
  return gulp.src(paths.tests)
    .pipe( $.mocha( { reporter: 'spec' } ) )
});

gulp.task('scripts', ['lint'], function() {
  return browserify(paths.app.entry, {
      debug: argv.debug,
      standalone: 'terra'
    })
    .bundle()
    .pipe(source('terra.js'))
    .pipe(gulp.dest(paths.dist.scripts))
    .pipe($.rename('terra.min.js'))
    .pipe($.streamify( $.uglify() ))
    .pipe(gulp.dest(paths.dist.scripts))
});

gulp.task('demo', function() {
  return browserify(paths.demo.entry, {
      debug: argv.debug
    })
    .bundle()
    .pipe(source('temp.js'))
    .pipe(gulp.dest(paths.demo.temp))
});

gulp.task('sass', function () {
  return gulp.src(paths.demo.stylesheets.sass)
    .pipe($.rubySass())
    .pipe($.autoprefixer())
    .pipe(gulp.dest(paths.demo.temp))
});

gulp.task('js_concat', ['demo'], function () {
  return gulp.src(paths.demo.extraScripts.concat(paths.demo.temp + '/*.js'))
    .pipe($.concat('terra.demo.min.js'))
    .pipe($.streamify( $.uglify() ))
    .pipe(gulp.dest(paths.dist.demo))
});

gulp.task('css_concat', ['sass'], function () {
  return gulp.src([paths.demo.stylesheets.css, paths.demo.temp + '/*.css'])
    .pipe($.concat('main.css'))
    .pipe($.minifyCss())
    .pipe(gulp.dest(paths.dist.demo))
});

gulp.task('watch', function() {
  gulp.watch([paths.app.all, paths.app.ext], ['lint', 'scripts']);
});

gulp.task('watchSite', function() {
  gulp.watch([paths.app.all, paths.app.ext], ['lint', 'scripts']);
  gulp.watch(paths.demo.scripts, ['demo','js_concat']);
  gulp.watch([paths.demo.stylesheets.sass, paths.demo.stylesheets.css], ['sass', 'css_concat']);
});

gulp.task('deploy', function () {
  gulp.src(paths.dist.demo + '/*.*')
    .pipe($.ghPages('https://github.com/rileyjshaw/terra.git', 'origin'));
});

gulp.task('webserver', function() {
  gulp.src(paths.dist.demo)
    .pipe($.webserver({
      host: '0.0.0.0',
      livereload: true,
      open: true
    }));
});

gulp.task( 'default', [ 'lint', 'scripts', 'watch' ] );
gulp.task( 'site', [ 'lint', 'scripts', 'demo', 'js_concat', 'sass', 'css_concat', 'webserver', 'watchSite' ] );
