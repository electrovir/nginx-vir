import {assert} from '@augment-vir/assert';
import {emptyLog, ensureError, log as logImport, type MaybePromise} from '@augment-vir/common';
import {readAllDirContents} from '@augment-vir/node';
import {
    assertTestContext,
    describe,
    RuntimeEnv,
    snapshotCasesWithContext,
    type UniversalTestContext,
} from '@augment-vir/test';
import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {join, relative} from 'node:path';
import {notCommittedDirPath, sanitizePaths} from '../paths.mock.js';
import {createNginxSite} from './create-site.js';

const createSiteTestDir = join(notCommittedDirPath, 'create-site-tests');

describe(createNginxSite.name, () => {
    async function testCreateNginxSite(
        testContext: UniversalTestContext,
        siteEnabled: boolean,
        callback?: ((nginxDirPath: string) => MaybePromise<void>) | undefined,
        log?: typeof logImport,
    ) {
        try {
            assertTestContext(testContext, RuntimeEnv.Node);
            const nginxDirPath = join(createSiteTestDir, testContext.name);

            if (callback) {
                await callback(nginxDirPath);
            } else {
                await rm(nginxDirPath, {recursive: true, force: true});
            }

            const {outputPath, siteString} = await createNginxSite(
                {
                    siteName: 'test-site',
                    enabled: siteEnabled,
                    config: [],
                },
                {
                    nginxDirPath,
                    ...(log ? {log} : {}),
                },
            );

            const writtenContents = String(await readFile(outputPath));

            assert.strictEquals(siteString, writtenContents);

            return {
                path: relative(notCommittedDirPath, outputPath),
                contents: await readAllDirContents(nginxDirPath, {
                    recursive: true,
                }),
            };
        } catch (caught) {
            const error = ensureError(caught);
            error.message = sanitizePaths(error.message);
            throw error;
        }
    }

    snapshotCasesWithContext(testCreateNginxSite, [
        {
            it: 'supports an empty logger',
            inputs: [
                true,
                undefined,
                emptyLog,
            ],
        },
        {
            it: 'does not enable the site',
            inputs: [
                false,
                undefined,
                emptyLog,
            ],
        },
        {
            it: 'fails if the site already exists',
            inputs: [
                true,
                async (nginxDirPath) => {
                    await mkdir(join(nginxDirPath, 'sites-available'), {recursive: true});
                    await writeFile(join(nginxDirPath, 'sites-available', 'test-site'), '# empty');
                },
            ],
        },
    ]);
});
