const gulp = require('gulp');
const clean = require('gulp-clean');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const image = require('gulp-image');

const path = {
    build: {
        html: 'build',
        js: 'build/js/',
        jsMin: 'build/js/large.min.js',
        css: 'build/css/',
        img: 'build/img/',
        // fonts: 'build/fonts/'
    },
    src: {
        html: 'src/index.html',
        js: 'src/js/script.js',
        style: 'src/scss/**/*.scss',
        img: 'src/img/**/*.*',
        // fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/index.html',
        js: 'src/js/script.js',
        style: 'src/scss/**/*.scss',
        img: 'src/img/**/*.*',
        // fonts: 'src/fonts/**/*.*'
    },
    clean: './build/'
};
// callbacks
const htmlBuild = () => {
    return gulp.src(path.src.html)
        .pipe(gulp.dest(path.build.html, {
            allowEmpty: true
        }));
};
const cleanBuild = () => {
    return gulp.src(path.clean, {
            allowEmpty: true,
            read: false
        })
        .pipe(clean());
};

const scssBuild = () => {
    return gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(scss().on('error', scss.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['>0.2%', 'last 100 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({
            compatibility: 'ie8',
            debug: true
        }, (details) => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css));
}

const jsBuild = () => {
    return gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env'],
            // overrides: [{
            //     compact: true,
            // }],
        }))
        .pipe(minify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.js))
}

const imgBuild = () =>
    gulp.src(path.src.img)
    .pipe(image({
        pngquant: true,
        optipng: false,
        zopflipng: true,
        jpegRecompress: false,
        mozjpeg: true,
        guetzli: false,
        gifsicle: true,
        svgo: true,
        concurrent: 10,
        quiet: true // defaults to false
    }))
    .pipe(gulp.dest(path.build.img))

const watcher = () => {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });
    gulp.watch(path.watch.html, htmlBuild).on('change', browserSync.reload);
    gulp.watch(path.watch.style, scssBuild).on('change', browserSync.reload);
    gulp.watch(path.watch.js, jsBuild).on('change', browserSync.reload);
    // gulp.watch(path.watch.img, imgBuild).on('change', browserSync.reload);
    // gulp.watch(path.watch.fonts, fontsBuild).on('change', browserSync.reload);
};

// tasks
gulp.task('html', htmlBuild);
gulp.task('clean', cleanBuild);
gulp.task('scss', scssBuild);
gulp.task('js', jsBuild);
gulp.task('img', imgBuild);


gulp.task('build', gulp.series(
    cleanBuild,
    htmlBuild,
    scssBuild,
    jsBuild,
    imgBuild,
    watcher
));