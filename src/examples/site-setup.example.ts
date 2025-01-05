import {createSelfSignedHttpsNginxSite} from '../index.js';

await createSelfSignedHttpsNginxSite({
    enabled: true,
    locations: [
        {
            type: 'location',
            uri: '/',
            children: [
                {
                    type: 'proxy_pass',
                    url: 'http://localhost:3000',
                },
            ],
        },
    ],
    siteName: 'my-site',
});
