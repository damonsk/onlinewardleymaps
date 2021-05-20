import TitleExtractionStrategy from './TitleExtractionStrategy';
import MethodExtractionStrategy from './MethodExtractionStrategy';
import XAxisLabelsExtractionStrategy from './XAxisLabelsExtractionStrategy';
import PresentationExtractionStrategy from './PresentationExtractionStrategy';
import NoteExtractionStrategy from './NoteExtractionStrategy';
import AnnotationExtractionStrategy from './AnnotationExtractionStrategy';
import ComponentExtractionStrategy from './ComponentExtractionStrategy';
import MarketExtractionStrategy from './MarketExtractionStrategy';
import EcosystemExtractionStrategy from './EcosystemExtractionStrategy';
import PipelineExtractionStrategy from './PipelineExtractionStrategy';
import EvolveExtractionStrategy from './EvolveExtractionStrategy';
import AnchorExtractionStrategy from './AnchorExtractionStrategy';
import LinksExtractionStrategy from './LinksExtractionStrategy';
import SubMapExtractionStrategy from './SubMapExtractionStrategy';
import UrlExtractionStrategy from './UrlExtractionStrategy';
import AttitudeExtractionStrategy from './AttitudeExtractionStrategy';

export default class Converter {
	parse(data) {
		const t = this.stripComments(data);
		const strategies = [
			new TitleExtractionStrategy(t),
			new MethodExtractionStrategy(t),
			new XAxisLabelsExtractionStrategy(t),
			new PresentationExtractionStrategy(t),
			new NoteExtractionStrategy(t),
			new AnnotationExtractionStrategy(t),
			new ComponentExtractionStrategy(t),
			new MarketExtractionStrategy(t),
			new EcosystemExtractionStrategy(t),
			new PipelineExtractionStrategy(t),
			new EvolveExtractionStrategy(t),
			new AnchorExtractionStrategy(t),
			new LinksExtractionStrategy(t),
			new SubMapExtractionStrategy(t),
			new UrlExtractionStrategy(t),
			new AttitudeExtractionStrategy(t),
		];
		let errorContainer = { errors: [] };
		let converted = {
			links: [],
			anchors: [],
			evolved: [],
			pipelines: [],
			elements: [],
			annotations: [],
			notes: [],
			presentation: {},
			evolution: [],
			methods: [],
			title: '',
			submaps: [],
			markets: [],
			ecosystems: [],
			urls: [],
			attitudes: [],
		};
		strategies.forEach(s => {
			const o = s.apply();
			converted = Object.assign(converted, o);
			if (o.errors && o.errors.length > 0)
				errorContainer.errors = errorContainer.errors.concat(o.errors);
		});
		return Object.assign(converted, errorContainer);
	}

	stripComments(data) {
		var doubleSlashRemoved = data.split('\n').map(line => {
			if (line.trim().indexOf('url') === 0) {
				return line;
			}
			return line.split('//')[0];
		});

		let lines = doubleSlashRemoved;
		let linesToKeep = [];
		let open = false;

		for (let i = 0; i < lines.length; i++) {
			let currentLine = lines[i];
			if (currentLine.indexOf('/*') > -1) {
				open = true;
				linesToKeep.push(currentLine.split('/*')[0].trim());
			} else if (open) {
				if (currentLine.indexOf('*/') > -1) {
					open = false;
					linesToKeep.push(currentLine.split('*/')[1].trim());
				}
			} else if (open === false) {
				linesToKeep.push(currentLine);
			}
		}

		return linesToKeep.join('\n');
	}
}
