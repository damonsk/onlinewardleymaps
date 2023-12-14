const fs = require('fs');
const path = require('path');
import MapElements from '../MapElements';
import Converter from '../conversion/Converter';

// Function to load the content of a file
function loadFileContent(fileName) {
	const filePath = path.resolve(__dirname, fileName);
	return fs.readFileSync(filePath, 'utf-8');
}

describe('So that large refactors can be done without breaking output of mapElements', function() {
	test('When all possible map components are specified, ensure the output is as expected', function() {
		const fileName = 'GoldenMasterMapText.txt';
		const fileContent = loadFileContent(fileName);

		const outputFileName = 'GoldenMasterConverterOutput.txt';
		const outputFileContent = loadFileContent(outputFileName);

		let result = new Converter().parse(fileContent);
		//console.log(JSON.stringify(result));  //copy to GM.txt
		expect(JSON.stringify(result)).toBe(outputFileContent);

		const mergeables = [{ collection: result.elements, type: 'component' }];
		const me = new MapElements(mergeables, result.evolved, result.pipelines);

		const mapElementsResult = me.getMergedElements();
		//console.log(JSON.stringify(mapElementsResult));  //copy to GM.txt
		const mergedFileName = 'GoldenMasterMapElementsMergedElements.txt';
		const mergedFileContent = loadFileContent(mergedFileName);
		expect(JSON.stringify(mapElementsResult)).toBe(mergedFileContent);

		const pipelineResult = me.getMapPipelines();
		//console.log(JSON.stringify(pipelineResult));  //copy to GM.txt
		const pipelineFileName = 'GoldenMasterMapElementsPipeline.txt';
		const pipelineFileContent = loadFileContent(pipelineFileName);
		expect(JSON.stringify(pipelineResult)).toBe(pipelineFileContent);
	});
});
