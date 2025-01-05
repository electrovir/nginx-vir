import {createSymlink} from '@augment-vir/node';
import {existsSync} from 'node:fs';
import {mkdir, rm} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {defaultNginxDirPath} from '../paths.js';

/**
 * Disables a Nginx site by removing its symlink from `/etc/nginx/sites-enabled`.
 *
 * This will likely require sudo permissions if run with the default nginx dir (`/etc/nginx/`).
 *
 * @category Site Control
 * @returns `true` if the enabled symlink exists and was deleted. Otherwise, `false`.
 */
export async function disableNginxSite(
    siteName: string,
    nginxDirPath: string = defaultNginxDirPath,
): Promise<boolean> {
    const enabledSymlinkPath = join(nginxDirPath, 'sites-enabled', siteName);

    if (!existsSync(enabledSymlinkPath)) {
        return false;
    }

    await rm(enabledSymlinkPath, {force: true});
    return true;
}
/**
 * Enables a Nginx site by symlinking to it from `/etc/nginx/sites-enabled`.
 *
 * This will likely require sudo permissions if run with the default nginx dir (`/etc/nginx/`).
 *
 * @category Site Control
 */
export async function enableNginxSite(
    siteName: string,
    nginxDirPath: string = defaultNginxDirPath,
): Promise<boolean> {
    const sitePath = join(nginxDirPath, 'sites-available', siteName);
    const symlinkPath = join(nginxDirPath, 'sites-enabled', siteName);
    await mkdir(dirname(symlinkPath), {
        recursive: true,
    });

    if (!existsSync(sitePath)) {
        throw new Error(`Site '${siteName}' does not exist in '${sitePath}'.`);
    }

    await createSymlink({linkTo: sitePath, symlinkPath});
    return true;
}
