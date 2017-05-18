'use strict';
var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
// SSI = require('browsersync-ssi'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    connect = require('gulp-connect'),
    inject = require('gulp-inject'),
    minifyCss = require('gulp-minify-css'),
    minify = require('gulp-minify'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    zip = require('gulp-zip'),
    moment= require("moment"),
    sftp = require('gulp-sftp'),
    ftp = require('gulp-ftp'),
    git = require('gulp-git'),
    runSequence = require('run-sequence'),

// 载入外挂
//sass = require('gulp-ruby-sass'),
//autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    clean = require('gulp-clean'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    htmlmin = require('gulp-htmlmin'),
//livereload = require('gulp-livereload');
    ngAnnotate = require('gulp-ng-annotate');





gulp.paths = {
    src: 'src',
    dist: 'dist',
    tmp: '.tmp',
    e2e: 'e2e'
};


var jsfiles =["bower_components/jquery/dist/jquery.js",
    "bower_components/angular/angular.js",
    "bower_components/angular-animate/angular-animate.js",
    "bower_components/angular-cookies/angular-cookies.js",
    "bower_components/angular-touch/angular-touch.js",
    "bower_components/angular-sanitize/angular-sanitize.js",
    "bower_components/angular-resource/angular-resource.js",
    "bower_components/bootstrap/dist/js/bootstrap.js",
    "bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
    "bower_components/PACE/pace.js",
    "bower_components/metisMenu/dist/metisMenu.js",
    "bower_components/angular-translate/angular-translate.js",
    "bower_components/ng-idle/angular-idle.js",
    "bower_components/oclazyload/dist/ocLazyLoad.min.js",
    "bower_components/malarkey/dist/malarkey.min.js",
    "bower_components/AngularJS-Toaster/toaster.js",
    "bower_components/angular-bootstrap-multiselect/angular-bootstrap-multiselect.js",
    "bower_components/angular-ui-router/release/angular-ui-router.js",
    "bower_components/angular-file-upload/dist/angular-file-upload.js",







    "src/app/app.js",
    "src/app/translations.js",
    "src/app/servers.js",
    "src/app/inspinia.js",
    "src/app/filter.js",
    "src/app/directives.js",
    "src/app/controller.js",
    "src/app/controller_c.js",
    "src/app/controller_u.js",
    "src/app/controller_d.js",
    "src/app/controller_a.js",
    "src/app/configUre.js",


    // "src/js/viewer/imageeform.js",
    // "src/js/viewer/imagePart.js",
    // "src/js/viewer/imageshare.js",
    // "src/js/viewer/imageShow.js",
    // "src/js/viewer/tabViewer.js",

];


var cssfiles =["bower_components/metisMenu/dist/metisMenu.css",
    "bower_components/animate.css/animate.css",
    "bower_components/AngularJS-Toaster/toaster.css",
    "bower_components/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css"
];


var config = {
    input:{
        zip:["dist/**/*"],
        less:["src/app/index.less","src/app/less/style.less","src/app/vendor.less"],
       
        javascript:jsfiles,
        cssfiles:cssfiles,
        //cornerstone:["js/cornerstone*.js",'jquery.hotkeys.min.js',"!js/cornerstone*.min.js"],
        scss:'src/styles/main.scss',
        images:['src/**/*.png','src/**/*.jpg'],
        html:"src/**/*.html",
        bower_components:["bower_components/**/*"],
        css_folders:["src/css/**/*"],
        cp_js:["src/js/**/*"],
        cp_imgview:["src/app/imageview/**/*"],
        cp_favicon:["src/favicon.ico"]
    },
    dist:{
        basePath:'dist',
        css:"css",
        javascript:"js",
        images:'img',
        html:"html",
        bower_components:'bower_components',
        zipfolder:"dist_zip"
    }
}

//inject bower components into index.html

/*gulp.task('bower', function () {
    gulp.src('./src/index.html')
        .pipe(wiredep({
            optional: 'configuration',
            goes: 'here'
        }))
        .pipe(gulp.dest(config.dist.basePath));
});*/


//inject the controller into index.html
gulp.task('injectControllerJs', function () {
    var injectOptions = {
        transform: function(filePath) {
            filePath = filePath.replace( 'src/app/', 'app/');
            /*filePath = filePath.replace('../bower_components/', 'bower_components/');*/
            return '<script src="'+filePath+'"></script>';
        },
      /*  starttag: '// inject',
        endtag: '// endinject',*/
        addRootSlash: false
    };
    var target = gulp.src('src/index.html');
    var sources = gulp.src(config.input.javascript, {read: false},{relative: true});

    return target.pipe(inject(sources,injectOptions))
        .pipe(gulp.dest(config.dist.basePath));
});


//browser

gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: "localhost:8888",
        browser: [ "firefox"]
    });
    gulp.watch([config.input.javascript,config.input.html,"dist/index.min.css"]).on('change', browserSync.reload);
});

gulp.task('copy.imageview', function (done) {
gulp.src(config.input.cp_imgview)
        .pipe(gulp.dest(config.dist.basePath+"/"+"app/imageview"));
});

//server

gulp.task('webserver',function(){
    connect.server({
        root: ['./dist'],
        port:8888,
        livereload: true});
})

// 定义 watch 任务
gulp.task('watch', function() {
    gulp.watch(config.input.javascript, ['copyControllerJs']);
    gulp.watch(config.input.html, ['html']);
    gulp.watch(config.input.less,['less']);
})

//压缩HTML
gulp.task('html', function () {
    var options = {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true
    };
    gulp.src(config.input.html)
        .pipe(htmlmin(options))
        // .pipe(rename({ suffix: '.min' }))
        // .pipe(gulp.dest(config.dist.basePath +"/"+config.dist.html))
        .pipe(gulp.dest(config.dist.basePath))
});

//压缩JavaScript
gulp.task('js', function (done) {
    gulp.src(config.input.javascript)
        .pipe(ngAnnotate({single_quotes: true}))
        .pipe(uglify())
        .pipe(concat('index.min.js'))
        .pipe(gulp.dest(config.dist.basePath))

});


//拷贝controller文件到dist中
gulp.task('copyControllerJs',function(){
    gulp.src("./src/app/*.js")
        .pipe(gulp.dest(config.dist.basePath+'/app'))

})


//拷贝bower_components
gulp.task('copy.bs', function (done) {
    gulp.src(config.input.bower_components)
        .pipe(gulp.dest(config.dist.basePath+"/"+config.dist.bower_components));
    gulp.src(config.input.images)
        .pipe(gulp.dest(config.dist.basePath));

    gulp.src(config.input.cp_js)
        .pipe(gulp.dest(config.dist.basePath+"/"+"js"));


    gulp.src(config.input.css_folders)
        .pipe(gulp.dest(config.dist.basePath+"/"+config.dist.css));


});

gulp.task('copy.favicon', function (done) {
gulp.src(config.input.cp_favicon)
        .pipe(gulp.dest(config.dist.basePath+"/"));
});
//拷贝bower_components
gulp.task('copy.img', function (done) {
    gulp.src(config.input.cp_js)
        .pipe(gulp.dest(config.dist.basePath+"/"+"js"));
});


//拷贝bower_components
gulp.task('copy.js', function (done) {
    gulp.src(config.input.cp_js)
        .pipe(gulp.dest(config.dist.basePath+"/"+"js"));
    gulp.src("src/configure/**/*")
        .pipe(gulp.dest(config.dist.basePath+"/"+"configure"));
});



//拷贝bower_components
gulp.task('copy.css', function (done) {

});

gulp.task('copy', function () {
    gulp.start('copy.bs');
    gulp.start('copy.img');
    gulp.start('copy.imageview');
    gulp.start('copy.css');
    gulp.start('copy.js');
    gulp.start('copy.favicon');

});






gulp.task('less', function () {
    gulp.src(config.input.less)
        .pipe(less())
        .pipe(minifyCss())
        .pipe(concat('index.min.css'))
        .pipe(gulp.dest(config.dist.basePath));

    gulp.src(config.input.cssfiles)
        .pipe(minifyCss())
        .pipe(concat('loading.min.css'))
        .pipe(gulp.dest(config.dist.basePath))
});




gulp.task('default', function () {

    gulp.start('html');
    //gulp.start('js');
    gulp.start('less');
    gulp.start('copy');
    gulp.start('injectControllerJs');
    gulp.start('copyControllerJs');
    gulp.start('webserver');
    //gulp.start('browser-sync');
    gulp.start('watch');

});


/*
 * version:1.0
 * date:2016-7-26
 * auth:wu.yu
 * desc:压缩dist文件夹为 dist_***.zip包
 * usage:gulp zip
 * 
 * 
 * version:1.1
 * date:2016-7-28
 * auth:wu.yu
 * desc:增加命令行参数为-user 
 * usage:gulp zip --user wuyu
 * 
 * */
gulp.task('zip', function (userName) {
    var timeStamp= moment().format("YYYY-MM-D_HH-mm-ss_");

    var user = require('minimist')(process.argv.slice(2)).user;

    git.exec({args : 'log'}, function (err, stdout) {
        var gitVersion = stdout.substr(7,8);
        console.log("gitVersion:"+gitVersion);
        gulp.src(config.input.zip)
            .pipe(zip("dist_"+user+"_"+timeStamp+gitVersion+".zip"))
            .pipe(gulp.dest(config.dist.zipfolder));
        //if (err) throw err;
    });

});
//gulp zip --user XXXX

gulp.task('git', function (userName) {
    var timeStamp= moment().format("YYYY-MM-D_HH-mm-ss_");

    var user = require('minimist')(process.argv.slice(2)).user;

    git.exec({args : 'log'}, function (err, stdout) {
        var gitVersion = stdout.substr(7,8);
        console.log(gitVersion);
        if (err) throw err;
    });

});





gulp.task('ftp', function () {
    return gulp.src("dist_zip/*")
        .pipe(ftp({
            host: 'linkingmed-xp',
            port:21,
            //user: 'anonymous',
            //pass:null,
            remotePath:"idoctor/"
        }));
});


// Other actions that do not require a Vinyl
gulp.task('gitlog', function(){
    git.exec({args : 'log'}, function (err, stdout) {
        console.log("gitlog:"+stdout.substr(7,8));

        if (err) throw err;
    });
});
