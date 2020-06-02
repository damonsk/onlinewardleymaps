const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

const { screenshotMap } = require('./puppeteer');

const options = yargs
	.usage('Usage: $0 -f <.omw file> [options]')
	.example('$0 -f example.omw', 'create example.png from -f file')
	.alias('f', 'file')
	.nargs('f', 1)
	.describe('f', 'Load a .owm file as src')
	.demandOption(['f'])
	.alias('o', 'output')
	.nargs('o', 1)
	.describe('o', 'Output a given file name')
	.example('$0 -f maps/example.omw -o maps/example.png')
	.help('h')
	.alias('h', 'help')
	.epilog('https://github.com/damonsk/onlinewardleymaps').argv;

(async () => {
	let outputPath;
	if (options.output) {
		outputPath = path.join(process.cwd(), options.output);
	}
	if (options.file) {
		const mapText = fs.readFileSync(
			path.join(process.cwd(), options.file),
			'utf8'
		);
		// console.log(mapText);
		await screenshotMap({
			mapText,
			output: outputPath,
		});
		console.log(`Saved screenshot: ${outputPath}`);
	}
})();
