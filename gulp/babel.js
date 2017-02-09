const babel = require('gulp-babel');

const babelTask = (gulp) => {

   // task to generate  es5 script for server
    gulp.task('babelServer', () => {
        return gulp.src('server/*.js')
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(gulp.dest('build'));
    });

    // task to generate  es5 script for client
     gulp.task('babelClient', () => {
        return gulp.src('client/js/*.js')
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(gulp.dest('build/public/js'));
    });

};

module.exports = babelTask;