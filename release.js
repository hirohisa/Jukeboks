'use strict';

const builder = require('electron-builder');
const Platform = builder.Platform;
// const fs = require('fs');
// const packagejson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

builder.build({
    targets: Platform.MAC.createTarget(),
    config: {
        'appId': 'net.hirohisa.jukeboks',
        'productName': 'Jukeboks',
        'icon': './assets/app.icns',
        'mac': {
            'target': 'zip',
        },
    },
});