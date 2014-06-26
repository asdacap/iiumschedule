
module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: false
            },
            build: {
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: "*.js",
                        dest: "static"
                    }
                ]
            }
        },
        jshint: {
            all: ['Gruntfile.js','src/*.js']
        }
    });


    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint','uglify']);

}
