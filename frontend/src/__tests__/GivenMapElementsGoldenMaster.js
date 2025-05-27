// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
import MapElements from '../MapElements';
import Converter from '../conversion/Converter';
import { useContext } from 'react';

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
    // console.log(JSON.stringify(result));  // Uncomment for debugging
    expect(JSON.stringify(result)).toBe(outputFileContent);
}

describe('So that large refactors can be done without breaking output of mapElements', function () {
    const mockContextValue = useContext();

    test('When all possible map components are specified, ensure the output is as expected', function () {
        const fileName = 'GoldenMasterMapText.txt';
        const fileContent = loadFileContent(fileName);

        let result = new Converter(mockContextValue).parse(fileContent);
        //console.log(JSON.stringify(result)); // Uncomment for debugging
        testResultEquality(result, 'GoldenMasterConverterOutput.txt');

        const mergeables = [{ collection: result.elements, type: 'component' }];
        const me = new MapElements(
            mergeables,
            result.evolved,
            result.pipelines,
        );

        const testCases = [
            {
                fn: () => me.getMergedElements(),
                fileName: 'GoldenMasterMapElementsMergedElements.txt',
            },
            {
                fn: () => me.getMapPipelines(),
                fileName: 'GoldenMasterMapElementsPipeline.txt',
            },
            {
                fn: () => me.getEvolveElements(),
                fileName: 'GoldenMasterMapElementsEvolve.txt',
            },
            {
                fn: () => me.getEvolvedElements(),
                fileName: 'GoldenMasterMapElementsEvolved.txt',
            },
            {
                fn: () => me.getNonEvolvedElements(),
                fileName: 'GoldenMasterMapElementsNonEvolved.txt',
            },
            {
                fn: () => me.getNoneEvolvedOrEvolvingElements(),
                fileName: 'GoldenMasterGetNoneEvolvedOrEvolvingElements.txt',
            },
            {
                fn: () => me.getNoneEvolvingElements(),
                fileName: 'GoldenMasterGetNoneEvolvingElements.txt',
            },
        ];

        testCases.forEach((testCase) => {
            const { fn, fileName } = testCase;
            // console.log(testCase);
            testResultEquality(fn(), fileName);
        });
    });
});
