const iterationBuilder = (optArray: string[]): string[] => {
    const strings: string[] = [];
    for (let i = 0; i < optArray.length; i++) {
        strings.push(optArray.slice(0, i + 1).join(' '));
    }
    return strings;
};

const attitudes: [string, string][] = ['pioneers', 'settlers', 'townplanners'].map(a => [
    a,
    '[<visibility>, <maturity>, <visibility2>, <maturity2>]',
]);

const iterations: string[] = [
    ...attitudes,
    ['note', '<note text>', '[<visibility>, <maturity>]'],
    ['component', '<name>', '[<visibility>, <maturity>]'],
    ['accelerator', '<name>', '[<visibility>, <maturity>]'],
    ['deaccelerator', '<name>', '[<visibility>, <maturity>]'],
    ['submap', '<name>', '[<visibility>, <maturity>]', 'url(<url>)'],
    ['url', '<name>', '[<address>]'],
    ['size', '[<width>, <height>]'],
]
    .map(iterationBuilder)
    .flat();

export const EditorPrefixes: string[] = [
    'component <name> [<visibility>, <maturity>] (outsource)',
    'component <name> [<visibility>, <maturity>] (build)',
    'component <name> [<visibility>, <maturity>] (buy)',
    ...iterations,
    'anchor',
    'annotation',
    'annotations',
    'style',
    'style wardley',
    'style colour',
    'style handwritten',
    'style plain',
    'style dark',
    '(ecosystem)',
    '(market)',
    '(build)',
    '(buy)',
    '(outsource)',
    'evolve',
    'inertia',
    'pipeline',
    'title',
    'size',
    'evolution',
    'accelerator',
    'deaccelerator',
];
