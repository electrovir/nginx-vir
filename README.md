# nginx-vir

A package for scripting some Nginx functionality.

See the docs: https://electrovir.github.io/nginx-vir

## Install

```sh
npm i nginx-vir
```

## Example usage

Here's an example script that can be used to setup a new Nginx website with self-signed SSL certificates for SSL:

<!-- example-link: src/examples/site-setup.example.ts -->

```TypeScript
import {createSelfSignedHttpsNginxSite} from 'nginx-vir';

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
```
