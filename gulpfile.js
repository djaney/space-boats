var gulp = require('gulp')
  , gutil = require('gulp-util')
  , del = require('del')
  , concat = require('gulp-concat')
  , minifyhtml = require('gulp-minify-html')
  , processhtml = require('gulp-processhtml')
  , coffee = require('gulp-coffee')
  , server = require('gulp-express')
  , paths;

paths = {
    assets: 'src/assets/**/*',
    css:    'src/css/*.css',
    libs:   [
        'src/node_modules/phaser/build/phaser.min.js'
    ],
    coffee:     ['src/coffee/**/*.coffee'],
    index: 'src/index.html',
    dist:{
        js: 'dist/js',
        assets: 'dist/assets',
        index: 'dist'
    }
};

gulp.task('clean', function () {
    return del([paths.dist.index]);
});

gulp.task('assets', ['clean'], function () {
    gulp.src(paths.assets)
        .pipe(gulp.dest(paths.dist.assets))
        .on('error', gutil.log);
});


gulp.task('scripts', ['clean'], function () {

    gulp.src(paths.coffee)
        .pipe(concat('scripts.coffee'))
        .pipe(coffee())
        .pipe(gulp.dest(paths.dist.js))
        .on('error', gutil.log);
});


gulp.task('html', ['clean'], function() {
  gulp.src(paths.index)
    .pipe(processhtml({}))
    .pipe(gulp.dest(paths.dist.index))
    .on('error', gutil.log);
});

gulp.task('minifyhtml', function() {
  gulp.src('dist/index.html')
    .pipe(minifyhtml())
    .pipe(gulp.dest(paths.dist.index))
    .on('error', gutil.log);
});



gulp.task('connect', function () {

  server.run(['server/server.js']);

});

gulp.task('watch', function () {
  gulp.watch(['./src/index.html', paths.css, paths.js], ['html']);
  gulp.watch([paths.coffee], ['scripts']);
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
                }
            });
        });
    });




});

gulp.task('default', ['processmap', 'connect', 'watch']);
gulp.task('build', ['scripts','assets','html']);
gulp.task('heroku:production', ['scripts','assets','html']);
