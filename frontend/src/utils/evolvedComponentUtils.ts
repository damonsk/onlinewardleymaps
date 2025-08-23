/**
 * Utility functions for working with evolved components
 */

export interface EvolvedComponentInfo {
    evolvedName: string;
    sourceName: string;
    found: boolean;
}

/**
 * Find evolved component information from map text using the _evolved ID
 */
export function findEvolvedComponentInfo(mapText: string, evolvedComponentId: string): EvolvedComponentInfo {
    if (!evolvedComponentId.endsWith('_evolved')) {
        return { evolvedName: '', sourceName: '', found: false };
    }

    const lines = mapText.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith('evolve ')) continue;
        
        const evolveContent = trimmedLine.substring(7).trim(); // Remove 'evolve '
        const arrowIndex = evolveContent.indexOf('->');
        if (arrowIndex === -1) continue;
        
        // Extract source component name
        const sourcePart = evolveContent.substring(0, arrowIndex).trim();
        let sourceName = '';
        
        if (sourcePart.startsWith('"')) {
            const quotedMatch = sourcePart.match(/^"((?:[^"\\]|\\.)*)"/);
            if (quotedMatch) {
                sourceName = quotedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
            }
        } else {
            sourceName = sourcePart;
        }
        
        // Extract evolved component name (target)
        const targetPart = evolveContent.substring(arrowIndex + 2).trim();
        let evolvedName = '';
        
        if (targetPart.startsWith('"')) {
            const quotedMatch = targetPart.match(/^"((?:[^"\\]|\\.)*)"/);
            if (quotedMatch) {
                evolvedName = quotedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
            }
        } else {
            const unquotedMatch = targetPart.match(/^([^\s\d]+(?:\s+[^\s\d]+)*)/);
            if (unquotedMatch) {
                evolvedName = unquotedMatch[1].trim();
            }
        }
        
        if (evolvedName) {
            return {
                evolvedName,
                sourceName,
                found: true,
            };
        }
    }
    
    return { evolvedName: '', sourceName: '', found: false };
}