const puppeteer = require('puppeteer');

const HEADLESS = true;

const clippedScreenshotOpts = (boundingBox, path) => {
	return {
		path,
		fullPage: false,
		clip: boundingBox,
	};
};

const defaultOptions = {
	host: 'http://localhost:3000',
	file: '',
	output: 'mapTitle.png',
	width: 1920, // this is intended to be for the final image, but it's going to have to be adjusted because the final image is a % of the viewport
	height: 1080,
};
const screenshotMap = async opts => {
	const options = Object.assign({}, defaultOptions, opts);
	const { output, width, height, host, mapText } = options;
	const browser = await puppeteer.launch({ headless: HEADLESS });
	const page = await browser.newPage();
	await page.setViewport({
		width,
		height,
	});
	await page.goto(host);
	const editorSelector = '.ace_text-input';
	await page.waitFor(editorSelector);
	// await page.type('.ace_text-input', mapText);
	// page.type was a little slow, so pushed the val and event directly
	await page.$eval(
		editorSelector,
		(e, val) => {
			e.value = val;
			e.dispatchEvent(new Event('input', { bubbles: true }));
			e.dispatchEvent(new Event('change', { bubbles: true }));
		},
		mapText
	);
	const mapFrameSelector = '.contentLoaded';
	await page.waitFor(mapFrameSelector);
	const mapElem = await page.$(mapFrameSelector);
	const mapBoundingBox = await mapElem.boundingBox();

	const screenshotOptions = clippedScreenshotOpts(mapBoundingBox, output);

	// if a path is set, chromium saves the file directly to the path
	await page.screenshot(screenshotOptions);
	await browser.close();
};

module.exports = {
	screenshotMap,
};

// Run this file directly
// screenshotMap();
