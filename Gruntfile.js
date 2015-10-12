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
    
    uglify: {
      
      my_target: {
        files: {
          'public/assets/js/imageloaded.min.js': ['dev/assets/js/lib/imageloaded.js'],
          'public/assets/js/loader.js': ['dev/assets/js/loader.js'],
          'public/assets/js/lib/socket.io.min.js': ['dev/assets/js/lib/socket.io.min.js'],
          'public/assets/js/lib/masonry.pkgd.min.js': ['dev/assets/js/lib/masonry.pkgd.min.js'],
          'public/assets/js/all.js': ['dev/assets/js/all.js']
        
        }
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
          'dev/assets/sass/*.scss',
          'dev/assets/sass/**/*.scss'
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
  grunt.registerTask('default', ['sass','jade','uglify']);
  grunt.registerTask('dev', [
    'watch'
    ]);

};