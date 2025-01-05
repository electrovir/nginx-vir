import {emptyLog, ensureError, MaybePromise, wrapInTry} from '@augment-vir/common';
import {readAllDirContents} from '@augment-vir/node';
import {
    assertTestContext,
    describe,
    RuntimeEnv,
    snapshotCasesWithContext,
    type UniversalTestContext,
} from '@augment-vir/test';
import {rm} from 'node:fs/promises';
import {join} from 'node:path';
import {notCommittedDirPath, sanitizePaths} from '../paths.mock.js';
import {createNginxSite} from './create-site.js';
import {disableNginxSite, enableNginxSite} from './enable-site.js';

describe('Nginx site enabling', () => {
    async function testEnabling(
        testContext: UniversalTestContext,
        {
            createSite,
            enable,
        }: {
            enable: boolean;
            createSite: boolean;
        },
        callback?: (() => MaybePromise<void>) | undefined,
    ) {
        try {
            assertTestContext(testContext, RuntimeEnv.Node);
            const nginxDirPath = join(notCommittedDirPath, 'enable-site-tests', testContext.name);
            const siteName = 'test-site';

            if (callback) {
                await callback();
            } else {
                await rm(nginxDirPath, {recursive: true, force: true});
            }

            if (createSite) {
                await createNginxSite(
                    {
                        siteName,
                        enabled: true,
                        config: [],
                    },
                    {
                        nginxDirPath,
                        log: emptyLog,
                    },
                );
            }

            const result = await (enable ? enableNginxSite : disableNginxSite)(
                siteName,
                nginxDirPath,
            );

            return {
                result,
                contents: await wrapInTry(
                    () => readAllDirContents(nginxDirPath, {recursive: true}),
                    {
                        fallbackValue: undefined,
                    },
                ),
            };
        } catch (caught) {
            const error = ensureError(caught);
            error.message = sanitizePaths(error.message);
            throw error;
        }
    }

    snapshotCasesWithContext(testEnabling, [
        {
            it: 'disables a site',
            inputs: [
                {
                    enable: false,
                    createSite: true,
                },
            ],
        },
        {
            it: 'fails to disable a missing site',
            inputs: [
                {
                    enable: false,
                    createSite: false,
                },
            ],
        },
        {
            it: 'enables a site',
            inputs: [
                {
                    enable: true,
                    createSite: true,
                },
            ],
        },
        {
            it: 'fails to enable a missing site',
            inputs: [
                {
                    enable: true,
                    createSite: false,
                },
            ],
        },
    ]);
});
