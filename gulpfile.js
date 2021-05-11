const { src, dest, series, watch } = require("gulp");
const gutil = require("gulp-util");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const scss = require("postcss-scss");
const autoprefixer = require("autoprefixer");
const inlineCss = require("gulp-inline-css");
const handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
const zip = require("gulp-zip");
const htmlmin = require("gulp-htmlmin");
const data = require("gulp-data");
const browserSync = require("browser-sync").create();

const reload = browserSync.reload;

/*CONFIG*/
sass.compiler = require("node-sass");

const origin = "./src";
const builder = "./build";
const destination = "./dist";


var globalData = {
  email: require("./src/data/email.json"),
};

/*BROWSERSYNC CONFIG*/
function serve(cb) {
  browserSync.init({
    server: `${builder}`,
    open: false,
    // or
    // proxy: 'yourserver.dev'
  });
  watch(`${origin}/sass/**/*.scss`).on( "change", series( sassInline, sassEmbedded, sassMq, hbs, inlinecss, minify, zipper )
  );
  watch(`${origin}/templates/**/*.hbs`).on( "change", series( sassInline, sassEmbedded, sassMq, hbs, inlinecss, minify, zipper )
  );
  // watch(`${origin}/emails/*.hbs`).on("change", series(hbs));
  watch(`${destination}/*.html`).on("change", reload);
  cb();
}

/*COPY DATA.JSON AND IMAGES TO BUILD FOLDER*/
function movefi(cb) {
  setTimeout(function () {
    src(`${origin}/data/data.json`).pipe(dest(`${destination}`));
    src(`${origin}/images/*.*`).pipe(dest(`${builder}`));
    cb();
  }, 1000);
}

/*SASS - CSS*/
const postcssProcessors = [
  autoprefixer({
    browsers: ["last 2 versions", "ie > 10"],
  }),
];

function sassInline(cb) {
  setTimeout(function () {
    return src(`${origin}/sass/inline.scss`)
      .pipe(
        postcss(postcssProcessors, {
          syntax: scss,
        })
      )
      .pipe(
        sass({
          outputStyle: "compressed",
        }).on("error", gutil.log)
      )
      .pipe(dest(`${builder}/css`));
  }, 1000);
  cb();
}

function sassEmbedded(cb) {
  setTimeout(function () {
    options = {
      ignorePartials: true,
      batch: [`${origin}/templates/partials`]
    }
    return src(`${origin}/sass/embedded.scss`)
      .pipe(handlebars(null, options))
      .pipe(
        postcss(postcssProcessors, {
          syntax: scss,
        })
      )
      .pipe(
        sass({
          outputStyle: "compressed",
        }).on("error", gutil.log)
      )
      // .pipe(rename({extname: '.hbs'}))
      .pipe(dest(`${origin}/templates/partials/includes/css`));
  }, 1000);
  cb();
}

function sassMq(cb) {
  setTimeout(function () {
    options = {
      ignorePartials: true,
      batch: [`${origin}/templates/partials`]
    }
    return src(`${origin}/sass/mq.scss`)
      .pipe(handlebars(null, options))
      .pipe(
        postcss(postcssProcessors, {
          syntax: scss,
        })
      )
      .pipe(
        sass({
          outputStyle: "compressed",
        }).on("error", gutil.log)
      )
      // .pipe(rename({extname: '.hbs'}))
      .pipe(dest(`${origin}/templates/partials/includes/css`));
  }, 1000);
  cb();
}

/*RENAME*/
function reext(cb) {
  setTimeout(function () {
    options = {
      ignorePartials: true,
      batch: [`${origin}/templates/partials/includes/css`]
    }
  return src(`${origin}/templates/partials/includes/css/*.*`)
  .pipe(handlebars(null, options))
  .pipe(rename({extname: '.hbs'}))
  .pipe(dest(`${origin}/templates/partials/includes`));
}, 1000);
cb();
}

/*TEMPLATING*/
function hbs(cb) {
  setTimeout(function () {
    options = {
      ignorePartials: true,
      batch: [`${origin}/templates/partials`]
    }
    return src(`${origin}/templates/pages/index.hbs`)
   
        .pipe(handlebars(null, options))
        .pipe(rename({extname: '.html'}))
        .pipe(dest(`${builder}`));
  }, 1000);
  cb();
}

/*INLINE CSS*/ 
function inlinecss(cb) {
  setTimeout(function () {
    return src(`${builder}/*.html`)
      .pipe(
        inlineCss({
          applyStyleTags: false,
          removeStyleTags: false,
        }).on("error", gutil.log)
      )
      .pipe(dest(`${destination}`));
  }, 1000);
  cb();
}

/*MINIFY HTML*/
function minify(cb) {
  setTimeout(function () {
    return src(`${destination}/*.html`)
      .pipe(
        htmlmin({
          collapseWhitespace: true,
        })
      )
      .pipe(dest(`${destination}`));
  }, 2000);
  cb();
}

/*ZIP*/
function zipper(cb) {
  setTimeout(function () {
    return src(`${destination}/*.*`)
      .pipe(zip("build.zip"))
      .pipe(dest(`${destination}`));
  }, 1000);
  cb();
}

// Default task
exports.default = series(
  movefi,
  sassInline,
  sassEmbedded,
  sassMq,
  reext,
  hbs,
  inlinecss,
  minify,
  zipper,
  serve
);

//test the tasks one by one

exports.movefi = series(movefi);
exports.sassInline = series(sassInline);
exports.sassEmbedded = series(sassEmbedded);
exports.sassMq = series(sassMq);
exports.reext = series(reext);
exports.hbs = series(hbs);
exports.inlinecss = series(inlinecss);
exports.minify = series(minify);
exports.zipper = series(zip);
