// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
import { useContext } from 'react';
import { UnifiedConverter } from '../conversion/UnifiedConverter';
import { UnifiedMapElements } from '../processing/UnifiedMapElements';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
}));

useContext.mockReturnValue({
    enableDashboard: false,
    enableNewPipelines: true,
    enableLinkContext: true,
    enableAccelerators: true,
    enableDoubleClickRename: true,
});

// Function to load the content of a file
function loadFileContent(fileName) {
    const filePath = path.resolve(__dirname, fileName);
    return fs.readFileSync(filePath, 'utf-8');
}

// Reusable function to compare results
function testResultEquality(result, fileName) {
    const outputFileContent = loadFileContent(fileName);
    // console.log(JSON.stringify(result)); // Uncomment for debugging

    // Parse both as objects for semantic comparison (property order doesn't matter)
    const expectedObject = JSON.parse(outputFileContent);
    expect(result).toEqual(expectedObject);
}

describe('So that large refactors can be done without breaking output of mapElements', function () {
    const mockContextValue = useContext();

    test('When all possible map components are specified, ensure the output is as expected', function () {
        const fileName = 'GoldenMasterMapText.txt';
        const fileContent = loadFileContent(fileName);

        let result = new UnifiedConverter(mockContextValue).parse(fileContent);
        // console.log(JSON.stringify(result)); // Uncomment for debugging
        testResultEquality(result, 'GoldenMasterConverterOutput.txt');

        const me = new UnifiedMapElements(result);
        const legacyAdapter = me.createLegacyMapElementsAdapter();

        const testCases = [
            {
                fn: () => legacyAdapter.getMergedElements(),
                fileName: 'GoldenMasterMapElementsMergedElements.txt',
            },
            {
                fn: () => legacyAdapter.getMapPipelines(),
                fileName: 'GoldenMasterMapElementsPipeline.txt',
            },
            {
                fn: () => legacyAdapter.getEvolveElements(),
                fileName: 'GoldenMasterMapElementsEvolve.txt',
            },
            {
                fn: () => legacyAdapter.getEvolvedElements(),
                fileName: 'GoldenMasterMapElementsEvolved.txt',
            },
            {
                fn: () => legacyAdapter.getNonEvolvedElements(),
                fileName: 'GoldenMasterMapElementsNonEvolved.txt',
            },
            {
                fn: () => legacyAdapter.getNoneEvolvedOrEvolvingElements(),
                fileName: 'GoldenMasterGetNoneEvolvedOrEvolvingElements.txt',
            },
            {
                fn: () => legacyAdapter.getNoneEvolvingElements(),
                fileName: 'GoldenMasterGetNoneEvolvingElements.txt',
            },
        ];

        testCases.forEach((testCase) => {
            const { fn, fileName } = testCase;
            console.log(testCase);
            const output = fn();
            if (fileName === 'GoldenMasterMapElementsMergedElements.txt') {
                console.log('ACTUAL getMergedElements OUTPUT:');
                console.log(JSON.stringify(output));
            }
            testResultEquality(output, fileName);
        });
    });
});
