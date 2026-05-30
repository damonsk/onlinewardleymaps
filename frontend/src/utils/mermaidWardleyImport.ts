const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9 -]*$/;

interface ParsedLine {
    lineNumber: number;
    text: string;
}

const escapeQuotedText = (value: string): string => {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
};

const decodeEscapedText = (value: string): string => {
    return value.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
};

const formatName = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error('Component and anchor names cannot be empty.');
    }

    return NAME_PATTERN.test(trimmed) ? trimmed : `"${escapeQuotedText(trimmed)}"`;
};

const findTokenOutsideQuotes = (input: string, tokens: string[]): {index: number; token: string} | null => {
    let inQuotes = false;
    let escaped = false;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }

        if (inQuotes) {
            continue;
        }

        for (const token of tokens) {
            if (input.startsWith(token, i)) {
                return {index: i, token};
            }
        }
    }

    return null;
};

const parseQuotedValue = (input: string): {value: string; rest: string} => {
    if (!input.startsWith('"')) {
        throw new Error('Expected a quoted value.');
    }

    let escaped = false;
    let value = '';

    for (let i = 1; i < input.length; i++) {
        const char = input[i];

        if (escaped) {
            value += `\\${char}`;
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if (char === '"') {
            return {
                value: decodeEscapedText(value),
                rest: input.slice(i + 1).trim(),
            };
        }

        value += char;
    }

    throw new Error('Unterminated quoted value.');
};

const parseName = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) {
        throw new Error('Expected a name.');
    }

    if (trimmed.startsWith('"')) {
        return parseQuotedValue(trimmed).value;
    }

    return trimmed;
};

const parseCoordinateBlock = (input: string): number[] => {
    const match = input.match(/\[([^\]]+)\]/);
    if (!match) {
        throw new Error('Expected a coordinate block.');
    }

    return match[1]
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
        .map(value => {
            const parsed = parseFloat(value);
            if (Number.isNaN(parsed)) {
                throw new Error(`Invalid numeric value "${value}".`);
            }
            return parsed;
        });
};

const findCoordinateBlocks = (input: string): Array<{start: number; end: number; text: string}> => {
    const blocks: Array<{start: number; end: number; text: string}> = [];
    let inQuotes = false;
    let escaped = false;
    let blockStart = -1;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }

        if (inQuotes) {
            continue;
        }

        if (char === '[' && blockStart === -1) {
            blockStart = i;
            continue;
        }

        if (char === ']' && blockStart !== -1) {
            blocks.push({
                start: blockStart,
                end: i,
                text: input.slice(blockStart, i + 1),
            });
            blockStart = -1;
        }
    }

    return blocks;
};

const parseCoordinateLine = (line: string, keyword: string): {name: string; coordinates: number[]; suffix: string} => {
    const trimmed = line.trim();
    const content = trimmed.slice(keyword.length).trim();
    const coordinateBlocks = findCoordinateBlocks(content);

    if (coordinateBlocks.length === 0) {
        throw new Error(`Expected coordinates for ${keyword}.`);
    }

    const firstBlock = coordinateBlocks[0];
    const beforeCoords = content.slice(0, firstBlock.start).trim();
    const suffix = content.slice(firstBlock.end + 1).trim();

    return {
        name: parseName(beforeCoords),
        coordinates: parseCoordinateBlock(firstBlock.text),
        suffix,
    };
};

const normalizeInput = (input: string): ParsedLine[] => {
    return input
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map((text, index) => ({lineNumber: index + 1, text}))
        .filter(({text}) => {
            const trimmed = text.trim();
            if (!trimmed) return false;
            if (trimmed === '```' || trimmed === '```mermaid' || trimmed === 'mermaid') return false;
            if (trimmed.startsWith('%%')) return false;
            return true;
        });
};

const parseEvolutionLine = (line: string): string => {
    const stages = line
        .replace(/^evolution\s+/, '')
        .split(/\s*->\s*/)
        .map(stage => stage.trim().replace(/@\s*-?\d*\.?\d+\s*$/u, '').trim());

    if (stages.length !== 4) {
        throw new Error('Evolution lines must define exactly four stages.');
    }

    return `evolution ${stages.join('->')}`;
};

const parseLinkLine = (line: string): string => {
    const tokenMatch = findTokenOutsideQuotes(line, ['+<>', '+<', '+>', '->']);
    if (!tokenMatch) {
        throw new Error('Unsupported link syntax.');
    }

    const start = parseName(line.slice(0, tokenMatch.index));
    const end = parseName(line.slice(tokenMatch.index + tokenMatch.token.length));
    return `${formatName(start)}${tokenMatch.token}${formatName(end)}`;
};

const parseAnnotationLine = (line: string): string => {
    const match = line.match(/^annotation\s+(\d+)\s*,\s*(\[[^\]]+\])(?:\s+(.*))?$/);
    if (!match) {
        throw new Error('Invalid annotation syntax.');
    }

    let annotationText = (match[3] || '').trim();
    if (annotationText.startsWith('"')) {
        annotationText = parseQuotedValue(annotationText).value;
    }

    return annotationText ? `annotation ${match[1]} ${match[2]} ${annotationText}` : `annotation ${match[1]} ${match[2]}`;
};

const parseNoteLine = (line: string): string => {
    const noteBody = line.replace(/^note\s+/, '').trim();
    const {value, rest} = parseQuotedValue(noteBody);
    const coordinates = parseCoordinateBlock(rest);

    if (coordinates.length !== 2) {
        throw new Error('Notes require two coordinates.');
    }

    return `note "${escapeQuotedText(value)}" [${coordinates[0]}, ${coordinates[1]}]`;
};

const parseComponentLine = (line: string, keyword: 'component' | 'anchor'): string => {
    const parsed = parseCoordinateLine(line, keyword);

    if (parsed.coordinates.length !== 2) {
        throw new Error(`${keyword} requires [visibility, evolution].`);
    }

    const suffix = parsed.suffix ? ` ${parsed.suffix}` : '';
    return `${keyword} ${formatName(parsed.name)} [${parsed.coordinates[0]}, ${parsed.coordinates[1]}]${suffix}`;
};

const parseSimpleCoordinateKeywordLine = (line: string, keyword: 'accelerator' | 'deaccelerator'): string => {
    const parsed = parseCoordinateLine(line, keyword);

    if (parsed.coordinates.length !== 2) {
        throw new Error(`${keyword} requires [visibility, evolution].`);
    }

    const suffix = parsed.suffix ? ` ${parsed.suffix}` : '';
    return `${keyword} ${formatName(parsed.name)} [${parsed.coordinates[0]}, ${parsed.coordinates[1]}]${suffix}`;
};

const parseEvolveLine = (line: string): string => {
    const trimmed = line.replace(/^evolve\s+/, '').trim();
    const maturityToken = trimmed.split(/\s+/).pop();

    if (!maturityToken) {
        throw new Error('Invalid evolve syntax.');
    }

    const maturity = parseFloat(maturityToken);
    if (Number.isNaN(maturity)) {
        throw new Error('Evolve target maturity must be numeric.');
    }

    const name = parseName(trimmed.slice(0, trimmed.length - maturityToken.length));
    return `evolve ${formatName(name)} ${maturity}`;
};

const parsePipelineBlock = (lines: ParsedLine[], startIndex: number): {owmLines: string[]; nextIndex: number} => {
    const startLine = lines[startIndex].text.trim();
    const match = startLine.match(/^pipeline\s+(.+?)\s*\{\s*$/);
    if (!match) {
        throw new Error('Invalid pipeline declaration.');
    }

    const pipelineName = parseName(match[1]);
    const owmLines = [`pipeline ${formatName(pipelineName)}`, '{'];

    let currentIndex = startIndex + 1;
    for (; currentIndex < lines.length; currentIndex++) {
        const current = lines[currentIndex].text.trim();
        if (current === '}') {
            owmLines.push('}');
            return {owmLines, nextIndex: currentIndex};
        }

        if (!current.startsWith('component ')) {
            throw new Error('Only component lines are allowed inside Mermaid pipeline blocks.');
        }

        const parsed = parseCoordinateLine(current, 'component');
        if (parsed.coordinates.length !== 1) {
            throw new Error('Pipeline child components require [evolution].');
        }

        const suffix = parsed.suffix ? ` ${parsed.suffix}` : '';
        owmLines.push(`  component ${formatName(parsed.name)} [${parsed.coordinates[0]}]${suffix}`);
    }

    throw new Error('Pipeline block is missing a closing brace.');
};

export const importWardleyMapFromMermaid = (input: string): string => {
    const lines = normalizeInput(input);
    if (lines.length === 0) {
        throw new Error('No Mermaid Wardley content was provided.');
    }

    const hasWardleyDeclaration = lines.some(line => line.text.trim() === 'wardley-beta');
    if (!hasWardleyDeclaration) {
        throw new Error('Expected Mermaid Wardley input to start with wardley-beta.');
    }

    const output: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const current = lines[i].text.trim();

        try {
            if (current === 'wardley-beta') {
                continue;
            }

            if (current.startsWith('title ')) {
                output.push(current);
                continue;
            }

            if (current.startsWith('size ')) {
                output.push(current);
                continue;
            }

            if (current.startsWith('valuechain ')) {
                output.push(current);
                continue;
            }

            if (current.startsWith('evolution ')) {
                output.push(parseEvolutionLine(current));
                continue;
            }

            if (current.startsWith('annotations ')) {
                output.push(current);
                continue;
            }

            if (current.startsWith('annotation ')) {
                output.push(parseAnnotationLine(current));
                continue;
            }

            if (current.startsWith('anchor ')) {
                output.push(parseComponentLine(current, 'anchor'));
                continue;
            }

            if (current.startsWith('accelerator ')) {
                output.push(parseSimpleCoordinateKeywordLine(current, 'accelerator'));
                continue;
            }

            if (current.startsWith('deaccelerator ')) {
                output.push(parseSimpleCoordinateKeywordLine(current, 'deaccelerator'));
                continue;
            }

            if (current.startsWith('component ')) {
                output.push(parseComponentLine(current, 'component'));
                continue;
            }

            if (current.startsWith('note ')) {
                output.push(parseNoteLine(current));
                continue;
            }

            if (current.startsWith('evolve ')) {
                output.push(parseEvolveLine(current));
                continue;
            }

            if (current.startsWith('pipeline ')) {
                const {owmLines, nextIndex} = parsePipelineBlock(lines, i);
                output.push(...owmLines);
                i = nextIndex;
                continue;
            }

            if (findTokenOutsideQuotes(current, ['+<>', '+<', '+>', '->'])) {
                output.push(parseLinkLine(current));
                continue;
            }

            throw new Error('Unsupported Mermaid Wardley syntax.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown parse failure.';
            throw new Error(`Line ${lines[i].lineNumber}: ${message}`);
        }
    }

    return output.join('\n');
};
