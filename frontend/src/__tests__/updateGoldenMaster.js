// Script to update golden master files based on current ModernMapElements output
const fs = require('fs');
const path = require('path');

// Import required modules
const { UnifiedConverter } = require('../conversion/UnifiedConverter');
const { ModernMapElements } = require('../processing/ModernMapElements');

// Mock context value to match the test
const mockContextValue = {
    enableDashboard: false,
    enableNewPipelines: true,
    enableLinkContext: true,
    enableAccelerators: true,
    enableDoubleClickRename: true,
};

// Load the golden master map text
function loadFileContent(fileName) {
    const filePath = path.resolve(__dirname, fileName);
    return fs.readFileSync(filePath, 'utf-8');
}

// Function to update golden master files
async function updateGoldenMasterFiles() {
    try {
        const fileName = 'GoldenMasterMapText.txt';
        const fileContent = loadFileContent(fileName);

        // Parse using UnifiedConverter (same as test)
        const result = new UnifiedConverter(mockContextValue).parse(fileContent);
        
        // Create ModernMapElements
        const me = new ModernMapElements(result);
        const legacyAdapter = me.getLegacyAdapter();

        // Converter Output - Update only if needed
        const converterOutputFile = path.resolve(__dirname, 'GoldenMasterConverterOutput.txt');
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

        // Update each golden master file
        testCases.forEach((testCase) => {
            const { fn, fileName } = testCase;
            const output = fn();
            const outputFilePath = path.resolve(__dirname, fileName);
            fs.writeFileSync(outputFilePath, JSON.stringify(output), 'utf-8');
            console.log(`Updated: ${fileName}`);
        });

        console.log('All golden master files updated successfully!');
    } catch (error) {
        console.error('Error updating golden master files:', error);
    }
}

// Run the update script
updateGoldenMasterFiles();
