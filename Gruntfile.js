module.exports = function(grunt) {
var port = grunt.option('port') || 3700;
  // 專案設定
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // within grunt.initConfig
    nodemon: {
        dev: {
            options: {
                nodeArgs: ['--port', port]
            }
        }
    },
    concat: {
      options: {
        sourceMap :true
      },
      dist: {
        src: [
            'dev/assets/js/lib/socket.io.min.js',
            'dev/assets/js/lib/handlebarsjs.1.0.min.js',
            'dev/assets/js/app.js'
        ],
        dest: '.tmp/build.js'
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapIncludeSources: true,
        sourceMapIn: '.tmp/build.js.map'
      },
      build: {
        src: '<%= concat.dist.dest %>',
        dest: 'public/assets/js/build.min.js'
      }
    },
    jade: {
      compile: {
        options: {
          data: {
            debug: false
          }
        },
        files: [
          {
            cwd: "dev",
            src: "*.jade",
            dest: "views",
            expand: true,
            ext: ".html"
          },
          {
            cwd: "dev/wall",
            src: "*.jade",
            dest: "views/wall",
            expand: true,
            ext: ".html"
          }
        ]
      }
    },
    sass: {
      options: {
        style: 'compressed'
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'dev/assets/sass',
          src: '*.scss',
          dest: 'public/assets/css',
          ext: '.css'
        }]
      }
    },
    watch: {
      js: {
        files: [
          'dev/assets/js/*.js',
          'dev/*.jade',
          'dev/wall/*.jade',
          'dev/assets/sass/*.scss'
          ],
        tasks: ['default']
      },
      options: {
        // Sets livereload to true for livereload to work 
        // (livereload is not covered in this article)
        livereload: true,
        spawn: false
      }
    }
  });

  // 載入可以提供 uglify task 的 plugin
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // 預設的 task
  grunt.registerTask('default', ['sass','jade','concat','uglify']);
  grunt.registerTask('dev', [
    'watch'
    ]);

};