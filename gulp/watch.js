const watch = require('gulp-watch');

const watchTask = (gulp) => {

    // task to generate  es5 script for client
     gulp.task('watchClient', () => {
       watch('client/js/*.js', ['babelClient', 'css']);
    });

};

module.exports = watchTask;