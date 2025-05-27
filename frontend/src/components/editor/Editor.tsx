import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import ReactAce from 'react-ace/lib/ace';
import { MapDimensions } from '../../constants/defaults';
import { EditorPrefixes } from '../../constants/editorPrefixes';
import {
    MapAnchors,
    MapComponents,
    MapMarkets,
    MapSubmaps,
} from '../../types/base';
import { WrappedEditorProps } from './WrappedEditor';

const TextEditor = dynamic(() => import('./WrappedEditor'), {
    ssr: false,
});

const ForwardedRefComponent = React.forwardRef<ReactAce, WrappedEditorProps>(
    (props, ref) => {
        return <TextEditor {...props} editorRef={ref} />;
    },
);

ForwardedRefComponent.displayName = 'ForwardedRefComponent';

export interface EditorProps {
    hideNav: any;
    highlightLine: any;
    errorLine: number[];
    mapComponents: MapComponents[];
    mapAnchors: MapAnchors[];
    mapSubMaps: MapSubmaps[];
    mapMarkets: MapMarkets[];
    isLightTheme: boolean;
    invalid: boolean;
    mutateMapText: any;
    mapText: string;
    showLineNumbers: boolean;
    mapDimensions: MapDimensions;
}

export const Editor: React.FunctionComponent<EditorProps> = ({
    hideNav,
    highlightLine,
    errorLine,
    mapComponents,
    mapAnchors,
    mapSubMaps,
    mapMarkets,
    isLightTheme,
    invalid,
    mutateMapText,
    mapText,
    showLineNumbers,
}) => {
    const [height, setHeight] = useState(10);
    const [editorCompletions, setEditorCompletions] = useState({
        prefix: EditorPrefixes,
        elements: [] as string[],
    });
    const aceEditor = React.createRef<ReactAce>();

    const customAceEditorCompleter = (ed: { prefix: any; elements: any }) => {
        return {
            getCompletions: function (
                _editor: any,
                _session: any,
                _pos: any,
                _prefix: any,
                callback: (arg0: null, arg1: any) => void,
            ) {
                const components = ed.elements.map((item: any) => {
                    return {
                        name: item,
                        value: item,
                        score: 1,
                        meta: 'Element',
                    };
                });
                const prefixes = ed.prefix.map((item: any) => {
                    return {
                        name: item,
                        value: item,
                        score: 1,
                        meta: 'Syntax',
                    };
                });

                callback(null, prefixes.concat(components));
            },
        };
    };

    const getHeight = () => {
        const winHeight = window.innerHeight;
        const topNavHeight =
            document.getElementById('top-nav-wrapper')?.clientHeight;
        const titleHeight = document.getElementById('title')?.clientHeight;
        return winHeight - (topNavHeight ?? 0) - (titleHeight ?? 0) + 35;
    };

    useEffect(() => {
        const handleResize = () => {
            setHeight(getHeight());
        };

        window.addEventListener('load', handleResize);
        window.addEventListener('resize', handleResize);

        handleResize();

        return function cleanup() {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('load', handleResize);
        };
    }, []);

    useEffect(() => {
        setHeight(getHeight());
    }, [hideNav]);

    useEffect(() => {
        const gotoLine = (line: number) => {
            const reactAceComponent = aceEditor.current;
            if (reactAceComponent !== null) {
                const editor = reactAceComponent.editor;
                editor.gotoLine(line, 0, true);
            }
        };
        gotoLine(highlightLine);
    }, [highlightLine]);

    useEffect(() => {
        const reactAceComponent = aceEditor.current;
        if (reactAceComponent !== null) {
            const editor = reactAceComponent.editor;
            for (let x = 0; x < editor.session.getLength(); x++) {
                editor.session.removeGutterDecoration(x, 'ace_error');
            }
            if (errorLine.length > 0) {
                errorLine.forEach((e: number) =>
                    editor.session.addGutterDecoration(e, 'ace_error'),
                );
            }
        }
    }, [errorLine]);

    useEffect(() => {
        const concatenatedUserComponents = mapComponents
            .map((c) => {
                return c.name;
            })
            .concat(
                mapAnchors.map((_) => {
                    return _.name;
                }),
            )
            .concat(
                mapSubMaps.map((_) => {
                    return _.name;
                }),
            )
            .concat(
                mapMarkets.map((_) => {
                    return _.name;
                }),
            );
        setEditorCompletions(
            createExpressionSuggester(concatenatedUserComponents),
        );
    }, [mapComponents, mapAnchors, mapSubMaps, mapMarkets]);

    useEffect(() => {
        const reactAceComponent = aceEditor.current;
        if (reactAceComponent !== null) {
            const editor = reactAceComponent.editor;
            editor.setTheme(
                'ace/theme/' + (isLightTheme ? 'eclipse' : 'dracula'),
            );
        }
    }, [isLightTheme, aceEditor]);

    useEffect(() => {
        const reactAceComponent = aceEditor.current;
        if (reactAceComponent !== null) {
            const editor = reactAceComponent.editor;
            editor.completers = [customAceEditorCompleter(editorCompletions)];
        }
    }, [editorCompletions, aceEditor]);

    const createExpressionSuggester = (userSpecifiedComponents: string[]) => {
        // const c = userSpecifiedComponents.map(_ => {
        //     return _.name;
        // });
        return {
            elements: userSpecifiedComponents,
            prefix: EditorPrefixes,
        };
    };

    return (
        <div id="htmPane" className={invalid ? ' invalid' : ''}>
            <ForwardedRefComponent
                ref={aceEditor}
                mode="owm"
                keyboardHandler="vscode"
                theme={isLightTheme ? 'eclipse' : 'dracula'}
                onChange={mutateMapText}
                name="htmEditor"
                value={mapText}
                showGutter={showLineNumbers || errorLine.length > 0}
                width={''}
                height={height + 'px'}
                showPrintMargin={false}
                debounceChangePeriod={500}
                editorProps={{
                    $blockScrolling: true,
                    getCompletions: customAceEditorCompleter(editorCompletions),
                }}
                setOptions={{
                    showLineNumbers: showLineNumbers,
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                }}
            />
        </div>
    );
};

export default Editor;
