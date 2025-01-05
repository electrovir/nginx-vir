import {check} from '@augment-vir/assert';
import {addSuffix, mapObject} from '@augment-vir/common';
import {DirContents} from '@augment-vir/node';
import {dirname, join} from 'node:path';

export const repoDirPath = dirname(import.meta.dirname);
export const notCommittedDirPath = join(repoDirPath, '.not-committed');

export function sanitizePaths(value: string): string {
    return value.replaceAll(addSuffix({value: repoDirPath, suffix: '/'}), '');
}

export function sanitizeContents(contents: DirContents): DirContents {
    return mapObject(contents, (key, value): {key: string; value: string | DirContents} => {
        if (check.isObject(value)) {
            return {
                key,
                value: sanitizeContents(value),
            };
        } else {
            return {
                key,
                value: sanitizePaths(value),
            };
        }
    });
}
