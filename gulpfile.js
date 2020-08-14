var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var pump = require('pump');

gulp.task('default', function (cb) {
	pump(
		[
			gulp.src('src/**/*.js'),
			uglify(),
			gulp.dest('dist'),

			gulp.src('src/**/*.css'),
			uglifycss({
				maxLineLen: 80,
				uglyComments: true,
			}),
			rename(function (path) {
				path.basename += '.min';
			}),
			gulp.dest('dist'),

			gulp.src('src/**/*'),
			gulp.dest('dist'),
		],
		cb,
	);
});

var { src, dest, series, parallel, watch } = require('gulp');
var paths = {
	src: 'src/**/*',
	js: 'src/**/*.js',
	css: 'src/**/*.css',
	dist: './dist/',
};

function addMin(path) {
	path.basename += '.min';
}

function copy() {
	return src(paths.src).pipe(dest(paths.dist));
}

copy.description =
	'Copies src folder directly to the dist folder, no mutations';

function css() {
	var options = {
		maxLineLen: 80,
		uglyComments: true,
	};

	return src(paths.css)
		.pipe(uglifycss(options))
		.pipe(rename(addMin))
		.pipe(dest(paths.dist));
}

css.description =
	'Mutates the css files, including minifying, and adding ".min" to the basename';

function js() {
	var options = {
		compress: {
			hoist_funs: false,
		},
	};
	return src(paths.js)
		.pipe(uglify(options))
		.pipe(rename(addMin))
		.pipe(dest(paths.dist));
}

function source(done) {
	watch(paths.src, parallel(copy, css, js));
	done();
}

js.description =
	'Mutates the js files, including minifying, and adding ".min" to the basename';

exports.copy = copy;
exports.css = css;
exports.js = js;

exports.build = parallel(copy, css, js);
exports.dev = series(exports.build, source);
