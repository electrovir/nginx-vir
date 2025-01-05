/* node:coverage disable: this file is just types */

import type {NginxBlockTypesWithContext} from '../blocks/nginx-blocks.js';

/**
 * Config for Nginx site creation.
 *
 * @category Internal
 */
export type NginxSite = {
    siteName: string;
    enabled: boolean;
    config: NginxBlockTypesWithContext<'http'>[];
};
