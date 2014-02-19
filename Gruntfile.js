module.exports = function(grunt) {

  grunt.initConfig({

    bump: {
      options: {
        files: ['bower.json', 'highchartTable.jquery.json', 'package.json'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['bower.json', 'highchartTable.jquery.json', 'package.json'],
        createTag: true,
        tagName: '%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false
      }
    }

  });
  grunt.loadNpmTasks('grunt-bump');

};
