/* node:coverage disable: this file is just types */

import type {ArrayElement, HttpStatus, Values} from '@augment-vir/common';
import type {UnionOmit} from '../augments/union-omit.js';

/**
 * All raw Nginx block types. This includes a `context` property, which isn't used in block
 * definitions but is used in types here to determine which children each block can have.
 *
 * @category Internal.
 */
export type RawNginxBlock =
    | {
          /** The top level `nginx.conf` file. */
          type: 'main';
          context: [];
          children: NginxBlockTypesWithContext<'main'>[];
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_core_module.html#listen */
          type: 'listen';
          context: ['server'];
          values: string[];
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_core_module.html#server */
          type: 'server';
          context: ['http'];
          children: NginxBlockTypesWithContext<'server'>[];
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html#auth_basic */
          type: 'auth_basic';
          context: ['http', 'server', 'location', 'limit_except'];
          /** Expected: string | 'off' */
          value: string;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html#auth_basic_user_file */
          type: 'auth_basic_user_file';
          context: ['http', 'server', 'location', 'limit_except'];
          file: string;
      }
    | {
          /** @see https://nginx.org/en/docs/ngx_core_module.html#include */
          type: 'include';
          file: string;
      }
    | {
          /** @see https://nginx.org/en/docs/ngx_core_module.html#load_module */
          type: 'load_module';
          context: ['main'];
          file: string;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_protocols */
          type: 'ssl_protocols';
          context: ['http', 'server'];
          protocols: ('SSLv2' | 'SSLv3' | 'TLSv1' | 'TLSv1.1' | 'TLSv1.2' | 'TLSv1.3')[];
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_prefer_server_ciphers */
          type: 'ssl_prefer_server_ciphers';
          context: ['http', 'server'];
          enabled: boolean;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_gzip_module.html#gzip */
          type: 'gzip';
          context: ['http', 'server', 'location', 'location.if'];
          enabled: boolean;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_log_module.html#access_log */
          type: 'access_log';
          context: ['http', 'server', 'location', 'location.if', 'limit_except'];
          values: string[];
      }
    | {
          /** @see https://nginx.org/en/docs/ngx_core_module.html#error_log */
          type: 'error_log';
          context: ['main', 'http', 'mail', 'stream', 'server', 'location'];
          file: string;
          level?: 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'crit' | 'alert' | 'emerg';
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_session_timeout */
          type: 'ssl_session_timeout';
          context: ['http', 'server'];
          /** @example '5m' */
          time: string;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_session_cache */
          type: 'ssl_session_cache';
          context: ['http', 'server'];
          /**
           * 'off' | 'none' | [builtin[:size]] [shared:name:size]
           *
           * These values will be joined with spaces.
           */
          values: string[];
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_session_tickets */
          type: 'ssl_session_tickets';
          context: ['http', 'server'];
          enabled: boolean;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_stapling */
          type: 'ssl_stapling';
          context: ['http', 'server'];
          enabled: boolean;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_stapling_verify */
          type: 'ssl_stapling_verify';
          context: ['http', 'server'];
          enabled: boolean;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_ciphers */
          type: 'ssl_ciphers';
          context: ['http', 'server'];
          /** These ciphers will be joined with `':'`. */
          ciphers: string[];
      }
    | {
          /** @type https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_ecdh_curve */
          type: 'ssl_ecdh_curve';
          context: ['http', 'server'];
          curves: string[];
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_dhparam */
          type: 'ssl_dhparam';
          context: ['http', 'server'];
          file: string;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header */
          type: 'add_header';
          context: ['http', 'server', 'location', 'location.if'];
          /** The name of the header. */
          name: string;
          value: string;
          always?: boolean;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_core_module.html#http */
          type: 'http';
          context: ['main'];
          children: NginxBlockTypesWithContext<'http'>[];
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_core_module.html#sendfile */
          type: 'sendfile';
          context: ['http', 'server', 'location', 'location.if'];
          enabled: boolean;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_core_module.html#tcp_nopush */
          type: 'tcp_nopush';
          context: ['http', 'server', 'location'];
          enabled: boolean;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_core_module.html#default_type */
          type: 'default_type';
          context: ['http', 'server', 'location'];
          mimeType: string;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_core_module.html#types_hash_max_size */
          type: 'types_hash_max_size';
          context: ['http', 'server', 'location'];
          size: number;
      }
    | {
          /** @see https://nginx.org/en/docs/ngx_core_module.html#worker_processes */
          type: 'worker_processes';
          context: ['main'];
          count: number | 'auto';
      }
    | {
          /** @see https://nginx.org/en/docs/ngx_core_module.html#user */
          type: 'user';
          context: ['main'];
          user: string;
          group?: string;
      }
    | {
          /**
           * Defines a file that will store the process ID of the main process.
           *
           * @see https://nginx.org/en/docs/ngx_core_module.html#pid
           */
          type: 'pid';
          context: ['main'];
          file: string;
      }
    | {
          /** @see https://nginx.org/en/docs/ngx_core_module.html#worker_connections */
          type: 'worker_connections';
          context: ['events'];
          count: number;
      }
    | {
          /** @see https://nginx.org/en/docs/ngx_core_module.html#events */
          type: 'events';
          context: ['main'];
          children: NginxBlockTypesWithContext<'events'>[];
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#return */
          type: 'return';
          context: ['server', 'location', 'if'];
          code?: HttpStatus;
          url: string;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#return */
          type: 'return';
          context: ['server', 'location', 'if'];
          code: HttpStatus;
          text: string;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_core_module.html#location */
          type: 'location';
          context: ['server', 'location'];
          matcher?: '=' | '~' | '~*' | '^~';
          uri: string;
          children: NginxBlockTypesWithContext<'location'>[];
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_certificate */
          type: 'ssl_certificate';
          context: ['http', 'server'];
          file: string;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_ssl_module.html#ssl_certificate_key */
          type: 'ssl_certificate_key';
          context: ['http', 'server'];
          file: string;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header */
          type: 'proxy_set_header';
          context: ['http', 'server', 'location'];
          /** The name of the header. */
          name: string;
          value: string;
      }
    | {
          /** @see https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass */
          type: 'proxy_pass';
          context: ['location', 'location.if', 'limit_except'];
          url: string;
      };

/**
 * An Nginx building block for a site, config, or snippet. This is not complete: not all blocks are
 * supported yet. Request blocks to be added as they are needed.
 *
 * @category Block
 */
export type NginxBlock = UnionOmit<RawNginxBlock, 'context'>;
/**
 * All supported Nginx directives.
 *
 * @category Block
 */
export type NginxBlockType = NginxBlock['type'];
/**
 * Extract an Nginx block type by its block type.
 *
 * @category Block
 */
export type NginxBlockByType<TypeName extends NginxBlockType> = UnionOmit<
    Extract<NginxBlock, {type: TypeName}>,
    'context'
>;
/**
 * Gets all block types that have the given context.
 *
 * @category Internal
 */
export type NginxBlockTypesWithContext<WithThisContext extends NginxBlockType> = UnionOmit<
    Values<{
        [Key in NginxBlockType as Extract<RawNginxBlock, {type: Key}> extends infer Block
            ? 'context' extends keyof Block
                ? Block['context'] extends any[]
                    ? WithThisContext extends ArrayElement<Block['context']>
                        ? Key
                        : never
                    : Key
                : Key
            : never]: Extract<RawNginxBlock, {type: Key}>;
    }>,
    'context'
>;
