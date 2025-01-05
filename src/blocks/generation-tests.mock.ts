import {HttpStatus, type AtLeastTuple} from '@augment-vir/common';
import {NginxBlockType, type NginxBlockByType} from './nginx-blocks.js';

export const generationTests: {
    [TypeName in NginxBlockType]: AtLeastTuple<
        {
            block: NginxBlockByType<TypeName>;
            generated: string;
        },
        1
    >;
} = {
    access_log: [
        {
            block: {
                type: 'access_log',
                values: ['/var/log/nginx/access.log'],
            },
            generated: 'access_log /var/log/nginx/access.log;',
        },
    ],
    add_header: [
        {
            block: {
                type: 'add_header',
                name: 'X-XSS-Protection',
                value: '"1; mode=block"',
            },
            generated: 'add_header X-XSS-Protection "1; mode=block";',
        },
        {
            block: {
                type: 'add_header',
                name: 'name',
                value: 'value',
                always: true,
            },
            generated: 'add_header name value always;',
        },
    ],
    auth_basic: [
        {
            block: {
                type: 'auth_basic',
                value: '"Restricted Content"',
            },
            generated: 'auth_basic "Restricted Content";',
        },
    ],
    auth_basic_user_file: [
        {
            block: {
                type: 'auth_basic_user_file',
                file: '/etc/nginx/.ht_passwd',
            },
            generated: 'auth_basic_user_file /etc/nginx/.ht_passwd;',
        },
    ],
    default_type: [
        {
            block: {
                type: 'default_type',
                mimeType: 'application/octet-stream',
            },
            generated: 'default_type application/octet-stream;',
        },
    ],
    error_log: [
        {
            block: {
                type: 'error_log',
                file: '/var/log/nginx/error.log',
            },
            generated: 'error_log /var/log/nginx/error.log;',
        },
        {
            block: {
                type: 'error_log',
                file: '/var/log/nginx/error.log',
                level: 'debug',
            },
            generated: 'error_log /var/log/nginx/error.log debug;',
        },
    ],
    events: [
        {
            block: {
                type: 'events',
                children: [
                    {
                        type: 'worker_connections',
                        count: 768,
                    },
                ],
            },
            generated: `events {
                worker_connections 768;
            }`,
        },
    ],
    gzip: [
        {
            block: {
                type: 'gzip',
                enabled: true,
            },
            generated: 'gzip on;',
        },
        {
            block: {
                type: 'gzip',
                enabled: false,
            },
            generated: 'gzip off;',
        },
    ],
    http: [
        {
            block: {
                type: 'http',
                children: [
                    {
                        type: 'server',
                        children: [
                            {
                                type: 'listen',
                                values: [
                                    '443',
                                    'ssl',
                                ],
                            },
                            {
                                type: 'location',
                                uri: '/dev',
                                children: [
                                    {
                                        type: 'proxy_pass',
                                        url: 'http://localhost:3001',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            generated: `http {
                server {
                    listen 443 ssl;
                    location /dev {
                        proxy_pass http://localhost:3001;
                    }
                }
            }`,
        },
    ],
    include: [
        {
            block: {
                type: 'include',
                file: '/etc/nginx/sites-enabled/*',
            },
            generated: 'include /etc/nginx/sites-enabled/*;',
        },
    ],
    listen: [
        {
            block: {
                type: 'listen',
                values: [
                    '[::]:443',
                    'ssl',
                ],
            },
            generated: 'listen [::]:443 ssl;',
        },
    ],
    load_module: [
        {
            block: {
                type: 'load_module',
                file: 'modules/ngx_mail_module.so',
            },
            generated: 'load_module modules/ngx_mail_module.so;',
        },
    ],
    location: [
        {
            block: {
                type: 'location',
                uri: '/dev',
                children: [
                    {
                        type: 'proxy_pass',
                        url: 'http://localhost:3001',
                    },
                ],
            },
            generated: `location /dev {
                proxy_pass http://localhost:3001;
            }`,
        },
    ],
    main: [
        {
            block: {
                type: 'main',
                children: [
                    {
                        type: 'http',
                        children: [
                            {
                                type: 'server',
                                children: [
                                    {
                                        type: 'listen',
                                        values: [
                                            '443',
                                            'ssl',
                                        ],
                                    },
                                    {
                                        type: 'location',
                                        uri: '/dev',
                                        children: [
                                            {
                                                type: 'proxy_pass',
                                                url: 'http://localhost:3001',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            generated: `http {
                server {
                    listen 443 ssl;
                    location /dev {
                        proxy_pass http://localhost:3001;
                    }
                }
            }`,
        },
    ],
    pid: [
        {
            block: {
                type: 'pid',
                file: '/run/nginx.pid',
            },
            generated: 'pid /run/nginx.pid;',
        },
    ],
    proxy_pass: [
        {
            block: {
                type: 'proxy_pass',
                url: 'http://localhost:3001',
            },
            generated: 'proxy_pass http://localhost:3001;',
        },
    ],
    proxy_set_header: [
        {
            block: {
                type: 'proxy_set_header',
                name: 'Upgrade',
                value: '$http_upgrade',
            },
            generated: 'proxy_set_header Upgrade $http_upgrade;',
        },
    ],
    return: [
        {
            block: {
                type: 'return',
                code: HttpStatus.MovedPermanently,
                url: 'https://$host$request_uri',
            },
            generated: 'return 301 https://$host$request_uri;',
        },
        {
            block: {
                type: 'return',
                url: 'https://$host$request_uri',
            },
            generated: 'return https://$host$request_uri;',
        },
        {
            block: {
                type: 'return',
                code: HttpStatus.Ok,
                text: 'stuff',
            },
            generated: 'return 200 stuff;',
        },
    ],
    sendfile: [
        {
            block: {
                type: 'sendfile',
                enabled: true,
            },
            generated: 'sendfile on;',
        },
        {
            block: {
                type: 'sendfile',
                enabled: false,
            },
            generated: 'sendfile off;',
        },
    ],
    server: [
        {
            block: {
                type: 'server',
                children: [
                    {
                        type: 'listen',
                        values: [
                            '443',
                            'ssl',
                        ],
                    },
                    {
                        type: 'location',
                        uri: '/dev',
                        children: [
                            {
                                type: 'proxy_pass',
                                url: 'http://localhost:3001',
                            },
                        ],
                    },
                ],
            },
            generated: `server {
                listen 443 ssl;
                location /dev {
                    proxy_pass http://localhost:3001;
                }
            }`,
        },
    ],
    ssl_certificate: [
        {
            block: {
                type: 'ssl_certificate',
                file: '/etc/ssl/certs/nginx-self-signed.crt',
            },
            generated: 'ssl_certificate /etc/ssl/certs/nginx-self-signed.crt;',
        },
    ],
    ssl_certificate_key: [
        {
            block: {
                type: 'ssl_certificate_key',
                file: '/etc/ssl/private/nginx-self-signed.key',
            },
            generated: 'ssl_certificate_key /etc/ssl/private/nginx-self-signed.key;',
        },
    ],
    ssl_ciphers: [
        {
            block: {
                type: 'ssl_ciphers',
                ciphers: [
                    'EECDH+AESGCM',
                    'EDH+AESGCM',
                ],
            },
            generated: 'ssl_ciphers EECDH+AESGCM:EDH+AESGCM;',
        },
    ],
    ssl_dhparam: [
        {
            block: {
                type: 'ssl_dhparam',
                file: '/etc/nginx/dhparam.pem',
            },
            generated: 'ssl_dhparam /etc/nginx/dhparam.pem;',
        },
    ],
    ssl_ecdh_curve: [
        {
            block: {
                type: 'ssl_ecdh_curve',
                curves: ['secp384r1'],
            },
            generated: 'ssl_ecdh_curve secp384r1;',
        },
    ],
    ssl_prefer_server_ciphers: [
        {
            block: {
                type: 'ssl_prefer_server_ciphers',
                enabled: true,
            },
            generated: 'ssl_prefer_server_ciphers on;',
        },
        {
            block: {
                type: 'ssl_prefer_server_ciphers',
                enabled: false,
            },
            generated: 'ssl_prefer_server_ciphers off;',
        },
    ],
    ssl_protocols: [
        {
            block: {
                type: 'ssl_protocols',
                protocols: [
                    'TLSv1.1',
                    'TLSv1.2',
                    'TLSv1.3',
                ],
            },
            generated: 'ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;',
        },
    ],
    ssl_session_cache: [
        {
            block: {
                type: 'ssl_session_cache',
                values: [
                    'shared:SSL:10m',
                ],
            },
            generated: 'ssl_session_cache shared:SSL:10m;',
        },
    ],
    ssl_session_tickets: [
        {
            block: {
                type: 'ssl_session_tickets',
                enabled: true,
            },
            generated: 'ssl_session_tickets on;',
        },
        {
            block: {
                type: 'ssl_session_tickets',
                enabled: false,
            },
            generated: 'ssl_session_tickets off;',
        },
    ],
    ssl_session_timeout: [
        {
            block: {
                type: 'ssl_session_timeout',
                time: '10m',
            },
            generated: 'ssl_session_timeout 10m;',
        },
    ],
    ssl_stapling: [
        {
            block: {
                type: 'ssl_stapling',
                enabled: true,
            },
            generated: 'ssl_stapling on;',
        },
        {
            block: {
                type: 'ssl_stapling',
                enabled: false,
            },
            generated: 'ssl_stapling off;',
        },
    ],
    ssl_stapling_verify: [
        {
            block: {
                type: 'ssl_stapling_verify',
                enabled: true,
            },
            generated: 'ssl_stapling_verify on;',
        },
        {
            block: {
                type: 'ssl_stapling_verify',
                enabled: false,
            },
            generated: 'ssl_stapling_verify off;',
        },
    ],
    tcp_nopush: [
        {
            block: {
                type: 'tcp_nopush',
                enabled: true,
            },
            generated: 'tcp_nopush on;',
        },
        {
            block: {
                type: 'tcp_nopush',
                enabled: false,
            },
            generated: 'tcp_nopush off;',
        },
    ],
    types_hash_max_size: [
        {
            block: {
                type: 'types_hash_max_size',
                size: 2048,
            },
            generated: 'types_hash_max_size 2048;',
        },
    ],
    user: [
        {
            block: {
                type: 'user',
                user: 'www-data',
            },
            generated: 'user www-data;',
        },
        {
            block: {
                type: 'user',
                user: 'www-data',
                group: 'group',
            },
            generated: 'user www-data group;',
        },
    ],
    worker_connections: [
        {
            block: {
                type: 'worker_connections',
                count: 768,
            },
            generated: 'worker_connections 768;',
        },
    ],
    worker_processes: [
        {
            block: {
                type: 'worker_processes',
                count: 'auto',
            },
            generated: 'worker_processes auto;',
        },
    ],
};
