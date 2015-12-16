var gulp = require('gulp')
  , gutil = require('gulp-util')
  , del = require('del')
  , concat = require('gulp-concat')
  , rename = require('gulp-rename')
  , minifycss = require('gulp-minify-css')
  , minifyhtml = require('gulp-minify-html')
  , processhtml = require('gulp-processhtml')
  , jshint = require('gulp-jshint')
  , uglify = require('gulp-uglify')
  , server = require('gulp-express')
  , paths;

paths = {
  assets: 'src/assets/**/*',
  css:    'src/css/*.css',
  libs:   [
    'src/bower_components/phaser-official/build/phaser.min.js'
  ],
  js:     ['src/js/**/*.js'],
  dist:   './dist/'
};

gulp.task('clean', function (cb) {
  del([paths.dist], cb);
});

gulp.task('copy-assets', function () {
  gulp.src(paths.assets)
    .pipe(gulp.dest(paths.dist + 'assets'))
    .on('error', gutil.log);
});

gulp.task('copy-vendor', function () {
  gulp.src(paths.libs)
    .pipe(gulp.dest(paths.dist))
    .on('error', gutil.log);
});

gulp.task('uglify', ['lint'], function () {
  gulp.src(paths.js)
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest(paths.dist))
    .pipe(uglify({outSourceMaps: false}))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('minifycss', function () {
 gulp.src(paths.css)
    .pipe(minifycss({
      keepSpecialComments: false,
      removeEmpty: true
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.dist))
    .on('error', gutil.log);
});

gulp.task('processhtml', function() {
  gulp.src('src/index.html')
    .pipe(processhtml({}))
    .pipe(gulp.dest(paths.dist))
    .on('error', gutil.log);
});

gulp.task('minifyhtml', function() {
  gulp.src('dist/index.html')
    .pipe(minifyhtml())
    .pipe(gulp.dest(paths.dist))
    .on('error', gutil.log);
});

gulp.task('lint', function() {
  gulp.src(paths.js)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .on('error', gutil.log);
});

gulp.task('html', function(){
  gulp.src('src/*.html')
    .pipe(server.notify())
    .on('error', gutil.log);
});

gulp.task('connect', function () {

  server.run(['server/server.js']);

});

gulp.task('watch', function () {
  gulp.watch(paths.js, ['lint',server.notify]);
  gulp.watch(['./src/index.html', paths.css, paths.js], ['html']);
  gulp.watch(['./server/**/*'],['lint',server.run]);
  gulp.watch(['./data-src/map.json'],['processmap']);
});

gulp.task('processmap',function(){
    var fs = require('fs');
    var xml2js = require('xml2js');
    var parser = new xml2js.Parser();
    fs.readFile(__dirname + '/data-src/map.tmx', function(err, data) {
        parser.parseString(data, function (err, result) {
            var systemsLayer = result.map.objectgroup[0].object;
            var map = {};
            for(var i in systemsLayer){
                var sys = systemsLayer[i].$;
                map[sys.name] = {
                    x:(sys.width || 0)/2+Number(sys.x),
                    y:(sys.width || 0)/2+Number(sys.y),
                    properties:sys.properties
                };
            }
            fs.writeFile(__dirname + '/src/assets/map.json', JSON.stringify(map), function(err) {
                if(err) {
                  console.log(err);
              }else{
                  console.log('built map data');
              }
            });
        });
    });




});

gulp.task('default', ['processmap', 'connect', 'watch']);
gulp.task('build', ['clean','processmap', 'copy-assets', 'copy-vendor', 'uglify', 'minifycss', 'processhtml', 'minifyhtml']);
