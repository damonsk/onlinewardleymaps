// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
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

function loadFileContent(fileName) {
    const filePath = path.resolve(__dirname, fileName);
    return fs.readFileSync(filePath, 'utf-8');
}

function testResultEquality(result, fileName) {
    writeComparisonFile(result, fileName);
    const outputFileContent = loadFileContent(fileName);
    const expectedObject = JSON.parse(outputFileContent);
    expect(result).toEqual(expectedObject);
}

describe('So that large refactors can be done without breaking output of mapElements', function () {
    const mockContextValue = useContext();
    let result;
    let legacyAdapter;

    beforeEach(() => {
        const fileName = 'GoldenMasterMapText.txt';
        const fileContent = loadFileContent(fileName);
        result = new UnifiedConverter(mockContextValue).parse(fileContent);
        const me = new MapElements(result);
        legacyAdapter = me.getLegacyAdapter();
    });

    test('When parsing map text, ensure converter output is as expected', function () {
        testResultEquality(result, 'GoldenMasterConverterOutput.txt');
    });

    test('When getting merged elements, ensure output is as expected', function () {
        const output = legacyAdapter.getMergedElements();
        testResultEquality(output, 'GoldenMasterMapElementsMergedElements.txt');
    });

    test('When getting map pipelines, ensure output is as expected', function () {
        const output = legacyAdapter.getMapPipelines();
        testResultEquality(output, 'GoldenMasterMapElementsPipeline.txt');
    });

    test('When getting evolve elements, ensure output is as expected', function () {
        const output = legacyAdapter.getEvolveElements();
        testResultEquality(output, 'GoldenMasterMapElementsEvolve.txt');
    });

    test('When getting evolved elements, ensure output is as expected', function () {
        const output = legacyAdapter.getEvolvedElements();
        testResultEquality(output, 'GoldenMasterMapElementsEvolved.txt');
    });

    test('When filtering out evolved elements, ensure output is as expected', function () {
        const mergedElements = legacyAdapter.getMergedElements();
        const output = mergedElements.filter(el => !el.evolved);
        testResultEquality(output, 'GoldenMasterMapElementsNonEvolved.txt');
    });

    test('When filtering out evolved and evolving elements, ensure output is as expected', function () {
        const mergedElements = legacyAdapter.getMergedElements();
        const output = mergedElements.filter(el => !el.evolved && !el.evolving);
        testResultEquality(output, 'GoldenMasterGetNoneEvolvedOrEvolvingElements.txt');
    });

    test('When filtering out evolving elements, ensure output is as expected', function () {
        const mergedElements = legacyAdapter.getMergedElements();
        const output = mergedElements.filter(el => !el.evolving);
        testResultEquality(output, 'GoldenMasterGetNoneEvolvingElements.txt');
    });
});
function writeComparisonFile(output, originalFileName) {
    const fileName = originalFileName.replace('.txt', '_new.txt');
    fs.writeFileSync(path.resolve(__dirname, fileName), JSON.stringify(output), 'utf-8');
}
