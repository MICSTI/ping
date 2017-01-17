// grab gulp packages
var gulp = require("gulp");
var gutil = require("gulp-util");

var changed = require("gulp-changed");
var minifyHtml = require("gulp-minify-html");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var sass = require("gulp-sass");
var cleanCss = require("gulp-clean-css");
var sourcemaps = require("gulp-sourcemaps");

// minify new or changed HTML pages
gulp.task("htmlpage", function() {
    var htmlSrc = "./frontend/views/**/*.html";
    var htmlDst = "./build/views";

    gulp.src(htmlSrc)
        .pipe(changed(htmlDst))
        .pipe(minifyHtml())
        .pipe(gulp.dest(htmlDst));
});

// JS concat and minify
gulp.task("scripts", function() {
   gulp.src(["./lib/**/*.js", "./frontend/js/**/*.js"])
       .pipe(sourcemaps.init())
            .pipe(concat("scripts.js"))
            .pipe(uglify().on('error', gutil.log))
       .pipe(sourcemaps.write())
       .pipe(gulp.dest("./build/scripts/"));
});

// SASS compilation and minify
gulp.task("styles", function() {
   gulp.src(["./lib/**/*.css", "./frontend/sass/**/*.scss"])
       .pipe(concat('styles.scss'))
       .pipe(sass().on('error', sass.logError))
       .pipe(cleanCss())
       .pipe(gulp.dest("./build/styles/"));
});

// default task
gulp.task("default", ["htmlpage", "scripts", "styles"], function() {
    var html = ["htmlpage"];
    var js = ["scripts"];
    var css = ["styles"];

    // watch for HTML changes
    gulp.watch("./frontend/views/**/*.html", html);

    // watch for JS changes
    gulp.watch("./frontend/js/**/*.js", js);

    // watch for SCSS changes
    gulp.watch("./frontend/sass/**/*.scss", css);
});