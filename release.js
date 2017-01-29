var packager = require('electron-packager');
var config = require('./package.json');

packager({
    dir: './',
    out: '../dist',
    name: config.name,
    platform: 'darwin',
    arch: 'x64',
    version: '1.0.0',
    icon: './app.icns',

    'app-bundle-id': 'net.hirohisa.jukeboks',
    'app-version': config.version,
    'helper-bundle-id': 'net.hirohisa.jukeboks.app',

    overwrite: true,
    asar: true,
    prune: true,
    ignore: "node_modules/(electron-packager|electron-prebuilt|\.bin)|release\.js|app\.icns|static"
}, function done (err, appPath) {
    if(err) {
        throw new Error(err);
    }
    console.log('done');
});
