import TitleExtractionStrategy from './TitleExtractionStrategy';
import MethodExtractionStrategy from './MethodExtractionStrategy';
import XAxisLabelsExtractionStrategy from './XAxisLabelsExtractionStrategy';
import PresentationExtractionStrategy from './PresentationExtractionStrategy';
import NoteExtractionStrategy from './NoteExtractionStrategy';
import AnnotationExtractionStrategy from './AnnotationExtractionStrategy';
import ComponentExtractionStrategy from './ComponentExtractionStrategy';
import PipelineExtractionStrategy from './PipelineExtractionStrategy';
import EvolveExtractionStrategy from './EvolveExtractionStrategy';
import AnchorExtractionStrategy from './AnchorExtractionStrategy';
import LinksExtractionStrategy from './LinksExtractionStrategy';

export default class Converter {
	parse(data) {
		let t = this.stripComments(data);
		let strategies = [
			new TitleExtractionStrategy(t),
			new MethodExtractionStrategy(t),
			new XAxisLabelsExtractionStrategy(t),
			new PresentationExtractionStrategy(t),
			new NoteExtractionStrategy(t),
			new AnnotationExtractionStrategy(t),
			new ComponentExtractionStrategy(t),
			new PipelineExtractionStrategy(t),
			new EvolveExtractionStrategy(t),
			new AnchorExtractionStrategy(t),
			new LinksExtractionStrategy(t),
		];

		let converted = {};
		strategies.forEach(s => {
			converted = Object.assign(converted, s.apply());
		});
		return converted;
	}

	stripComments(data) {
		var doubleSlashRemoved = data.split('\n').map(line => {
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
			} else if (open == false) {
				linesToKeep.push(currentLine);
			}
		}

		return linesToKeep.join('\n');
	}
}
