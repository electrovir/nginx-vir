import {emptyLog} from '@augment-vir/common';
import {readAllDirContents} from '@augment-vir/node';
import {
    assertTestContext,
    describe,
    RuntimeEnv,
    snapshotCasesWithContext,
    type UniversalTestContext,
} from '@augment-vir/test';
import {mkdir, readdir, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {notCommittedDirPath, sanitizeContents} from '../paths.mock.js';
import {
    createSelfSignedHttpsNginxSite,
    createSelfSignedSslCertificate,
    SslCertificateParams,
} from './https-site.js';

describe(createSelfSignedSslCertificate.name, () => {
    async function testCreateSelfSignedSslCertificate(
        testContext: UniversalTestContext,
        sslParams: Readonly<Omit<SslCertificateParams, 'outputPaths'>>,
    ) {
        assertTestContext(testContext, RuntimeEnv.Node);
        const nginxDirPath = join(notCommittedDirPath, 'create-cert-test', testContext.name);
        await rm(nginxDirPath, {recursive: true, force: true});
        await mkdir(join(nginxDirPath, 'ssl'), {recursive: true});

        await createSelfSignedSslCertificate(
            {siteName: 'test-site', nginxDirPath},
            {
                ...sslParams,
                outputPaths: {
                    certificate: join(nginxDirPath, 'ssl', 'cert.crt'),
                    dhParam: join(nginxDirPath, 'ssl', 'dh-params.pem'),
                    key: join(nginxDirPath, 'ssl', 'key.key'),
                },
            },
        );

        return readdir(nginxDirPath, {recursive: true});
    }

    snapshotCasesWithContext(testCreateSelfSignedSslCertificate, [
        {
            it: 'uses defaults',
            input: {},
        },
        {
            it: 'uses ssl params',
            input: {
                cityName: 'some city',
                countryCode: 'US',
                days: 1,
                organizationalUnitName: 'some unit',
                organizationName: 'blob',
                stateName: 'Maine',
                websiteHostname: 'example.com',
            },
        },
    ]);
});

describe(createSelfSignedHttpsNginxSite.name, () => {
    async function testCreateSelfSignedHttpsNginxSite(testContext: UniversalTestContext) {
        assertTestContext(testContext, RuntimeEnv.Node);
        const nginxDirPath = join(notCommittedDirPath, 'http-site-test', testContext.name);
        await rm(nginxDirPath, {recursive: true, force: true});
        await mkdir(join(nginxDirPath, 'ssl'), {recursive: true});

        await createSelfSignedHttpsNginxSite(
            {
                enabled: true,
                locations: [],
                siteName: 'test-site',
            },
            {
                outputPaths: {
                    certificate: join(nginxDirPath, 'ssl', 'cert.crt'),
                    dhParam: join(nginxDirPath, 'ssl', 'dh-params.pem'),
                    key: join(nginxDirPath, 'ssl', 'key.key'),
                },
            },
            {
                log: emptyLog,
                nginxDirPath,
            },
        );

        return {
            files: await readdir(nginxDirPath, {recursive: true}),
            contents: sanitizeContents(
                await readAllDirContents(nginxDirPath, {
                    recursive: true,
                    excludeList: ['ssl'],
                }),
            ),
        };
    }

    snapshotCasesWithContext(testCreateSelfSignedHttpsNginxSite, [
        {
            it: 'runs',
        },
    ]);
});
