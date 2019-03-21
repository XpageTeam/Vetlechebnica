"use strict";

const gulp = require("gulp"),
		ftp = require("vinyl-ftp"),
		$ = require("gulp-load-plugins")();

const xpager_path = "/www/html.xpager.ru/vetlechebnica-reg/",
xpager_conn = ftp.create({
	host:      'html.xpager.ru',
	user:      'file',
	password:  'X9y7E5d0',
	parallel: 4,
});

const templatePath = "/htdocs/bitrix/templates/game/";
const remotePathCss = templatePath+"css",
	remotePathJs = templatePath+"js",
	remotePathImg = templatePath+"img";

const server_conn = ftp.create({
	host:      '',
	user:      '',
	password:  '9C7Syv1X',
	parallel: 4,
});

gulp.task("deploy:js", _ =>
	gulp.src(["dist/*.js", "dist/*.js.map"])
		.pipe(server_conn.dest(remotePathJs))
);

const watch = _ => {
	gulp.watch("dist/*.", gulp.series("deploy:js"));
};

gulp.task("deploy:zip", () => 
	gulp.src([
			"**/*.*",
			"!node_modules/**",
			"!bower_components/**",
			"!config/**",
			"!dist/**",
			"!*.zip"
			])
		.pipe($.zip("app.zip"))
		.pipe(xpager_conn.dest(xpager_path))
);

gulp.task("default", gulp.series("deploy:js"));