import {IProvideFeatureSwitches, WardleyMap} from '../types/base';
import AcceleratorExtractionStrategy from './AcceleratorExtractionStrategy';
import AnchorExtractionStrategy from './AnchorExtractionStrategy';
import AnnotationExtractionStrategy from './AnnotationExtractionStrategy';
import AttitudeExtractionStrategy from './AttitudeExtractionStrategy';
import ComponentExtractionStrategy from './ComponentExtractionStrategy';
import EvolveExtractionStrategy from './EvolveExtractionStrategy';
import LinksExtractionStrategy from './LinksExtractionStrategy';
import NoteExtractionStrategy from './NoteExtractionStrategy';
import PipelineExtractionStrategy from './PipelineExtractionStrategy';
import PresentationExtractionStrategy from './PresentationExtractionStrategy';
import SubMapExtractionStrategy from './SubMapExtractionStrategy';
import TitleExtractionStrategy from './TitleExtractionStrategy';
import UrlExtractionStrategy from './UrlExtractionStrategy';
import XAxisLabelsExtractionStrategy from './XAxisLabelsExtractionStrategy';

export default class Converter {
    featureSwitches: IProvideFeatureSwitches;
    constructor(featureSwitches: IProvideFeatureSwitches) {
        this.featureSwitches = featureSwitches;
    }

    parse(data: string) {
        const t = this.stripComments(data);
        const strategies = [
            new TitleExtractionStrategy(t),
            new XAxisLabelsExtractionStrategy(t),
            new PresentationExtractionStrategy(t),
            new NoteExtractionStrategy(t),
            new AnnotationExtractionStrategy(t),
            new ComponentExtractionStrategy(t),
            new PipelineExtractionStrategy(t, this.featureSwitches),
            new EvolveExtractionStrategy(t),
            new AnchorExtractionStrategy(t),
            new LinksExtractionStrategy(t),
            new SubMapExtractionStrategy(t),
            new UrlExtractionStrategy(t),
            new AttitudeExtractionStrategy(t),
            new AcceleratorExtractionStrategy(t),
        ];
        const errorContainer = {errors: []};

        const nullPresentation = {
            style: '',
            annotations: {visibility: 0, maturity: 0},
            size: {width: 0, height: 0},
        };
        let wardleyMap: WardleyMap = {
            links: [],
            anchors: [],
            evolved: [],
            pipelines: [],
            elements: [],
            annotations: [],
            notes: [],
            presentation: nullPresentation,
            evolution: [],
            submaps: [],
            urls: [],
            attitudes: [],
            accelerators: [],
            title: '',
            errors: [],
        };
        strategies.forEach(strategy => {
            const strategyResult = strategy.apply();
            wardleyMap = Object.assign(wardleyMap, strategyResult);
            if (strategyResult.errors && strategyResult.errors.length > 0)
                errorContainer.errors = errorContainer.errors.concat(strategyResult.errors);
        });
        return Object.assign(wardleyMap, errorContainer);
    }

    stripComments(data: string) {
        const doubleSlashRemoved = data.split('\n').map(line => {
            if (line.trim().indexOf('url') === 0) {
                return line;
            }
            return line.split('//')[0];
        });

        const lines = doubleSlashRemoved;
        const linesToKeep = [];
        let open = false;

        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i];
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
