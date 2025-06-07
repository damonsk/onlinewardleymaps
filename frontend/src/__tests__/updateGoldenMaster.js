// Script to update golden master files based on current ModernMapElements output
import fs from 'fs';
import path from 'path';
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

const mockContextValue = useContext();

// Load the golden master map text
function loadFileContent(fileName) {
    const filePath = path.resolve(__dirname, fileName);
    return fs.readFileSync(filePath, 'utf-8');
}

describe('Golden Master File Updater', () => {
    test('Updates all golden master files with current ModernMapElements output', () => {
        const fileName = 'GoldenMasterMapText.txt';
        const fileContent = loadFileContent(fileName);

        // Parse using UnifiedConverter (same as test)
        const result = new UnifiedConverter(mockContextValue).parse(
            fileContent,
        );

        // Create ModernMapElements
        const me = new ModernMapElements(result);
        const legacyAdapter = me.getLegacyAdapter();

        // Converter Output - Update only if needed
        const converterOutputFile = path.resolve(
            __dirname,
            'GoldenMasterConverterOutput.txt',
        );
        fs.writeFileSync(converterOutputFile, JSON.stringify(result), 'utf-8');
        console.log(`Updated: GoldenMasterConverterOutput.txt`);

        // Update output files for all test cases
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

        // Update each golden master file
        testCases.forEach((testCase) => {
            const { fn, fileName } = testCase;
            const output = fn();
            const outputFilePath = path.resolve(__dirname, fileName);
            fs.writeFileSync(outputFilePath, JSON.stringify(output), 'utf-8');
            console.log(`Updated: ${fileName}`);
        });

        console.log('All golden master files updated successfully!');

        // Test passes if we get to this point without errors
        expect(true).toBe(true);
    });
});
