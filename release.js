'use strict';

const builder = require('electron-builder');
const Platform = builder.Platform;

builder.build({
    targets: Platform.MAC.createTarget(),
    config: {
        'appId': 'net.hirohisa.jukeboks',
        'productName': 'Jukeboks',
        'icon': './assets/app.icns',
        'mac': {
            'target': 'zip',
        },
        extraFiles: ["app/bin/jukeboks"],
        files: ["src/**/*"]
    },
});