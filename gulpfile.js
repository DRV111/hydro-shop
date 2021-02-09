const { src, dest, watch, parallel, series }  = require('gulp');

const scss             = require('gulp-sass');
const concat            = require('gulp-concat');
const browserSync       = require('browser-sync').create();
const uglify            = require('gulp-uglify-es').default;
const autoprefixer      = require('gulp-autoprefixer');
const imagemin          = require('gulp-imagemin');
const rename          = require('gulp-rename');
const del               = require('del');

function browsersync() {
    browserSync.init({
        server : {
            baseDir: 'app/'
        }
    });
}

function cleanDist() {
    return del('dist')
}

function images() {
    return src('app/images/**/*')
    .pipe(imagemin(
        [
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]
    ))
    .pipe(dest('dist/images'))
}

function sass() {
    return src(['app/scss/style.scss',
        ])
        .pipe(scss({outputStyle: 'expanded'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())

}
function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/slick-carousel/slick/slick.js',
        'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
        'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
        'node_modules/rateyo/src/jquery.rateyo.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles() {
    return src([
                'node_modules/normalize.css/normalize.css',
                'node_modules/slick-carousel/slick/slick.css',
                'node_modules/ion-rangeslider/css/ion.rangeSlider.css',
                'node_modules/jquery-form-styler/dist/jquery.formstyler.css',
                'node_modules/jquery-form-styler/dist/jquery.formstyler.theme.css',
                'node_modules/rateyo/src/jquery.rateyo.css'
        ])
        .pipe(concat('libs.min.css'))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}
function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})
    .pipe(dest('dist'))
}

function watching() {
    watch(['app/scss/**/*.scss'], sass);
    watch(['app/css/**/*.css', '!app/css/libs.min.css'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/*.html']).on('change', browserSync.reload);
}

exports.sass = sass;
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;


exports.build = series(cleanDist, images, build);
exports.default = parallel(sass, styles, scripts, browsersync, watching);

