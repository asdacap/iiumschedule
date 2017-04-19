
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
                    },
                ]
            },
            with_mangle: {
                options: {
                    mangle: true
                },
                files: [{
                    expand: true,
                    cwd: "src/js",
                    src: "*.js",
                    dest: "static/js"
                }]
            }
        },
        jshint: {
            options: {
                shadow: true,
                loopfunc: true,
                reporterOutput: "",
            },
            all: ['Gruntfile.js','src/*.js','src/js/*.js',]
        },
        copy: {
            main: {
                expand: true,
                cwd: 'src/',
                src: '**',
                dest: 'static',
            }
        },
        watch: {
            script: {
                files: 'src/**',
                tasks: 'nomin'
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint','uglify']);
    grunt.registerTask('nomin', ['jshint','copy']);

};
