// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
import { useContext } from 'react';
import { UnifiedConverter } from '../conversion/UnifiedConverter';
import { ModernMapElements } from '../processing/ModernMapElements';

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

        // Use ModernMapElements instead of UnifiedMapElements
        const me = new ModernMapElements(result);
        const legacyAdapter = me.getLegacyAdapter();

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
                fn: () => {
                    // Filter out evolved elements from merged elements (matching legacy behavior)
                    const mergedElements = legacyAdapter.getMergedElements();
                    return mergedElements.filter((el) => !el.evolved);
                },
                fileName: 'GoldenMasterMapElementsNonEvolved.txt',
            },
            {
                fn: () => {
                    // Filter out evolved and evolving elements from merged elements (matching legacy behavior)
                    const mergedElements = legacyAdapter.getMergedElements();
                    return mergedElements.filter(
                        (el) => !el.evolved && !el.evolving,
                    );
                },
                fileName: 'GoldenMasterGetNoneEvolvedOrEvolvingElements.txt',
            },
            {
                fn: () => {
                    // Filter out evolving elements from merged elements (matching legacy behavior)
                    const mergedElements = legacyAdapter.getMergedElements();
                    return mergedElements.filter((el) => !el.evolving);
                },
                fileName: 'GoldenMasterGetNoneEvolvingElements.txt',
            },
        ];

        testCases.forEach((testCase) => {
            const { fn, fileName } = testCase;
            console.log(testCase);
            const output = fn();
            // Always log the output for debugging
            console.log(`ACTUAL ${fileName} OUTPUT:`);
            console.log(JSON.stringify(output));

            // Write the new output to a file for comparison and updating golden masters
            fs.writeFileSync(
                path.resolve(
                    __dirname,
                    `${fileName.replace('.txt', '')}_new.txt`,
                ),
                JSON.stringify(output),
                'utf-8',
            );
            testResultEquality(output, fileName);
        });
    });
});
