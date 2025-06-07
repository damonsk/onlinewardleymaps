/**
 * A helper script to update all golden master files with the new output from ModernMapElements
 * This is a one-time migration script for Phase 4C
 */

const fs = require('fs');
const path = require('path');
import { UnifiedConverter } from '../conversion/UnifiedConverter';
import { ModernMapElements } from '../processing/ModernMapElements';
import { useContext } from 'react';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
}));

const mockContextValue = {
    enableDashboard: false,
    enableNewPipelines: true,
    enableLinkContext: true,
    enableAccelerators: true,
    enableDoubleClickRename: true,
};

// Function to load the content of a file
function loadFileContent(fileName) {
    const filePath = path.resolve(__dirname, fileName);
    return fs.readFileSync(filePath, 'utf-8');
}

// Function to save content to a file
function saveFileContent(fileName, content) {
    const filePath = path.resolve(__dirname, fileName);
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${fileName}`);
}

// Main function to update all golden master files
function updateAllGoldenMasterFiles() {
    console.log('Starting golden master file update...');
    
    // Load map text from the golden master file
    const mapTextFileName = 'GoldenMasterMapText.txt';
    const fileContent = loadFileContent(mapTextFileName);
    
    // Parse the text with UnifiedConverter
    const parsedMap = new UnifiedConverter(mockContextValue).parse(fileContent);
    
    // Save converter output for reference
    saveFileContent('GoldenMasterConverterOutput.txt', JSON.stringify(parsedMap));
    
    // Create ModernMapElements from the parsed map
    const modernMapElements = new ModernMapElements(parsedMap);
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
        console.log(`Processing ${fileName}...`);
        const output = fn();
        saveFileContent(fileName, JSON.stringify(output));
    });
    
    console.log('Golden master file update completed successfully!');
}

// Run the update function
updateAllGoldenMasterFiles();
