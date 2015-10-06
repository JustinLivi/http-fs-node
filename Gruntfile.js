module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Add the grunt-mocha-test tasks.
  [
    'grunt-mocha-test'
    // add watch tasks
  ]
  .forEach( grunt.loadNpmTasks );

  grunt.initConfig({
    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: 'coverage/blanket'
        },
        src: ['test/**/*.js' ]
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          // use the quiet flag to suppress the mocha console output
          quiet: true,
          // specify a destination file to capture the mocha
          // output (the quiet option does not suppress this)
          captureFile: 'coverage/codeCoverage.html',
        },
        src: ['test/**/*.js' ]
      }
    },

    eslint: {
        target: ['src/**/*.js']
    }
  });

  grunt.registerTask( 'default' , [ 'eslint' , 'mochaTest' ]);
};
