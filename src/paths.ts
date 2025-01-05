import {systemRootPath} from '@augment-vir/node';
import {join} from 'node:path';

/**
 * Default, system-level Nginx install directory.
 *
 * @category Internal
 */
export const defaultNginxDirPath = join(systemRootPath, 'etc', 'nginx');
