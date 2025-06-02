import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import ReactAce from 'react-ace/lib/ace';
import { EditorPrefixes } from '../../constants/editorPrefixes';
import { UnifiedWardleyMap } from '../../types/unified/map';
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

export interface ModernEditorProps {
    // Core unified data
    wardleyMap: UnifiedWardleyMap; // UnifiedWardleyMap;

    // UI state and configuration
    hideNav: any;
    highlightLine: any;
    errorLine: number[];
    isLightTheme: boolean;
    invalid: boolean;
    showLineNumbers: boolean;
    mapDimensions: any;

    // Text and mutations
    mapText: string;
    mutateMapText: any;
}

export const ModernEditor: React.FunctionComponent<ModernEditorProps> = ({
    wardleyMap,
    hideNav,
    highlightLine,
    errorLine,
    isLightTheme,
    invalid,
    mutateMapText,
    mapText,
    showLineNumbers,
    mapDimensions, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
    const [editorHeight, setEditorHeight] = useState(500);
    const aceEditorRef = useRef<ReactAce>(null);

    // Use the same height calculation logic as the original Editor
    const getHeight = () => {
        const winHeight = window.innerHeight;
        const topNavHeight =
            document.getElementById('top-nav-wrapper')?.clientHeight;
        const titleHeight = document.getElementById('title')?.clientHeight;
        return winHeight - (topNavHeight ?? 0) - (titleHeight ?? 0) + 35;
    };

    useEffect(() => {
        const handleResize = () => {
            setEditorHeight(getHeight());
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
        setEditorHeight(getHeight());
    }, [hideNav]);

    // Highlight the selected line by moving the cursor to it
    useEffect(() => {
        const gotoLine = (line: number) => {
            const reactAceComponent = aceEditorRef.current;
            if (reactAceComponent !== null && line > 0) {
                const editor = reactAceComponent.editor;
                editor.gotoLine(line, 0, true);
            }
        };
        gotoLine(highlightLine);
    }, [highlightLine]);

    // Add error indicators to the gutter for error lines
    useEffect(() => {
        const reactAceComponent = aceEditorRef.current;
        if (reactAceComponent !== null) {
            const editor = reactAceComponent.editor;
            // Clear all previous error decorations
            for (let x = 0; x < editor.session.getLength(); x++) {
                editor.session.removeGutterDecoration(x, 'ace_error');
            }
            // Add error decorations to the specified error lines
            if (errorLine.length > 0) {
                errorLine.forEach((e: number) =>
                    editor.session.addGutterDecoration(e, 'ace_error'),
                );
            }
        }
    }, [errorLine]);

    const completions = [
        ...wardleyMap.components.map((c: any) => ({
            caption: c.name,
            value: c.name,
            meta: 'component',
        })),
        ...wardleyMap.anchors.map((a: any) => ({
            caption: a.name,
            value: a.name,
            meta: 'anchor',
        })),
        ...wardleyMap.markets.map((m: any) => ({
            caption: m.name,
            value: m.name,
            meta: 'market',
        })),
        ...wardleyMap.ecosystems.map((e: any) => ({
            caption: e.name,
            value: e.name,
            meta: 'ecosystem',
        })),
        ...wardleyMap.submaps.map((s: any) => ({
            caption: s.name,
            value: s.name,
            meta: 'submap',
        })),
        ...EditorPrefixes.map((prefix: string) => ({
            caption: prefix,
            value: prefix,
            meta: 'syntax',
        })),
    ];

    useEffect(() => {
        const reactAceComponent = aceEditorRef.current;
        if (reactAceComponent !== null) {
            const editor = reactAceComponent.editor;
            editor.completers = [
                {
                    getCompletions: function (
                        _editor: any,
                        _session: any,
                        _pos: any,
                        _prefix: any,
                        callback: (arg0: null, arg1: any) => void,
                    ) {
                        const suggestions = completions.map((item) => ({
                            name: item.caption,
                            value: item.value,
                            score: 1,
                            meta: item.meta,
                        }));
                        callback(null, suggestions);
                    },
                },
            ];
        }
    }, [completions]);

    return (
        <div
            id="editor-container"
            style={{
                width: '100%',
                height: editorHeight,
                paddingBottom: '10px',
            }}
        >
            <ForwardedRefComponent
                ref={aceEditorRef}
                mode="owm"
                theme={isLightTheme ? 'eclipse' : 'dracula'}
                name="map_editor"
                onChange={mutateMapText}
                fontSize={13}
                showPrintMargin={false}
                showGutter={showLineNumbers}
                highlightActiveLine={false}
                value={mapText}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: false,
                    showLineNumbers: showLineNumbers,
                    tabSize: 2,
                }}
                style={{
                    height: editorHeight,
                    width: '100%',
                    border: invalid ? '2px solid red' : '0px',
                }}
                annotations={errorLine.map((line) => ({
                    row: line,
                    column: 0,
                    type: 'error',
                    text: 'Map element not found or invalid syntax',
                }))}
            />
        </div>
    );
};

export default ModernEditor;
