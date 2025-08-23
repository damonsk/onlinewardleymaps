export interface LinkDeletionInfo {
    start: string;
    end: string;
    flow?: boolean;
    flowValue?: string;
    line: number;
}

export class LinkDeleter {
    public deleteLink(mapText: string, linkInfo: LinkDeletionInfo): string {
        const lines = mapText.split('\n');

        console.log('LinkDeleter: deleteLink called', {
            linkInfo,
            totalLines: lines.length,
            targetLineIndex: linkInfo.line,
            targetLineContent: lines[linkInfo.line] || 'LINE_NOT_FOUND',
            allLines: lines,
            mapTextFull: mapText,
        });

        // Find the actual link line instead of relying on the provided line index
        const expectedLinkPattern = linkInfo.flow
            ? `${linkInfo.start}\s*->${linkInfo.flowValue}\s*${linkInfo.end}`
            : `${linkInfo.start}\s*->\s*${linkInfo.end}`;

        let actualLinkLineIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (this.isMatchingLinkLine(line, linkInfo)) {
                actualLinkLineIndex = i;
                break;
            }
        }

        console.log('LinkDeleter: link line search result', {
            expectedPattern: expectedLinkPattern,
            providedLineIndex: linkInfo.line,
            actualLinkLineIndex,
            actualLinkLineContent: actualLinkLineIndex >= 0 ? lines[actualLinkLineIndex] : 'NOT_FOUND',
        });

        // Remove the specific link line using the actual found index
        const filteredLines = lines.filter((line, index) => {
            // If we found the actual link line, remove it
            if (actualLinkLineIndex >= 0 && index === actualLinkLineIndex) {
                console.log('LinkDeleter: removing line at index', index, {
                    lineContent: line,
                    trimmedLine: line.trim(),
                });
                return false;
            }

            // Otherwise, keep the line
            return true;
        });

        const result = filteredLines.join('\n');
        console.log('LinkDeleter: deletion result', {
            originalLength: mapText.length,
            resultLength: result.length,
            originalLinesCount: lines.length,
            resultLinesCount: filteredLines.length,
            linesRemoved: lines.length - filteredLines.length,
            textChanged: result !== mapText,
            linkFound: actualLinkLineIndex >= 0,
            linkLineRemoved: actualLinkLineIndex >= 0,
        });

        return result;
    }

    private isMatchingLinkLine(line: string, linkInfo: LinkDeletionInfo): boolean {
        const {start, end, flow, flowValue} = linkInfo;

        console.log('LinkDeleter: isMatchingLinkLine called', {
            line,
            linkInfo,
            start,
            end,
            flow,
            flowValue,
            lineCharCodes: Array.from(line).map(char => ({char, code: char.charCodeAt(0)})),
            endCharCodes: Array.from(end).map(char => ({char, code: char.charCodeAt(0)})),
        });

        // Handle different link syntaxes:
        // A->B
        // A<->B
        // A->>B (flow)
        // A->>B:value (flow with value)

        if (flow && flowValue) {
            // Flow with value: "A->>B:value"
            const startPattern = this.createComponentPattern(start);
            const endPattern = this.createComponentPattern(end);
            const flowValuePattern = `${startPattern}\\s*->\\s*>\\s*${endPattern}\\s*:\\s*${this.escapeRegExp(flowValue)}`;
            const regex = new RegExp(flowValuePattern);
            const matches = regex.test(line);
            console.log('LinkDeleter: testing flow with value pattern', {flowValuePattern, matches});
            return matches;
        } else if (flow) {
            // Flow without value: "A->>B"
            const startPattern = this.createComponentPattern(start);
            const endPattern = this.createComponentPattern(end);
            const flowPattern = `${startPattern}\\s*->\\s*>\\s*${endPattern}`;
            const regex = new RegExp(flowPattern);
            const matches = regex.test(line);
            console.log('LinkDeleter: testing flow pattern', {flowPattern, matches});
            return matches;
        } else {
            // Regular links: "A->B" or "A<->B"
            const startPattern = this.createComponentPattern(start);
            const endPattern = this.createComponentPattern(end);
            const bidirectionalPattern = `${startPattern}\\s*<->\\s*${endPattern}`;
            const unidirectionalPattern1 = `${startPattern}\\s*->\\s*${endPattern}`;
            const unidirectionalPattern2 = `${endPattern}\\s*->\\s*${startPattern}`;

            const bidirectionalRegex = new RegExp(bidirectionalPattern);
            const unidirectional1Regex = new RegExp(unidirectionalPattern1);
            const unidirectional2Regex = new RegExp(unidirectionalPattern2);

            const bidirectionalMatch = bidirectionalRegex.test(line);
            const unidirectional1Match = unidirectional1Regex.test(line);
            const unidirectional2Match = unidirectional2Regex.test(line);

            console.log('LinkDeleter: testing regular link patterns', {
                startPattern,
                endPattern,
                bidirectionalPattern,
                unidirectionalPattern1,
                unidirectionalPattern2,
                bidirectionalMatch,
                unidirectional1Match,
                unidirectional2Match,
                // Test the actual regex matching with detailed info
                regexTest: {
                    pattern1: unidirectionalPattern1,
                    testLine: line,
                    match1: unidirectional1Regex.exec(line),
                    directTest: /New Component 2\s*->\s*"New Component 1\\ndsds"/.test(line),
                    directTest2: /New Component 2\s*->\s*"New Component 1\ndsds"/.test(line),
                },
            });

            return bidirectionalMatch || unidirectional1Match || unidirectional2Match;
        }
    }

    private createComponentPattern(componentName: string): string {
        // Handle quoted multi-line component names
        if (componentName.includes('\n')) {
            // Direct approach: map text shows 'New Component 2->"New Component 1\\ndsds"'
            // So we need to match \\n literally in the regex

            // Replace \n with \\n to match the map text format
            const mapTextVersion = componentName.replace(/\n/g, '\\\\n');

            // Create patterns without over-escaping
            // For the version with \\n as it appears in map text
            const mapPattern = `"${mapTextVersion}"`;

            // For the original version (fallback)
            const originalPattern = `"${componentName}"`;

            // Simple alternation - match either format
            return `(?:${mapPattern}|${originalPattern}|${mapTextVersion}|${componentName})`;
        } else {
            // For single-line names, escape special regex characters
            return this.escapeRegExp(componentName);
        }
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
