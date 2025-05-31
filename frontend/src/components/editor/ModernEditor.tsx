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

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            const container = document.getElementById('editor-container');
            if (container) {
                setEditorHeight(container.offsetHeight - 140);
            }
        });

        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            resizeObserver.observe(editorContainer);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

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
                height: hideNav
                    ? window.innerHeight - 200
                    : window.innerHeight - 250,
                paddingBottom: '10px',
            }}
        >
            <ForwardedRefComponent
                ref={aceEditorRef}
                mode="owm"
                theme={isLightTheme ? 'github' : 'monokai'}
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
                    wrap: true,
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
                markers={
                    highlightLine
                        ? [
                              {
                                  startRow: highlightLine - 1,
                                  startCol: 0,
                                  endRow: highlightLine - 1,
                                  endCol: 1000,
                                  className: 'ace_active-line',
                                  type: 'fullLine',
                              },
                          ]
                        : []
                }
            />
        </div>
    );
};

export default ModernEditor;
