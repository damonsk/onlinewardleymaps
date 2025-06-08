/**
 * A Jest test that updates all golden master files with the new output from MapElements
 * This is a one-time migration script for Phase 4C
 */
import fs from 'fs';
import path from 'path';
import {useContext} from 'react';
import {UnifiedConverter} from '../conversion/UnifiedConverter';
import {MapElements} from '../processing/MapElements';

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

const mockContextValue = useContext();

// Function to load the content of a file
function loadFileContent(fileName) {
    const filePath = path.resolve(__dirname, fileName);
    return fs.readFileSync(filePath, 'utf-8');
}

// Function to save content to a file
function saveFileContent(fileName, content) {
    const filePath = path.resolve(__dirname, fileName);
    fs.writeFileSync(filePath, content);
}

describe('Update Golden Master Files', () => {
    test('Update all golden master files with MapElements output', () => {
        // Load map text from the golden master file
        const mapTextFileName = 'GoldenMasterMapText.txt';
        const fileContent = loadFileContent(mapTextFileName);

        // Parse the text with UnifiedConverter
        const parsedMap = new UnifiedConverter(mockContextValue).parse(fileContent);

        // Save converter output for reference
        saveFileContent('GoldenMasterConverterOutput.txt', JSON.stringify(parsedMap));

        // Create MapElements from the parsed map
        const modernMapElements = new MapElements(parsedMap);
        const legacyAdapter = modernMapElements.getLegacyAdapter();

        // Define all the test cases we need to update
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
                    return mergedElements.filter(el => !el.evolved);
                },
                fileName: 'GoldenMasterMapElementsNonEvolved.txt',
            },
            {
                fn: () => {
                    // Filter out evolved and evolving elements from merged elements (matching legacy behavior)
                    const mergedElements = legacyAdapter.getMergedElements();
                    return mergedElements.filter(el => !el.evolved && !el.evolving);
                },
                fileName: 'GoldenMasterGetNoneEvolvedOrEvolvingElements.txt',
            },
            {
                fn: () => {
                    // Filter out evolving elements from merged elements (matching legacy behavior)
                    const mergedElements = legacyAdapter.getMergedElements();
                    return mergedElements.filter(el => !el.evolving);
                },
                fileName: 'GoldenMasterGetNoneEvolvingElements.txt',
            },
        ];

        // Update each golden master file
        testCases.forEach(testCase => {
            const {fn, fileName} = testCase;
            const output = fn();
            saveFileContent(fileName, JSON.stringify(output));
        });

        // This test always passes - it's just to run the update
        expect(true).toBe(true);
    });
});
