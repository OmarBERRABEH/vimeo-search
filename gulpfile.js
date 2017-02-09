const gulp = require('gulp');
const glob = require('glob');

// load all encapsuled gulp task
glob.sync('*', { cwd: './gulp' }).forEach(function (option) {
	key = option.replace(/\.js$/,'');
	require('./gulp/'  + option)(gulp);
});

 // task to englob the 2 babel tasks to use only to transpile  your js
gulp.task('babel',['babelServer','babelClient']);

// default gulp task
gulp.task('default',['babel','css','copy']);