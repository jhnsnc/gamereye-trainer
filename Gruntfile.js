function getCounter(startVal, incrementVal) {
	var currentVal = startVal;
	return function counter() {
		currentVal += incrementVal;
		return (currentVal - incrementVal);
	};
}
var hotspotCounter = getCounter(1,1);

module.exports = function(grunt) {
	//init
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			'deploy': ['deploy/*'],
			'css': ['src/css/*'],
			'html-hotspots': ['src/html/hotspots/*']
		},
		sass: {
			'project': {
				files: [{
					expand: true,
					cwd: 'src/scss',
					src: ['**/*.scss'],
					dest: 'src/css',
					ext: '.css'
				}]
			}
		},
		copy: {
			'package-items': {
				files: {
					'deploy/IconMouseNormal.png': ['src/IconMouseNormal.png'],
					'deploy/IconMouseOver.png': ['src/IconMouseOver.png'],
					// 'deploy/SmallAppstoreTile.png': ['src/SmallAppstoreTile.png'],
					// 'deploy/LargeAppstoreTile.png': ['src/LargeAppstoreTile.png'],
					'deploy/Tile.jpg': ['src/Tile.jpg'],
					// 'deploy/SmallAppIcon.png': ['src/SmallAppIcon.png'],
					// 'deploy/LargeAppIcon.png': ['src/LargeAppIcon.png'],
					'deploy/Icon.png': ['src/Icon.png'],
					// 'deploy/screenshot-1.png': ['src/screenshot-1.png'],
					// 'deploy/screenshot-2.png': ['src/screenshot-2.png'],
					// 'deploy/screenshot-3.png': ['src/screenshot-3.png'],
					'deploy/store.json': ['src/store.json'],
					'deploy/manifest.json': ['src/manifest.json'],
					'deploy/README.md': ['src/README.md']
				}
			},
			'html-hotspots': {
				files: [
					{ expand: true, src: ['src/html/hotspot-source.html'], dest: 'src/html/hotspots/', rename: function(dir) { return dir+"hotspot-1.html"; } },
					{ expand: true, src: ['src/html/hotspot-source.html'], dest: 'src/html/hotspots/', rename: function(dir) { return dir+"hotspot-2.html"; } },
					{ expand: true, src: ['src/html/hotspot-source.html'], dest: 'src/html/hotspots/', rename: function(dir) { return dir+"hotspot-3.html"; } },
					{ expand: true, src: ['src/html/hotspot-source.html'], dest: 'src/html/hotspots/', rename: function(dir) { return dir+"hotspot-4.html"; } }
				]
			},
			'html': {
				files: [{
					expand: true,
					cwd: 'src/html', 
					src: ['**', '!hotspot-source.html'],
					dest: 'deploy/html'
				}]
			},
			'plugins': {
				files: [{
					expand: true,
					cwd: 'src/plugins', 
					src: ['**'],
					dest: 'deploy/plugins'
				}]
			},
			'images': {
				files: [{
					expand: true,
					cwd: 'src/img',
					src: ['**'],
					dest: 'deploy/img'
				}]
			},
			'fonts': {
				files: [{
					expand: true,
					cwd: 'src/fonts',
					src: ['**'],
					dest: 'deploy/fonts'
				}]
			}
		},
		'regex-replace': {
			'app-info': {
				src: ['deploy/manifest.json', 'deploy/README.md'],
				actions: [
					{
						name: 'appName',
						search: 'APP_NAME',
						replace: '<%= pkg.name %>',
						flags: 'g'
					},
					{
						name: 'appVersion',
						search: 'APP_VERSION',
						replace: '<%= pkg.version %>',
						flags: 'g'
					},
					{
						name: 'appAuthor',
						search: 'APP_AUTHOR',
						replace: '<%= pkg.author %>',
						flags: 'g'
					},
					{
						name: 'appAuthorContact',
						search: 'APP_CONTACT',
						replace: '<%= pkg.contact %>',
						flags: 'g'
					},
					{
						name: 'appDescription',
						search: 'APP_DESCRIPTION',
						replace: '<%= pkg.description %>',
						flags: 'g'
					},
				]
			},
			'html-hotspots': {
				src: ['src/html/hotspots/*.html'],
				actions: [
					{
						name: 'hotspotNum',
						search: 'HOTSPOT_NUM',
						replace: hotspotCounter,
						flags: 'g'
					}
				]
			}
		},
		uglify: {
			'project-console': {
				options: {
					banner: '/*! <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) */\n' + 
						'/*! by <%= pkg.author %> */\n',
					compress: {
						drop_console: false
					},
					mangle: false,
					preserveComments: false
				},
				files: [{
					expand: true,
					cwd: 'src/js',
					src: '*.js',
					dest: 'deploy/js'
				}]
			},
			'project-noconsole': {
				options: {
					banner: '/*! <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) */\n' + 
						'/*! by <%= pkg.author %> */\n',
					compress: {
						drop_console: true
					},
					mangle: false,
					preserveComments: false
				},
				files: [{
					expand: true,
					cwd: 'src/js',
					src: '*.js',
					dest: 'deploy/js'
				}]
			},
			'lib': {
				options: {
					compress: {
						drop_console: true
					},
					preserveComments: 'some'
				},
				files: [{
					expand: true,
					cwd: 'src/js/lib',
					src: '*.js',
					dest: 'deploy/js/lib'
				}]
			}
		},
		cssmin: {
			'project': {
				options: {
					banner: '/*! <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) */\n' + 
						'/*! by <%= pkg.author %> */',
				},
				files: [{
					expand: true,
					cwd: 'src/css',
					src: ['**/*.css'],
					dest: 'deploy/css'
				}]
			}
		},
		compress: {
			main: {
				options: {
					archive: 'gamereye-trainer_<%= pkg.version %>.zip',
					mode: 'zip',
					pretty: true
				},
				files: [{
					expand: true,
					cwd: 'deploy',
					src: ['**/*']
				}]
			}
		}
	});

	//plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-regex-replace');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-compress');

	//commands - internal only
	grunt.registerTask('deploy-copy', ['copy:package-items', 'copy:html', 'copy:plugins', 'copy:images', 'copy:fonts']);

	//commands - for deployment
	grunt.registerTask('build-deploy', [
		'clean', //wipe
		'sass', 'copy:html-hotspots', 'regex-replace:html-hotspots', //compile
		'deploy-copy', //copy to deploy
		'regex-replace:app-info', //fix deploy manifest
		'uglify:project-noconsole', 'uglify:lib', 'cssmin' //compress
	]);
	grunt.registerTask('zip', ['compress']);

	//commands - for development
	grunt.registerTask('build-dev', [
		'clean', //wipe
		'sass', 'copy:html-hotspots', 'regex-replace:html-hotspots', //compile
		'deploy-copy', //copy to deploy
		'regex-replace:app-info', //fix deploy manifest
		'uglify:project-console', 'uglify:lib', 'cssmin' //compress
	]);
	grunt.registerTask('js', ['uglify:project-console', 'uglify:lib']);
	grunt.registerTask('css', ['clean:css', 'sass', 'cssmin']);
	grunt.registerTask('html', ['copy:html-hotspots', 'regex-replace:html-hotspots', 'copy:html']);

	//commands - DEFAULT
	grunt.registerTask('default', ['build-deploy']);
};