import {check} from '@augment-vir/assert';
import {
    log,
    log as logImport,
    PartialWithUndefined,
    RequiredAndNotNull,
    wrapString,
} from '@augment-vir/common';
import {runShellCommand, systemRootPath} from '@augment-vir/node';
import {mkdir} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {type NginxBlockByType, type NginxBlockTypesWithContext} from '../blocks/nginx-blocks.js';
import {defaultNginxDirPath} from '../paths.js';
import {createNginxSite} from './create-site.js';
import {type NginxSite} from './nginx-site.js';

/**
 * Static blocks used when creating an HTTPS site.
 *
 * @category Internal
 */
export const defaultHttpsSiteBlocks = {
    httpsListen: [
        /** IPv4 */
        {
            type: 'listen',
            values: [
                '443',
                'ssl',
            ],
        },
        /** IPv6 */
        {
            type: 'listen',
            values: [
                '[::]:443',
                'ssl',
            ],
        },
    ] satisfies NginxBlockTypesWithContext<'server'>[],

    httpUpgradeServer: {
        type: 'server',
        children: [
            /** IPv4 */
            {
                type: 'listen',
                values: ['80'],
            },
            /** IPv6 */
            {
                type: 'listen',
                values: ['[::]:80'],
            },
            /** Upgrade to HTTPS */
            {
                type: 'return',
                code: 301,
                url: 'https://$host$request_uri',
            },
        ],
    } satisfies NginxBlockByType<'server'>,

    sslParams: [
        {
            type: 'ssl_protocols',
            protocols: ['TLSv1.3'],
        },
        {
            type: 'ssl_prefer_server_ciphers',
            enabled: true,
        },
        {
            type: 'ssl_ecdh_curve',
            curves: ['secp384r1'],
        },
        {
            type: 'ssl_session_timeout',
            time: '10m',
        },
        {
            type: 'ssl_session_cache',
            values: ['shared:SSL:10m'],
        },
        {
            type: 'ssl_session_tickets',
            enabled: false,
        },
        {
            type: 'ssl_stapling',
            enabled: true,
        },
        {
            type: 'ssl_stapling_verify',
            enabled: true,
        },
        {
            type: 'add_header',
            name: 'X-Frame-Options',
            value: 'DENY',
        },
        {
            type: 'add_header',
            name: 'X-Content-Type-Options',
            value: 'nosniff',
        },
        {
            type: 'add_header',
            name: 'X-XSS-Protection',
            value: '"1; mode=block"',
        },
    ] satisfies NginxBlockTypesWithContext<'server'>[],
};

/**
 * Creates:
 *
 * - A self signed SSL certificate
 * - A new Nginx website which uses that certificate
 *
 * Make sure to remember to restart nginx (`sudo systemctl restart nginx`) after adding a site.
 *
 * This will likely require sudo permissions if run with the default nginx dir (`/etc/nginx/`).
 *
 * @category Site Control
 */
export async function createSelfSignedHttpsNginxSite(
    site: Readonly<Omit<NginxSite, 'config'>> &
        Readonly<{
            locations: ReadonlyArray<Readonly<NginxBlockByType<'location'>>>;
        }>,
    sslParams: Readonly<SslCertificateParams> = {},
    {
        nginxDirPath = defaultNginxDirPath,
        log = logImport,
    }: Partial<{
        /** @default '/etc/nginx/' */
        nginxDirPath: string;
        log: typeof logImport;
    }> = {},
) {
    const certPaths = await createSelfSignedSslCertificate(
        {
            siteName: site.siteName,
            nginxDirPath,
        },
        sslParams,
    );

    log.faint(`Key written to      : '${certPaths.key}'`);
    log.faint(`Cert written to     : '${certPaths.certificate}'`);
    log.faint(`DH Params written to: '${certPaths.dhParam}'`);

    const sslBlocks: NginxBlockTypesWithContext<'server'>[] = [
        {
            type: 'ssl_certificate',
            file: certPaths.certificate,
        },
        {
            type: 'ssl_certificate_key',
            file: certPaths.key,
        },
    ];

    const siteConfig: NginxSite['config'] = [
        {
            type: 'server',
            children: [
                ...defaultHttpsSiteBlocks.httpsListen,
                ...sslBlocks,
                ...defaultHttpsSiteBlocks.sslParams,
                {
                    type: 'ssl_dhparam',
                    file: certPaths.dhParam,
                },

                ...site.locations,
            ],
        },
        defaultHttpsSiteBlocks.httpUpgradeServer,
    ];

    await createNginxSite(
        {
            config: siteConfig,
            enabled: site.enabled,
            siteName: site.siteName,
        },
        {
            log,
            nginxDirPath,
        },
    );
}

/**
 * Params used for creating an SSL certificate for HTTPS websites.
 *
 * @category Internal
 */
export type SslCertificateParams = PartialWithUndefined<{
    /**
     * How many days the SSL certificate is valid for.
     *
     * @default 365
     */
    days: number;
    /**
     * 2 letter country code for the SSL certificate.
     *
     * @default 'US'
     */
    countryCode: string;
    /** Full state name for the SSL certificate. */
    stateName: string;
    /** Full city name. */
    cityName: string;
    /** Company or organization name for the SSL certificate. */
    organizationName: string;
    /** Company unit name, like a department name for the SSL certificate. */
    organizationalUnitName: string;
    /**
     * Your website's Fully Qualified Domain Name or Hostname for the SSL certificate.
     *
     * @example 'example.com'
     */
    websiteHostname: string;

    /** Customized certificate output paths. */
    outputPaths: PartialWithUndefined<{
        /**
         * The generated private SSL key.
         *
         * @default `/etc/ssl/private/nginx-self-signed-${siteName}.key`
         */
        key: string;
        /**
         * The generated SSL certificate.
         *
         * @default `/etc/ssl/certs/nginx-self-signed-${siteName}.crt`
         */
        certificate: string;
        /**
         * The generated DH Parameters for Nginx.
         *
         * @default `${nginxDirPath}/dh-params/dh-param-${siteName}.pem`
         */
        dhParam: string;
    }>;
}>;

/**
 * Creates and stores a self-signed SSL certificate. This outputs a key, a certificate, and DH
 * Parameters for Nginx.
 *
 * @category Internal
 */
export async function createSelfSignedSslCertificate(
    {
        nginxDirPath,
        siteName,
    }: {
        siteName: string;
        nginxDirPath: string;
    },
    sslParams: Readonly<SslCertificateParams> = {},
): Promise<RequiredAndNotNull<RequiredAndNotNull<SslCertificateParams>['outputPaths']>> {
    /* node:coverage ignore next 11: we can't test writing to /etc */
    const keyPath =
        sslParams.outputPaths?.key ||
        join(systemRootPath, 'etc', 'ssl', 'private', `nginx-self-signed-${siteName}.key`);

    const certPath =
        sslParams.outputPaths?.certificate ||
        join(systemRootPath, 'etc', 'ssl', 'certs', `nginx-self-signed-${siteName}.crt`);

    const dhParamsPath =
        sslParams.outputPaths?.dhParam ||
        join(nginxDirPath, 'dh-params', `dh-param-${siteName}.pem`);

    await Promise.all(
        [
            keyPath,
            certPath,
            dhParamsPath,
        ].map(async (path) => {
            await mkdir(dirname(path), {recursive: true});
        }),
    );

    const subject = {
        C: sslParams.countryCode || 'US',
        ST: sslParams.stateName || '.',
        L: sslParams.cityName || '.',
        O: sslParams.organizationName || '.',
        OU: sslParams.organizationalUnitName || '.',
        CN: sslParams.websiteHostname || '.',
    };

    const subjectString =
        '/' +
        Object.entries(subject)
            .map((entry) => entry.join('='))
            .join('/');

    const createCertCommand = [
        'openssl',
        'req',
        '-x509',
        '-nodes',
        '-days',
        sslParams.days || 365,
        '-newkey',
        'rsa:2048',
        '-keyout',
        wrapString({value: keyPath, wrapper: "'"}),
        '-out',
        wrapString({value: certPath, wrapper: "'"}),
        '-subj',
        wrapString({value: subjectString, wrapper: "'"}),
    ]
        .filter(check.isTruthy)
        .join(' ');

    log.faint(`> ${createCertCommand}`);

    await runShellCommand(createCertCommand, {
        rejectOnError: true,
    });

    const createDhParamCommand = [
        'openssl',
        'dhparam',
        '-dsaparam',
        '-out',
        wrapString({value: dhParamsPath, wrapper: "'"}),
        '4096',
    ]
        .filter(check.isTruthy)
        .join(' ');

    log.faint(`> ${createDhParamCommand}`);

    await runShellCommand(createDhParamCommand, {
        rejectOnError: true,
    });

    return {
        certificate: certPath,
        dhParam: dhParamsPath,
        key: keyPath,
    };
}
