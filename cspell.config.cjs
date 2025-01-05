const {baseConfig} = require('@virmator/spellcheck/configs/cspell.config.base.cjs');

module.exports = {
    ...baseConfig,
    ignorePaths: [
        ...baseConfig.ignorePaths,
    ],
    words: [
        ...baseConfig.words,
        'aesgcm',
        'dsaparam',
        'emerg',
        'fastcgi',
        'geoip',
        'keyout',
        'keyval',
        'mgmt',
        'nopush',
        'nosniff',
        'perftools',
        'preread',
        'realip',
        'scgi',
        'secp',
        'uwsgi',
    ],
};
