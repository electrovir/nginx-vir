import {describe, it} from '@augment-vir/test';
import {NginxBlock} from './nginx-blocks.js';

describe('NginxBlock', () => {
    it('does not require context', () => {
        const testAssignment: NginxBlock = {
            type: 'server',
            children: [],
        };
    });
    it('does not require context in children', () => {
        const testAssignment: NginxBlock = {
            type: 'server',
            children: [
                {
                    type: 'access_log',
                    values: [],
                },
            ],
        };
    });
    it('blocks mismatched children', () => {
        const testAssignment: NginxBlock = {
            type: 'location',
            uri: '',
            children: [
                {
                    // @ts-expect-error: this is not a valid child of a location block
                    type: 'ssl_session_timeout',
                    time: '4m',
                },
            ],
        };
    });
});
