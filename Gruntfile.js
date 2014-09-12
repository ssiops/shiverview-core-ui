/* jshint node: true */

module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    target: 'dist',
    banner: '/**\n' +
              '* <%= pkg.name %> v<%= pkg.version %>\n' +
              '* by <%= pkg.author %>\n' +
              '*/\n',

    // Before generating any new files,
    // remove any previously-created files.
    clean: {
      static: ['<%= target %>']
    },

    jshint: {
      options: {
        jshintrc: './.jshintrc'
      },
      gruntfile: {
        src: './Gruntfile.js'
      },
      front: {
        src: ['./js/**/*.js']
      },
      back: {
        src: ['./index.js', './routes.js', './lib/*.js', './routes/*.js']
      }
    },

    concat: {
      application: {
        src: ['./js/application/*.js'],
        dest: '<%= target %>/js/application.js',
      },
      controllers: {
        src: ['./js/controllers/*.js'],
        dest: '<%= target %>/js/controllers.js',
      }
    },

    uglify: {
      application: {
        options: {
          sourceMap: true
        },
        files: [{
          src: ['<%= concat.application.dest %>', '<%= concat.controllers.dest %>'],
          dest: '<%= target %>/js/',
          expand: true,
          flatten: true,
          ext: '.min.js'
        }]
      }
    },

    less: {
      options: {
        compile: true
      },
      dist: {
        options: {
          compress: true,
          sourceMap: true,
          sourceMapFilename: '<%= target %>/css/main.min.css.map',
          sourceMapURL: 'main.min.css.map',
          outputSourceFiles: true
        },
        files: {
          '<%= target %>/css/main.min.css' : 'less/main.less'
        }
      }
    },

    copy: {
      static: {
        expand: true,
        cwd: './static',
        src: '**',
        dest: '<%= target %>'
      }
    },

    wiredep: {
      dist: {
        src: ['./static/index.html'],
        options: {
          cwd: '',
          dependencies: true,
          devDependencies: false,
          exclude: ['es5-shim', 'json3', 'bootstrap.js', 'jquery'],
          fileTypes: {},
          ignorePath: '',
          overrides: {}
        }
      }
    },

    watch: {
      src: {
        files: '<%= jshint.front.src %>',
        tasks: ['jshint:front', 'concat', 'uglify:application']
      },
      less: {
        files: ['./less/**/*.less'],
        tasks: ['less']
      },
      static: {
        files: './static/**',
        tasks: ['copy']
      },
      options: {
        livereload: 9001
      }
    },

    connect: {
      server: {
        options: {
          port: 9000,
          hostname: '0.0.0.0',
          base: '<%= target %>',
          livereload: 9001
        }
      }
    }
  });

  // Load npm plugins to provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-wiredep');

  grunt.registerTask('build', ['less', 'concat', 'uglify', 'wiredep']);

  grunt.registerTask('default', ['clean', 'build']);

  grunt.registerTask('dev', ['default', 'watch']);

  grunt.registerTask('test', ['jshint', 'build']);

  grunt.registerTask('make', ['clean', 'jshint', 'build', 'copy']);

  grunt.registerTask('serve', ['make', 'connect', 'watch']);
};
