/**
 * Strategy for deleting links from map text
 * Single Responsibility: Only handles link text deletion
 * Open/Closed: Part of a strategy pattern for different deletion types
 */
export class LinkDeletionStrategy {
    public deleteLink(mapText: string, linkInfo: {
        start: string;
        end: string;
        flow?: boolean;
        flowValue?: string;
        line: number;
    }): string {
        const lines = mapText.split('\n');
        
        // Find the actual link line using pattern matching
        const actualLinkLineIndex = this.findLinkLine(lines, linkInfo);
        
        if (actualLinkLineIndex === -1) {
            // Link not found, return original text
            return mapText;
        }

        // Remove the link line
        const filteredLines = lines.filter((_, index) => index !== actualLinkLineIndex);
        return filteredLines.join('\n');
    }

    private findLinkLine(lines: string[], linkInfo: {
        start: string;
        end: string;
        flow?: boolean;
        flowValue?: string;
        line: number;
    }): number {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (this.isMatchingLinkLine(line, linkInfo)) {
                return i;
            }
        }
        return -1;
    }

    private isMatchingLinkLine(line: string, linkInfo: {
        start: string;
        end: string;
        flow?: boolean;
        flowValue?: string;
    }): boolean {
        const {start, end, flow, flowValue} = linkInfo;

        if (flow && flowValue) {
            return this.matchesFlowWithValue(line, start, end, flowValue);
        } else if (flow) {
            return this.matchesFlow(line, start, end);
        } else {
            return this.matchesRegularLink(line, start, end);
        }
    }

    private matchesFlowWithValue(line: string, start: string, end: string, flowValue: string): boolean {
        const startPattern = this.createComponentPattern(start);
        const endPattern = this.createComponentPattern(end);
        const flowValuePattern = `${startPattern}\\s*->\\s*>\\s*${endPattern}\\s*:\\s*${this.escapeRegExp(flowValue)}`;
        const regex = new RegExp(flowValuePattern);
        return regex.test(line);
    }

    private matchesFlow(line: string, start: string, end: string): boolean {
        const startPattern = this.createComponentPattern(start);
        const endPattern = this.createComponentPattern(end);
        const flowPattern = `${startPattern}\\s*->\\s*>\\s*${endPattern}`;
        const regex = new RegExp(flowPattern);
        return regex.test(line);
    }

    private matchesRegularLink(line: string, start: string, end: string): boolean {
        const startPattern = this.createComponentPattern(start);
        const endPattern = this.createComponentPattern(end);
        
        const patterns = [
            `${startPattern}\\s*<->\\s*${endPattern}`, // Bidirectional
            `${startPattern}\\s*->\\s*${endPattern}`,  // Forward
            `${endPattern}\\s*->\\s*${startPattern}`,  // Reverse
        ];

        return patterns.some(pattern => new RegExp(pattern).test(line));
    }

    private createComponentPattern(componentName: string): string {
        if (componentName.includes('\n')) {
            // Handle multi-line component names
            const mapTextVersion = componentName.replace(/\n/g, '\\\\n');
            const mapPattern = `"${mapTextVersion}"`;
            const originalPattern = `"${componentName}"`;
            return `(?:${mapPattern}|${originalPattern}|${mapTextVersion}|${componentName})`;
        } else {
            return this.escapeRegExp(componentName);
        }
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}