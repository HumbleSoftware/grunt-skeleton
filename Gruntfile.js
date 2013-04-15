var path = require('path');
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var folderMount = function folderMount(connect, point) {
  return connect.static(path.resolve(point));
};

/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      vendor: {
        src: [
          'vendor/jquery*.js',
          'vendor/underscore*.js',
          'vendor/backbone*.js',
          'vendor/handlebars.runtime*.js'
        ],
        dest: 'dist/vendor.js'
      },
      'vendor-test-js': {
        src: [
          'vendor/mocha*.js',
          'vendor/chai*.js',
          'vendor/sinon*.js',
          'vendor/grunt-mocha-helper*.js'
        ],
        dest: 'dist/vendor-test.js'
      },
      'vendor-test-css': {
        src: [
          'vendor/mocha*.css'
        ],
        dest: 'dist/vendor-test.css'
      },
//      test: {
//        src: [
//          'test/**/*.js'
//        ],
//        dest: 'dist/test.js'
//      },
      src: {
        src: ['src/**/*.js'],
        dest: 'dist/src.js'
      },
//      dist: {
//        src: [
//          '<banner:meta.banner>',
//          'dist/src.js',
//          'dist/templates.js'
//        ],
//        dest: 'dist/<%= pkg.name %>.js'
//      }
    },
    copy: {
      main: {
        files: [
          { expand: true, cwd: 'src/assets', src: ['**'], dest: 'dist/' }
        ]
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      files: [
        'src/**/*',
        'test/**/*',
        'index.html'
      ],
      tasks: 'build reload'
    },
    uglify: {},
    connect: {
      livereload: {
        options: {
          port: 9001,
          base: 'dist/',
          middleware: function(connect, options) {
            return [lrSnippet, folderMount(connect, options.base)]
          }
        }
      }
    },
    regarde: {
      txt: {
        files: ['index.html', 'templates/**/*', 'src/**/*'],
        tasks: ['build', 'livereload']
      }
    },
    handlebars: {
      compile: {
        options: {
          wrapped: true,
          processName: function (name) {
            // strip src/templates/ and .hbs
            return name.split('/').slice(2).join('/').slice(0, -4);
          },
          namespace: ''
        },
        files: {
          'dist/templates.js': 'src/templates/**/*.hbs'
        }
      }
    },
    less: {
      development: {
        options: {
          // Scan for imports:
          // paths: ['assets/css']
        },
        files: {
          'dist/app.css': 'src/styles/**/*.less'
        }
      },
      production: {
        options: {
          // paths: ['assets/css'],
          yuicompress: true
        },
        files: {
          'dist/app.css': 'src/styles/**/*.less'
        }
      }
    },
    mocha: {
      index: ['test/index.html']
    },
    browserify: {
      app: {
        src: ['src/js/thing.js'],
        dest: 'dist/app.js'
      }
    }
  });

  // Load tasks:
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-regarde');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-livereload');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Custom tasks:
  grunt.registerTask('build', ['handlebars', 'less', 'browserify', 'concat', 'copy']);
  grunt.registerTask('test', 'build mocha');
  grunt.registerTask('default', ['livereload-start', 'connect', 'build', 'regarde']);
};
