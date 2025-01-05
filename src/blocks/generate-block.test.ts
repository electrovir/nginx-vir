import {check} from '@augment-vir/assert';
import {removePrefix} from '@augment-vir/common';
import {itCases, type FunctionTestCase} from '@augment-vir/test';
import {describe} from 'node:test';
import {generateNginxBlocks} from './generate-block.js';
import {generationTests} from './generation-tests.mock.js';
import {NginxBlock} from './nginx-blocks.js';

describe(generateNginxBlocks.name, () => {
    function testGenerateNginxBlocks(blocks: ReadonlyArray<Readonly<NginxBlock>>) {
        return generateNginxBlocks(blocks).join('\n');
    }

    itCases(
        testGenerateNginxBlocks,
        Object.entries(generationTests).flatMap(
            ([
                blockType,
                testCases,
            ]) => {
                return testCases.map(
                    (testCase, testCaseIndex): FunctionTestCase<typeof testGenerateNginxBlocks> => {
                        const expectation = testCase.generated
                            .split('\n')
                            .map((line) => removePrefix({value: line, prefix: '            '}))
                            .join('\n');

                        return {
                            it: [
                                blockType,
                                testCases.length > 1 ? testCaseIndex : '',
                            ]
                                .filter(check.isTruthy)
                                .join(' '),
                            input: [testCase.block],
                            expect: expectation,
                        };
                    },
                );
            },
        ),
    );
});
