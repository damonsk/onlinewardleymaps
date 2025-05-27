type MatcherFunction = (
    line: string,
    identifier: string,
    type: string,
) => boolean;
type ActionFunction = (line: string, moved: any) => string;

interface Replacer {
    matcher: MatcherFunction;
    action: ActionFunction;
}

export interface PositionUpdater {
    setSuccessor(positionUpdater: PositionUpdater): unknown;
    update(moved: any, identifier: string): void;
}

export default class DefaultPositionUpdater implements PositionUpdater {
    type: string;
    mapText: string;
    mutator: (updatedText: string) => void;
    replacers: Replacer[];

    constructor(
        type: string,
        mapText: string,
        mutator: (updatedText: string) => void,
        replacers: Replacer[],
    ) {
        this.type = type;
        this.mapText = mapText;
        this.mutator = mutator;
        this.replacers = replacers;
    }

    //eslint-disable-next-line
    setSuccessor(_positionUpdater: PositionUpdater) {
        throw new Error('Method not implemented.');
    }

    update(moved: any, identifier: string): void {
        const updatedText = this.mapText
            .split('\n')
            .map((line) => {
                for (let i = 0; i < this.replacers.length; i++) {
                    const r = this.replacers[i];
                    if (r.matcher(line, identifier, this.type)) {
                        return r.action(line, moved);
                    }
                }
                return line;
            })
            .join('\n');

        this.mutator(updatedText);
    }
}
