const clean = require('gulp-clean');


const cleanTask = (gulp) => {
    gulp.task('clean', () =>  {
          gulp.src('./build', {read: false})
                 .pipe(clean());
    });
};

module.exports = cleanTask;


