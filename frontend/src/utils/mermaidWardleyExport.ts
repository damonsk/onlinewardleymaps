import {MapNotes} from '../types/base';
import {PipelineData, UnifiedComponent} from '../types/unified/components';
import {UnifiedWardleyMap} from '../types/unified/map';

const formatNumber = (value: number | undefined): string => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '0';
    }

    return value.toFixed(2).replace(/\.?0+$/, '');
};

const escapeQuotedText = (value: string): string => {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
};

const needsQuotedName = (value: string): boolean => {
    return !/^[A-Za-z][A-Za-z0-9 -]*$/.test(value);
};

const formatName = (value: string): string => {
    if (!value) {
        return 'Unnamed';
    }

    return needsQuotedName(value) ? `"${escapeQuotedText(value)}"` : value;
};

const buildComponentSuffix = (component: UnifiedComponent): string => {
    const suffixes: string[] = [];

    if (component.decorators?.build) suffixes.push('(build)');
    else if (component.decorators?.buy) suffixes.push('(buy)');
    else if (component.decorators?.outsource) suffixes.push('(outsource)');
    else if (component.decorators?.market) suffixes.push('(market)');

    if (component.inertia) suffixes.push('(inertia)');

    return suffixes.length > 0 ? ` ${suffixes.join(' ')}` : '';
};

const buildComponentLine = (component: UnifiedComponent): string => {
    return `component ${formatName(component.name)} [${formatNumber(component.visibility)}, ${formatNumber(component.maturity)}]${buildComponentSuffix(component)}`;
};

const buildPipelineChildLine = (name: string, maturity: number): string => {
    return `  component ${formatName(name)} [${formatNumber(maturity)}]`;
};

const buildNoteLine = (note: MapNotes): string => {
    return `note "${escapeQuotedText(note.text)}" [${formatNumber(note.visibility)}, ${formatNumber(note.maturity)}]`;
};

const getExportableComponents = (map: UnifiedWardleyMap): UnifiedComponent[] => {
    const seen = new Set<string>();
    const ordered = [...map.components, ...map.markets, ...map.ecosystems];

    return ordered.filter(component => {
        const key = `${component.id}:${component.name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return component.type === 'component' || component.type === 'market' || component.type === 'ecosystem';
    });
};

const buildPipelineBlock = (pipeline: PipelineData): string[] => {
    if (!pipeline.components || pipeline.components.length === 0) {
        return [];
    }

    const lines = [`pipeline ${formatName(pipeline.name)} {`];
    pipeline.components.forEach(component => {
        lines.push(buildPipelineChildLine(component.name, component.maturity));
    });
    lines.push('}');
    return lines;
};

export const exportWardleyMapToMermaid = (map: UnifiedWardleyMap): string => {
    const lines: string[] = ['wardley-beta'];

    if (map.title) {
        lines.push(`title ${map.title}`);
    }

    const width = map.presentation?.size?.width;
    const height = map.presentation?.size?.height;
    if (typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0) {
        lines.push(`size [${Math.round(width)}, ${Math.round(height)}]`);
    }

    if (lines.length > 1) {
        lines.push('');
    }

    map.anchors.forEach(anchor => {
        lines.push(`anchor ${formatName(anchor.name)} [${formatNumber(anchor.visibility)}, ${formatNumber(anchor.maturity)}]`);
    });

    const components = getExportableComponents(map);
    components.forEach(component => {
        lines.push(buildComponentLine(component));
    });

    if (map.anchors.length > 0 || components.length > 0) {
        lines.push('');
    }

    map.pipelines.forEach(pipeline => {
        const pipelineLines = buildPipelineBlock(pipeline);
        if (pipelineLines.length > 0) {
            lines.push(...pipelineLines, '');
        }
    });

    map.links.forEach(link => {
        const arrow = link.flow === false ? '->' : '+>';
        lines.push(`${formatName(link.start)} ${arrow} ${formatName(link.end)}`);
    });

    if (map.links.length > 0) {
        lines.push('');
    }

    map.evolved.forEach(evolved => {
        lines.push(`evolve ${formatName(evolved.name)} ${formatNumber(evolved.maturity)}`);
    });

    if (map.evolved.length > 0) {
        lines.push('');
    }

    map.notes.forEach(note => {
        lines.push(buildNoteLine(note));
    });

    return lines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};
