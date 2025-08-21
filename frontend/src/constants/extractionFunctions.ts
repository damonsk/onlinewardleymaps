import merge from 'lodash.merge';
import {ComponentLabel, IProvideBaseElement, IProvideDecoratorsConfig} from '../types/base';
import * as Defaults from './defaults';
import {validateAndRecoverComponentName} from '../utils/componentNameValidation';
import {safeParseComponentName, ParsingContext} from '../utils/errorHandling';

export const setName = (baseElement: IProvideBaseElement & {name?: string}, element: string, config: IProvideDecoratorsConfig): void => {
    // Handle null/undefined element input
    if (!element || typeof element !== 'string') {
        console.warn('Invalid element input for setName, using fallback');
        Object.assign(baseElement, {name: 'Component'});
        return;
    }

    const start = element.indexOf(config.keyword);
    const afterKeyword = element.substr(`${config.keyword} `.length + start, element.length - `${config.keyword} `.length + start).trim();

    const context: ParsingContext = {
        line: (baseElement as any).line || 0,
        keyword: config.keyword,
        elementType: 'component',
        fullLine: element,
        position: start,
    };

    let name: string;

    // Try enhanced parsing for quoted strings, fallback to legacy for simple cases
    if (afterKeyword.startsWith('"')) {
        const parseResult = safeParseComponentName(afterKeyword, context, 'Component');

        name = parseResult.result || 'Component';

        // Log parsing issues for debugging
        if (parseResult.errors.length > 0) {
            console.warn(`Component name parsing errors on line ${context.line}:`, parseResult.errors);
        }
        if (parseResult.warnings.length > 0) {
            console.info(`Component name parsing warnings on line ${context.line}:`, parseResult.warnings);
        }
        if (parseResult.wasRecovered && parseResult.recoveryStrategy) {
            console.warn(`Component name recovered using strategy: ${parseResult.recoveryStrategy}`);
        }
    } else {
        // Legacy single-line parsing (backward compatibility) - keep original behavior
        if (afterKeyword.trim().startsWith('[')) {
            name = '';
        } else {
            const parts = afterKeyword.split(' [');
            name = parts[0].trim();
        }
    }

    // Additional validation and recovery
    const recovery = validateAndRecoverComponentName(name);

    // Use the processed name (might be sanitized or recovered)
    Object.assign(baseElement, {name: recovery.processedName});

    // Log recovery information if needed (for debugging or user feedback)
    if (recovery.wasRecovered && recovery.recoveryMessage) {
        console.warn(`Component name recovery: ${recovery.recoveryMessage}`, {
            original: recovery.originalName,
            recovered: recovery.processedName,
        });
    }
};

export const setRef = (baseElement: IProvideBaseElement & {url?: string}, element: string): void => {
    if (element.indexOf('url(') !== -1) {
        const extractedRef = element.split('url(')[1].split(')')[0].trim();
        Object.assign(baseElement, {url: extractedRef});
    }
};

export const setTextFromEnding = (baseElement: IProvideBaseElement & {text?: string}, element: string): void => {
    let text = '';
    if (element.trim().indexOf(']') > -1 && element.trim().indexOf(']') !== element.trim().length - 1) {
        if (element.replace(/\s/g, '').indexOf(']]') === -1) {
            text = element.split(']')[1].trim();
        }
        if (element.replace(/\s/g, '').indexOf(']]') > -1) {
            const pos = element.lastIndexOf(']');
            text = element.substr(pos + 1, element.length - 1).trim();
        }
    }
    Object.assign(baseElement, {text});
};

export const setOccurances = (
    baseElement: IProvideBaseElement & {
        occurances?: {visibility: number; maturity: number}[];
    },
    element: string,
): void => {
    const defaultPosition = {
        visibility: 0.9,
        maturity: 0.1,
    };
    const positionData: {visibility: number; maturity: number}[] = [];
    if (element.replace(/\s/g, '').indexOf('[[') > -1) {
        const justOccurances = '[' + element.replace(/\s/g, '').split('[[')[1].split(']]')[0] + ']';
        const occurancesAsArray = justOccurances.replace(/\],\[/g, ']|[').split('|');
        occurancesAsArray.forEach(e => {
            positionData.push(extractLocation(e, defaultPosition));
        });
    } else if (element.indexOf('[') > -1 && element.indexOf(']') > -1) {
        positionData.push(extractLocation(element, defaultPosition));
    }
    Object.assign(baseElement, {occurances: positionData});
};

export const setPipelineMaturity = (
    baseElement: IProvideBaseElement & {
        hidden?: boolean;
        maturity1?: number;
        maturity2?: number;
    },
    element: string,
): void => {
    let pipelineHidden = true;
    const pieplinePos = {maturity1: 0.2, maturity2: 0.8};
    const findPos = element.split('[');
    if (element.indexOf('[') > -1 && element.indexOf(']') > -1 && findPos.length > 1 && findPos[1].indexOf(']') > -1) {
        const extractedPos = findPos[1].split(']')[0].split(',');
        pieplinePos.maturity1 = parseFloat(extractedPos[0].trim());
        pieplinePos.maturity2 = parseFloat(extractedPos[1].trim());
        pipelineHidden = false;
    }
    Object.assign(baseElement, {
        hidden: pipelineHidden,
        maturity2: pieplinePos.maturity2,
        maturity1: pieplinePos.maturity1,
    });
};

export const setPipelineComponentMaturity = (baseElement: IProvideBaseElement & {maturity?: number}, element: string): void => {
    const pieplinePos = {maturity: 0.2};
    const findPos = element.split('[');
    if (element.indexOf('[') > -1 && element.indexOf(']') > -1 && findPos.length > 1 && findPos[1].indexOf(']') > -1) {
        const extractedPos = findPos[1].split(']')[0];
        pieplinePos.maturity = parseFloat(extractedPos.trim());
    }
    Object.assign(baseElement, {maturity: pieplinePos.maturity});
};

export const extractLocation = (
    input: string,
    defaultValue: {visibility: number; maturity: number},
): {visibility: number; maturity: number} => {
    if (input.indexOf('[') > -1 && input.indexOf(']') > -1) {
        const loc = input.split('[')[1].trim().split(']')[0].replace(/\s/g, '').split(',');
        return {
            visibility: isNaN(parseFloat(loc[0])) ? defaultValue.visibility : parseFloat(loc[0]),
            maturity: isNaN(parseFloat(loc[1])) ? defaultValue.maturity : parseFloat(loc[1]),
        };
    } else return defaultValue;
};

export const extractSize = (input: string, defaultValue: {width: number; height: number}): {width: number; height: number} => {
    if (input.indexOf('[') > -1 && input.indexOf(']') > -1) {
        const loc = input.split('[')[1].trim().split(']')[0].replace(/\s/g, '').split(',');
        return {
            width: isNaN(parseFloat(loc[0])) ? defaultValue.width : parseFloat(loc[0]),
            height: isNaN(parseFloat(loc[1])) ? defaultValue.height : parseFloat(loc[1]),
        };
    } else return defaultValue;
};

export const extractManyLocations = (
    input: string,
    defaultValue: {
        visibility: number;
        maturity: number;
        visibility2: number;
        maturity2: number;
    },
): {
    visibility: number;
    maturity: number;
    visibility2: number;
    maturity2: number;
} => {
    if (input.indexOf('[') > -1 && input.indexOf(']') > -1) {
        const loc = input.split('[')[1].trim().split(']')[0].replace(/\s/g, '').split(',');
        return {
            visibility: isNaN(parseFloat(loc[0])) ? defaultValue.visibility : parseFloat(loc[0]),
            maturity: isNaN(parseFloat(loc[1])) ? defaultValue.maturity : parseFloat(loc[1]),
            visibility2: isNaN(parseFloat(loc[2])) ? defaultValue.visibility2 : parseFloat(loc[2]),
            maturity2: isNaN(parseFloat(loc[3])) ? defaultValue.maturity2 : parseFloat(loc[3]),
        };
    } else return defaultValue;
};

export const setMethod = (
    baseElement: IProvideBaseElement & {
        name?: string;
        buy?: boolean;
        build?: boolean;
        outsource?: boolean;
        market?: boolean;
        ecosystem?: boolean;
        increaseLabelSpacing?: number;
    },
    element: string,
    config: IProvideDecoratorsConfig,
): void => {
    const afterKeyword = element.substr(`${config.keyword} `.length).trim();

    const context: ParsingContext = {
        line: (baseElement as any).line || 0,
        keyword: config.keyword,
        elementType: 'method',
        fullLine: element,
        position: element.indexOf(config.keyword),
    };

    let name: string;

    // Try enhanced parsing for quoted strings, fallback to legacy for simple cases
    if (afterKeyword.startsWith('"')) {
        const parseResult = safeParseComponentName(afterKeyword, context, 'Component');

        name = parseResult.result || 'Component';

        // Log parsing issues for debugging
        if (parseResult.errors.length > 0) {
            console.warn(`Method decorator parsing errors on line ${context.line}:`, parseResult.errors);
        }
        if (parseResult.warnings.length > 0) {
            console.info(`Method decorator parsing warnings on line ${context.line}:`, parseResult.warnings);
        }
        if (parseResult.wasRecovered && parseResult.recoveryStrategy) {
            console.warn(`Method decorator name recovered using strategy: ${parseResult.recoveryStrategy}`);
        }
    } else {
        // Legacy single-line parsing (backward compatibility) - keep original behavior
        name = afterKeyword;
    }

    // Additional validation and recovery
    const recovery = validateAndRecoverComponentName(name);

    // We set the appropriate boolean flag and name, but NOT increaseLabelSpacing here
    // The increaseLabelSpacing will be applied to the referenced component in methodExtractor.ts
    Object.assign(baseElement, {
        name: recovery.processedName,
        // Initialize all decorator flags to false
        buy: false,
        build: false,
        outsource: false,
        market: false,
        ecosystem: false,
        // Set the specific flag based on the keyword
        [config.keyword]: true,
    });

    // Log recovery information if needed (for debugging or user feedback)
    if (recovery.wasRecovered && recovery.recoveryMessage) {
        console.warn(`Method decorator component name recovery: ${recovery.recoveryMessage}`, {
            original: recovery.originalName,
            recovered: recovery.processedName,
        });
    }
};

export const setAttitude = (
    baseElement: IProvideBaseElement & {attitude?: string},
    element: string,
    config: IProvideDecoratorsConfig,
): void => {
    Object.assign(baseElement, {attitude: config.keyword});
};

export const setHeightWidth = (baseElement: IProvideBaseElement & {width?: string; height?: string}, element: string): void => {
    if (!element.includes(']')) {
        return;
    }
    const [width, height] = element.split(']')[1].trim().split(' ');
    Object.assign(baseElement, {width, height});
};

export const setNameWithMaturity = (
    baseElement: IProvideBaseElement & {
        name?: string;
        override?: string;
        maturity?: number;
    },
    element: string,
): void => {
    let nameSection = element.split('evolve ')[1]?.trim();
    if (!nameSection) {
        // Handle malformed evolve statement
        console.warn(`Malformed evolve statement: ${element}`);
        Object.assign(baseElement, {name: 'Component', override: '', maturity: 0.85});
        return;
    }

    const context: ParsingContext = {
        line: (baseElement as any).line || 0,
        keyword: 'evolve',
        elementType: 'evolution',
        fullLine: element,
        position: element.indexOf('evolve'),
    };

    let name: string;
    let override = '';
    let newPoint = 0.85;

    // Handle quoted multi-line names in evolution with enhanced error handling
    if (nameSection.startsWith('"')) {
        // Use enhanced parsing for quoted evolution names
        const parseResult = safeParseComponentName(nameSection, context, 'Component');

        if (parseResult.success && parseResult.result) {
            name = parseResult.result;

            // Look for additional evolution syntax after the quoted name
            // This is more complex because we need to handle the original nameSection parsing
            const quotedMatch = nameSection.match(/^"(?:[^"\\]|\\.)*"/);
            if (quotedMatch) {
                // Remove the quoted part to continue with maturity parsing
                nameSection = nameSection.substring(quotedMatch[0].length).trim();

                // Check for override after the quoted name: -> "override name" or -> override name
                if (nameSection.startsWith('->')) {
                    const afterArrow = nameSection.substring(2).trim();
                    // Find the maturity value to separate it from the override
                    const maturityMatch = afterArrow.match(/\s([0-9]?\.[0-9]+[0-9]?)$/);
                    if (maturityMatch) {
                        try {
                            newPoint = parseFloat(maturityMatch[1]);
                            override = afterArrow.substring(0, afterArrow.lastIndexOf(maturityMatch[1])).trim();
                        } catch (e) {
                            console.warn(`Failed to parse evolution maturity: ${maturityMatch[1]}`);
                        }
                    } else {
                        // No maturity found, everything after -> is override
                        override = afterArrow;
                    }
                } else {
                    // Check for maturity value directly after quoted name
                    const maturityMatch = nameSection.match(/^([0-9]?\.[0-9]+[0-9]?)$/);
                    if (maturityMatch) {
                        try {
                            newPoint = parseFloat(maturityMatch[1]);
                        } catch (e) {
                            console.warn(`Failed to parse evolution maturity: ${maturityMatch[1]}`);
                        }
                    }
                }
            }
        } else {
            // Parsing failed, use fallback
            name = parseResult.result || 'Component';
        }

        // Log parsing issues
        if (parseResult.errors.length > 0) {
            console.warn(`Evolution parsing errors on line ${context.line}:`, parseResult.errors);
        }
        if (parseResult.warnings.length > 0) {
            console.info(`Evolution parsing warnings on line ${context.line}:`, parseResult.warnings);
        }
        if (parseResult.wasRecovered && parseResult.recoveryStrategy) {
            console.warn(`Evolution name recovered using strategy: ${parseResult.recoveryStrategy}`);
        }
    } else {
        // Legacy single-line parsing (backward compatibility) with enhanced error handling
        try {
            name = nameSection;
            const evolveMaturity = element.match(/\s[0-9]?\.[0-9]+[0-9]?/);
            if (evolveMaturity && evolveMaturity.length > 0) {
                newPoint = parseFloat(evolveMaturity[0]);
                const unprocessedName = name.split(String(newPoint))[0];
                name = unprocessedName;
                if (name.indexOf('->') > -1) {
                    const parts = name.split('->');
                    if (parts.length >= 2) {
                        override = parts[1].trim();
                        name = parts[0];
                    }
                } else {
                    // Only trim when there's no override to maintain exact legacy behavior
                    name = name.trim();
                }
            }
        } catch (error) {
            console.warn(`Evolution parsing failed, using fallback:`, error);
            name = 'Component';
        }
    }

    // Validate and recover component name if needed
    const recovery = validateAndRecoverComponentName(name);

    // Use the processed name (might be sanitized or recovered)
    Object.assign(baseElement, {name: recovery.processedName, override, maturity: newPoint});

    // Log recovery information if needed (for debugging or user feedback)
    if (recovery.wasRecovered && recovery.recoveryMessage) {
        console.warn(`Evolution component name recovery: ${recovery.recoveryMessage}`, {
            original: recovery.originalName,
            recovered: recovery.processedName,
        });
    }
};

export const setCoords = (
    baseElement: IProvideBaseElement & {
        visibility?: number;
        maturity?: number;
    },
    element: string,
): void => {
    const positionData = extractLocation(element, {
        visibility: 0.9,
        maturity: 0.1,
    });
    Object.assign(baseElement, {
        maturity: positionData.maturity,
        visibility: positionData.visibility,
    });
};

export const isDeAccelerator = (baseElement: IProvideBaseElement & {deaccelerator?: boolean}, element: string): void => {
    Object.assign(baseElement, {
        deaccelerator: element.indexOf('deaccelerator') === 0,
    });
};

export const setManyCoords = (
    baseElement: IProvideBaseElement & {
        visibility?: number;
        maturity?: number;
        visibility2?: number;
        maturity2?: number;
    },
    element: string,
): void => {
    const positionData = extractManyLocations(element, {
        visibility: 0.9,
        maturity: 0.1,
        visibility2: 0.8,
        maturity2: 0.2,
    });
    Object.assign(baseElement, {
        maturity: positionData.maturity,
        visibility: positionData.visibility,
        maturity2: positionData.maturity2,
        visibility2: positionData.visibility2,
    });
};

export const decorators = (
    baseElement: IProvideBaseElement & {
        decorators?: any;
        increaseLabelSpacing?: number;
    },
    element: string,
): IProvideBaseElement & {
    decorators?: any;
    increaseLabelSpacing?: number;
} => {
    // Initialize all decorator flags to false to ensure we have explicit boolean values
    const defaultDecorators = {
        ecosystem: false,
        market: false,
        buy: false,
        build: false,
        outsource: false,
    };

    // Set default decorators on baseElement if not already present
    if (!baseElement.decorators) {
        baseElement.decorators = {...defaultDecorators};
    } else {
        baseElement.decorators = {...defaultDecorators, ...baseElement.decorators};
    }

    [methodDecorator, marketDecorator, ecosystemDecorator].forEach(d => merge(baseElement, d(baseElement, element)));
    return baseElement;
};

export const setLabel = (
    baseElement: IProvideBaseElement & {
        increaseLabelSpacing?: number;
        label?: ComponentLabel;
    },
    element: string,
): void => {
    let labelOffset = {...Defaults.defaultLabelOffset};
    if (baseElement.increaseLabelSpacing) {
        labelOffset = {
            x: labelOffset.x * baseElement.increaseLabelSpacing,
            y: labelOffset.y * baseElement.increaseLabelSpacing,
        };
    }

    if (element.indexOf('label ') > -1) {
        const findPos = element.split('label [');
        if (findPos.length > 0 && findPos[1].indexOf(']') > -1) {
            const extractedPos = findPos[1].split(']')[0].split(',');
            labelOffset.x = parseFloat(extractedPos[0].trim());
            labelOffset.y = parseFloat(extractedPos[1].trim());
        }
    }
    Object.assign(baseElement, {label: labelOffset});
};

export const setEvolve = (
    baseElement: IProvideBaseElement & {
        evolveMaturity?: number | null;
        evolving?: boolean;
    },
    element: string,
): void => {
    let newPoint: string | null = null;
    if (element.indexOf('evolve ') > -1) {
        newPoint = element.split('evolve ')[1].trim();
        newPoint = newPoint.replace('inertia', '').trim();
    }
    Object.assign(baseElement, {
        evolveMaturity: newPoint,
        evolving: newPoint !== null && newPoint !== undefined,
    });
};

export const setInertia = (baseElement: IProvideBaseElement & {inertia?: boolean}, element: string): void => {
    // Support both 'inertia' and '(inertia)' syntax in the DSL
    Object.assign(baseElement, {
        inertia: element.indexOf('inertia') !== -1 || element.indexOf('(inertia)') !== -1,
    });
};

export const setText = (baseElement: IProvideBaseElement & {text?: string}, element: string, config: IProvideDecoratorsConfig): void => {
    const start = element.indexOf(config.keyword);
    const afterKeyword = element.substr(`${config.keyword} `.length + start, element.length - `${config.keyword} `.length + start).trim();

    let text: string;

    // Check for quoted string (multi-line support)
    if (afterKeyword.startsWith('"')) {
        // Extract quoted content - handle escaped quotes and find the closing quote before coordinates
        const quotedMatch = afterKeyword.match(/^"((?:[^"\\]|\\.)*)"\s*\[/);
        if (quotedMatch) {
            // Successfully matched quoted string with coordinates
            text = quotedMatch[1]
                .replace(/\\"/g, '"') // Unescape quotes
                .replace(/\\n/g, '\n') // Convert explicit \n to actual line breaks
                .replace(/\\\\/g, '\\'); // Unescape backslashes
        } else {
            // Malformed quoted string - try to extract what we can
            const quoteEnd = findClosingQuote(afterKeyword, 1);
            if (quoteEnd !== -1) {
                text = afterKeyword.substring(1, quoteEnd).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
            } else {
                // No closing quote found - fallback to legacy parsing
                text = afterKeyword.split(' [')[0].trim();
                // Remove leading quote if present
                if (text.startsWith('"')) {
                    text = text.substring(1);
                }
            }
        }
    } else {
        // Legacy single-line parsing (backward compatibility)
        // Check if afterKeyword starts directly with coordinates (no text)
        if (afterKeyword.trim().startsWith('[')) {
            text = '';
        } else {
            const parts = afterKeyword.split(' [');
            text = parts[0].trim();
        }
    }

    Object.assign(baseElement, {text});
};

/**
 * Helper function to find the closing quote, handling escaped quotes
 * @param str - The string to search in
 * @param startIndex - The index to start searching from
 * @returns The index of the closing quote, or -1 if not found
 */
function findClosingQuote(str: string, startIndex: number): number {
    let i = startIndex;
    while (i < str.length) {
        if (str[i] === '"') {
            // Check if this quote is escaped
            let backslashCount = 0;
            let j = i - 1;
            while (j >= 0 && str[j] === '\\') {
                backslashCount++;
                j--;
            }
            // If even number of backslashes (including 0), the quote is not escaped
            if (backslashCount % 2 === 0) {
                return i;
            }
        }
        i++;
    }
    return -1;
}

export const setContext = (
    baseElement: IProvideBaseElement & {context?: string},
    element: string,
    config: IProvideDecoratorsConfig,
): void => {
    const start = element.indexOf(config.keyword);
    const text = element
        .substr(`${config.keyword} `.length + start, element.length - `${config.keyword} `.length + start)
        .trim()
        .split(';')[1]
        .trim();
    Object.assign(baseElement, {context: text});
};

export const setNumber = (
    baseElement: IProvideBaseElement & {number?: number},
    element: string,
    config: IProvideDecoratorsConfig,
): void => {
    const number = element.split(`${config.keyword} `)[1].trim().split(' [')[0].trim();
    Object.assign(baseElement, {number: parseInt(number)});
};

const methodDecorator = (
    baseElement: IProvideBaseElement & {
        decorators?: {
            buy?: boolean;
            build?: boolean;
            outsource?: boolean;
        };
        increaseLabelSpacing?: number;
    },
    element: string,
) => {
    const meths = ['build', 'buy', 'outsource'];
    const decs: {[key: string]: boolean} = {};
    let parentAttributes = {};
    for (let i = 0; i < meths.length; i++) {
        const meth = meths[i];
        if (element.indexOf(meth) > -1 && element.indexOf('(') < element.indexOf(meth) && element.indexOf(')') > element.indexOf(meth)) {
            decs[meth] = true;
            parentAttributes = {increaseLabelSpacing: 2};
            break;
        }
    }
    return {decorators: decs, ...parentAttributes};
};

const marketDecorator = (
    baseElement: IProvideBaseElement & {
        decorators?: {market?: boolean};
        increaseLabelSpacing?: number;
    },
    element: string,
) => {
    const decs: {[key: string]: boolean} = {};
    let parentAttributes = {};
    if (
        (element.indexOf('market') > -1 &&
            element.indexOf('(') < element.indexOf('market') &&
            element.indexOf(')') > element.indexOf('market')) ||
        element.indexOf('market') === 0
    ) {
        decs.market = true;
        parentAttributes = {increaseLabelSpacing: 2};
    }
    return {decorators: decs, ...parentAttributes};
};

const ecosystemDecorator = (
    baseElement: IProvideBaseElement & {
        decorators?: {ecosystem?: boolean};
        increaseLabelSpacing?: number;
    },
    element: string,
) => {
    const decs: {[key: string]: boolean} = {};
    let parentAttributes = {};
    if (
        (element.indexOf('ecosystem') > -1 &&
            element.indexOf('(') < element.indexOf('ecosystem') &&
            element.indexOf(')') > element.indexOf('ecosystem')) ||
        element.indexOf('ecosystem') === 0
    ) {
        decs.ecosystem = true;
        parentAttributes = {increaseLabelSpacing: 3};
    }
    return {decorators: decs, ...parentAttributes};
};

export const setUrl = (baseElement: IProvideBaseElement & {url?: string}, element: string): void => {
    const path = element.split('[')[1].trim().split(']')[0].trim();
    Object.assign(baseElement, {url: path});
};
