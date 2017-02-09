const copyTask = (gulp) => {
    gulp.task('copyFont', () =>  {
          gulp.src('./client/fonts/**')
          	    .pipe(gulp.dest('./build/public/fonts'));
    });

    gulp.task('copy', ['copyFont']);
};

module.exports = copyTask;


