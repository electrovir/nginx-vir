import {check} from '@augment-vir/assert';
import type {NginxBlock, NginxBlockByType, NginxBlockType} from './nginx-blocks.js';

/**
 * Convert multiple Nginx block objects into strings suitable to be saved to Nginx config files.
 *
 * @category Nginx Blocks
 */
export function generateNginxBlocks(
    blocks: ReadonlyArray<Readonly<NginxBlock>>,
    indent?: number | undefined,
) {
    return blocks.map((block) => generateNginxBlock(block, indent));
}

type BlockGenerator<TypeName extends NginxBlockType> = (
    block: NginxBlockByType<TypeName>,
) => string;

/**
 * Convert an Nginx block object into a string suitable to be saved to an Nginx config file.
 *
 * @category Nginx Blocks
 */
export function generateNginxBlock(
    block: Readonly<NginxBlock>,
    indent?: number | undefined,
): string {
    /** Cast the generator into a more generic form so we can pass any block to it. */
    const generator = blockGenerators[block.type] as BlockGenerator<NginxBlockType>;
    const generated = generator(block);
    if (indent) {
        return generated
            .split('\n')
            .map((line) =>
                [
                    ' '.repeat(indent * 4),
                    line,
                ].join(''),
            )
            .join('\n');
    } else {
        return generated;
    }
}

const blockGenerators: {
    [TypeName in NginxBlockType]: BlockGenerator<TypeName>;
} = {
    access_log(block) {
        return (
            [
                block.type,
                ...block.values,
            ].join(' ') + ';'
        );
    },
    add_header(block) {
        return (
            [
                block.type,
                block.name,
                block.value,
                block.always ? 'always' : '',
            ]
                .filter(check.isTruthy)
                .join(' ') + ';'
        );
    },
    auth_basic(block) {
        return (
            [
                block.type,
                block.value,
            ].join(' ') + ';'
        );
    },
    auth_basic_user_file(block) {
        return (
            [
                block.type,
                block.file,
            ].join(' ') + ';'
        );
    },
    default_type(block) {
        return (
            [
                block.type,
                block.mimeType,
            ].join(' ') + ';'
        );
    },
    error_log(block) {
        return (
            [
                block.type,
                block.file,
                block.level,
            ]
                .filter(check.isTruthy)
                .join(' ') + ';'
        );
    },
    events(block) {
        return [
            'events {',
            ...generateNginxBlocks(block.children, 1),
            '}',
        ].join('\n');
    },
    gzip(block) {
        return (
            [
                block.type,
                block.enabled ? 'on' : 'off',
            ].join(' ') + ';'
        );
    },
    http(block) {
        return [
            'http {',
            ...generateNginxBlocks(block.children, 1),
            '}',
        ].join('\n');
    },
    include(block) {
        return (
            [
                block.type,
                block.file,
            ].join(' ') + ';'
        );
    },
    listen(block) {
        return (
            [
                block.type,
                ...block.values,
            ].join(' ') + ';'
        );
    },
    load_module(block) {
        return (
            [
                block.type,
                block.file,
            ].join(' ') + ';'
        );
    },
    location(block) {
        const locationLine = [
            block.type,
            block.matcher,
            block.uri,
            '{',
        ]
            .filter(check.isTruthy)
            .join(' ');

        return [
            locationLine,
            ...generateNginxBlocks(block.children, 1),
            '}',
        ].join('\n');
    },
    main(block) {
        return generateNginxBlocks(block.children, 0).join('\n');
    },
    pid(block) {
        return (
            [
                block.type,
                block.file,
            ].join(' ') + ';'
        );
    },
    proxy_pass(block) {
        return (
            [
                block.type,
                block.url,
            ].join(' ') + ';'
        );
    },
    proxy_set_header(block) {
        return (
            [
                block.type,
                block.name,
                block.value,
            ].join(' ') + ';'
        );
    },
    return(block) {
        return (
            [
                block.type,
                block.code,
                'text' in block ? block.text : block.url,
            ]
                .filter(check.isTruthy)
                .join(' ') + ';'
        );
    },
    sendfile(block) {
        return (
            [
                block.type,
                block.enabled ? 'on' : 'off',
            ].join(' ') + ';'
        );
    },
    server(block) {
        return [
            'server {',
            ...generateNginxBlocks(block.children, 1),
            '}',
        ].join('\n');
    },
    ssl_certificate(block) {
        return (
            [
                block.type,
                block.file,
            ].join(' ') + ';'
        );
    },
    ssl_certificate_key(block) {
        return (
            [
                block.type,
                block.file,
            ].join(' ') + ';'
        );
    },
    ssl_ciphers(block) {
        return (
            [
                block.type,
                block.ciphers.join(':'),
            ].join(' ') + ';'
        );
    },
    ssl_dhparam(block) {
        return (
            [
                block.type,
                block.file,
            ].join(' ') + ';'
        );
    },
    ssl_ecdh_curve(block) {
        return (
            [
                block.type,
                block.curves.join(':'),
            ].join(' ') + ';'
        );
    },
    ssl_prefer_server_ciphers(block) {
        return (
            [
                block.type,
                block.enabled ? 'on' : 'off',
            ].join(' ') + ';'
        );
    },
    ssl_protocols(block) {
        return (
            [
                block.type,
                ...block.protocols,
            ].join(' ') + ';'
        );
    },
    ssl_session_cache(block) {
        return (
            [
                block.type,
                ...block.values,
            ].join(' ') + ';'
        );
    },
    ssl_session_tickets(block) {
        return (
            [
                block.type,
                block.enabled ? 'on' : 'off',
            ].join(' ') + ';'
        );
    },
    ssl_session_timeout(block) {
        return (
            [
                block.type,
                block.time,
            ].join(' ') + ';'
        );
    },
    ssl_stapling(block) {
        return (
            [
                block.type,
                block.enabled ? 'on' : 'off',
            ].join(' ') + ';'
        );
    },
    ssl_stapling_verify(block) {
        return (
            [
                block.type,
                block.enabled ? 'on' : 'off',
            ].join(' ') + ';'
        );
    },
    tcp_nopush(block) {
        return (
            [
                block.type,
                block.enabled ? 'on' : 'off',
            ].join(' ') + ';'
        );
    },
    types_hash_max_size(block) {
        return (
            [
                block.type,
                block.size,
            ].join(' ') + ';'
        );
    },
    user(block) {
        return (
            [
                block.type,
                block.user,
                block.group,
            ]
                .filter(check.isTruthy)
                .join(' ') + ';'
        );
    },
    worker_connections(block) {
        return (
            [
                block.type,
                block.count,
            ].join(' ') + ';'
        );
    },
    worker_processes(block) {
        return (
            [
                block.type,
                block.count,
            ].join(' ') + ';'
        );
    },
};
