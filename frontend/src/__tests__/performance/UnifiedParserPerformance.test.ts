import {featureSwitches} from '../../constants/featureswitches';
import {UnifiedConverter} from '../../conversion/UnifiedConverter';
import {MapElements} from '../../processing/MapElements';
import {processLinks} from '../../utils/mapProcessing';

interface FixtureSize {
    name: string;
    nodeCount: number;
    linkCount: number;
}

interface TimingSample {
    parseMs: number;
    semanticMs: number;
    totalMs: number;
}

const fixtureSizes: FixtureSize[] = [
    {name: 'small', nodeCount: 25, linkCount: 40},
    {name: 'medium', nodeCount: 200, linkCount: 400},
    {name: 'large', nodeCount: 1000, linkCount: 2000},
];

const measuredRuns = 3;
const antiCatastrophicCeilingMs = 30_000;

function createMapText({nodeCount, linkCount}: FixtureSize): string {
    const components = Array.from({length: nodeCount}, (_, index) => {
        const visibility = 0.05 + ((index * 37) % 900) / 1000;
        const maturity = 0.05 + ((index * 53) % 900) / 1000;
        return `component Node${index} [${visibility.toFixed(3)}, ${maturity.toFixed(3)}]`;
    });
    const links = Array.from({length: linkCount}, (_, index) => {
        const start = index % nodeCount;
        const hop = Math.floor(index / nodeCount) + 1;
        const end = (start + hop) % nodeCount;
        return `Node${start}->Node${end}`;
    });

    return [...components, ...links].join('\n');
}

function runCharacterization(mapText: string, fixture: FixtureSize): TimingSample {
    const parseStarted = performance.now();
    const map = new UnifiedConverter(featureSwitches).parse(mapText);
    const parseFinished = performance.now();

    const mapElements = new MapElements(map);
    const processedLinks = processLinks(map.links, mapElements, map.anchors, false);
    const semanticFinished = performance.now();

    expect(map.errors).toHaveLength(0);
    expect(map.components).toHaveLength(fixture.nodeCount);
    expect(map.links).toHaveLength(fixture.linkCount);
    expect(mapElements.getAllComponents()).toHaveLength(fixture.nodeCount);
    expect(processedLinks.reduce((count, group) => count + group.links.length, 0)).toBe(fixture.linkCount);

    return {
        parseMs: parseFinished - parseStarted,
        semanticMs: semanticFinished - parseFinished,
        totalMs: semanticFinished - parseStarted,
    };
}

function summarize(samples: number[]): string {
    const sorted = [...samples].sort((left, right) => left - right);
    const median = sorted[Math.floor(sorted.length / 2)];
    return `${Math.min(...samples).toFixed(1)}/${median.toFixed(1)}/${Math.max(...samples).toFixed(1)}`;
}

describe('Unified parser and render-ready state performance characterization', () => {
    jest.setTimeout(180_000);

    it.each(fixtureSizes)('$name map stays structurally correct without catastrophic slowdown', fixture => {
        const mapText = createMapText(fixture);

        runCharacterization(mapText, fixture);
        const samples = Array.from({length: measuredRuns}, () => runCharacterization(mapText, fixture));

        console.info(
            `[parser-performance] ${fixture.name} nodes=${fixture.nodeCount} links=${fixture.linkCount} runs=${measuredRuns} ` +
                `parse_ms(min/median/max)=${summarize(samples.map(sample => sample.parseMs))} ` +
                `semantic_ms(min/median/max)=${summarize(samples.map(sample => sample.semanticMs))} ` +
                `total_ms(min/median/max)=${summarize(samples.map(sample => sample.totalMs))}`,
        );

        expect(Math.max(...samples.map(sample => sample.totalMs))).toBeLessThan(antiCatastrophicCeilingMs);
    });
});
