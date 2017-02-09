const  sass = require('gulp-sass');

const cssTask = (gulp) => {
    gulp.task('css', function() {
        return gulp.src('./client/scss/*.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('./build/public/css'));
    });
};

module.exports  = cssTask;