const gulp = require('gulp'),
    bump = require('gulp-bump'),
    opts = {};

if (process.argv.length > 2) {

    // Process arguments for specific tasks only
    const argsFor = function(task) {
        return task === (process.argv[2] || '');
    }

    // process arguments for bump-version
    if (['bump-version'].some(argsFor)) {

        const argv = require('minimist')(process.argv.slice(2), {
            'alias': {
                't': 'type',
                'v': 'version'
            },
            'default': {
                'type': 'patch'
            },
            'string': ['type', 'version']
        });

        // create the opts, based on argv
        opts.type = argv.type;

        if (!argv.version && ['beta', 'alpha'].indexOf(opts.type) >= 0) {
            opts.preid = opts.type;
            opts.type = 'prerelease';
        } else if (argv.version) {
            opts.version = argv.version;
        }

    }

}

gulp.task('bump-version', function() {

    return gulp.src('./package.json')
        .pipe(bump(opts))
        .pipe(gulp.dest('./'));

});
