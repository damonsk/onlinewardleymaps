/* eslint-disable */
import type { Ace } from 'ace-builds';
// @ts-ignore - ace-builds has incorrect type definitions
import ace from 'ace-builds';

interface Mode {
    HighlightRules: any;
    lineCommentStart?: string;
    blockComment?: { start: string; end: string };
}

interface RequireFunction {
    (path: string): any;
}

interface ModuleExports {
    Mode: any;
    OwmHighlightRules: any;
}

interface Module {
    exports: ModuleExports;
}

interface TextMode {
    Mode: Mode;
}

interface HighlightRule {
    token: string | string[];
    regex: string;
    next?: string;
    caseInsensitive?: boolean;
    defaultToken?: string;
}

interface TextHighlightRules {
    $rules: {
        [key: string]: HighlightRule[];
    };
}

interface DocCommentHighlightRules extends TextHighlightRules {
    getTagRule(): { token: string; regex: string };
    getStartRule(start: string): { token: string; regex: string; next: string };
    getEndRule(start: string): { token: string; regex: string; next: string };
}

(ace as any).define(
    'ace/mode/owm',
    [
        'require',
        'exports',
        'module',
        'ace/lib/oop',
        'ace/mode/text',
        'ace/mode/owm_highlight_rules',
    ],
    function (require: RequireFunction, exports: ModuleExports, _module: Module) {
        const oop = require('../lib/oop');
        const TextMode = require('./text').Mode;
        const OwmHighlightRules =
            require('./owm_highlight_rules').OwmHighlightRules;

        const Mode = function (this: Mode) {
            this.HighlightRules = OwmHighlightRules;
        };
        oop.inherits(Mode, TextMode);

        (function (this: Mode) {
            this.lineCommentStart = '//';
            this.blockComment = { start: '/*', end: '*/' };
        }).call(Mode.prototype);

        exports.Mode = Mode;
    },
);

(ace as any).define(
    'ace/mode/owm_highlight_rules',
    [
        'require',
        'exports',
        'module',
        'ace/lib/oop',
        'ace/mode/text_highlight_rules',
    ],
    function (require: RequireFunction, exports: ModuleExports, _module: Module) {
        const oop = require('../lib/oop');
        const TextHighlightRules =
            require('./text_highlight_rules').TextHighlightRules;

        const DocCommentHighlightRules = function (
            this: DocCommentHighlightRules,
        ) {
            this.$rules = {
                start: [
                    {
                        token: 'comment.doc.tag',
                        regex: '@[\\w\\d_]+', // TODO: fix email addresses
                    },
                    DocCommentHighlightRules.getTagRule(),
                    {
                        token: 'comment.doc',
                        regex: '.*?',
                        defaultToken: 'comment.doc',
                        caseInsensitive: true
                    },
                ],
            };
        };

        oop.inherits(DocCommentHighlightRules, TextHighlightRules);

        DocCommentHighlightRules.getTagRule = function () {
            return {
                token: 'comment.doc.tag.storage.type',
                regex: '\\b(?:TODO|FIXME|XXX|HACK)\\b',
            };
        };

        DocCommentHighlightRules.getStartRule = function (start: string) {
            return {
                token: 'comment.doc', // doc comment
                regex: '\\/\\*(?=\\*)',
                next: start,
            };
        };

        DocCommentHighlightRules.getEndRule = function (start: string) {
            return {
                token: 'comment.doc', // closing comment
                regex: '\\*\\/',
                next: start,
            };
        };

        const OwmHighlightRules = function (this: TextHighlightRules) {
            this.$rules = {
                start: [
                    {
                        token: [
                            'keyword',
                            'punctuation',
                            'constant.numeric',
                            'punctuation',
                            'constant.numeric',
                            'punctuation',
                            'constant.numeric',
                            'punctuation',
                            'constant.numeric',
                            'punctuation',
                        ],
                        regex: '(pioneers|settlers|townplanners)(\\s*\\[)(\\d+(?:\\.\\d{1,})*)(\\,\\s*)(\\d+(?:\\.\\d{1,})*)(\\,\\s*)(\\d+(?:\\.\\d{1,})*)(\\,\\s*)(\\d+(?:\\.\\d{1,}))(\\])',
                    },
                    {
                        token: [
                            'keyword',
                            'variable.parameter.function.asp',
                            'punctuation',
                            'comment',
                            'punctuation',
                        ],
                        regex: '(url)(\\s*[a-zA-Z0-9\\s*]+)(\\s*\\[)(\\s*[-+\'"/;:.#a-zA-Z0-9\\s*]+)(\\])',
                    },
                    {
                        token: [
                            'keyword',
                            'punctuation',
                            'variable.parameter.function.asp',
                            'punctuation',
                        ],
                        regex: '(url)(\\s*\\()(\\s*[-+\'"/;:a-zA-Z0-9\\s*]+)(\\))',
                    },
                    {
                        token: ['punctuation', 'keyword', 'punctuation'],
                        regex: '(\\s*\\()([-+(build|buy|outsource|ecosystem|market)\\s*]+)(\\))',
                    },
                    {
                        token: 'punctuation.definition.comment.asp',
                        regex: '(\\/\\/.*$)',
                    },
                    DocCommentHighlightRules.getStartRule('doc-start'),
                    {
                        token: 'comment', // multi line comment
                        regex: '\\/\\*',
                        next: 'comment',
                    },
                    {
                        token: ['keyword', 'variable.parameter.function.asp'],
                        regex: '(deaccelerator|accelerator|evolution|note|anchor|annotations|annotation|component|ecosystem|market|submap|title|style|outsource|build|product|buy|pipeline)(\\s*[-+\'"#;&$£%^*()-+,./a-zA-Z0-9\\s*]+)',
                    },
                    {
                        token: [
                            'keyword',
                            'variable.parameter.function.asp',
                            'constant.numeric',
                        ],
                        regex: '(evolve)(\\s*[a-zA-Z0-9\\s*]+)(\\d+(?:\\.\\d{1,})*)',
                    },
                    {
                        token: [
                            'punctuation',
                            'constant.numeric',
                            'punctuation',
                        ],
                        regex: '(\\[)(\\d+(?:\\.\\d{1,})*)(\\])',
                    },
                    {
                        token: [
                            'keyword',
                            'punctuation',
                            'constant.numeric',
                            'punctuation',
                            'constant.numeric',
                            'punctuation',
                        ],
                        regex: '(label)(\\s*\\[)(-*\\d+)(\\,\\s*)(-*\\d+)(\\])',
                    },
                    {
                        token: [
                            'keyword',
                            'punctuation',
                            'constant.numeric',
                            'punctuation',
                            'constant.numeric',
                            'punctuation',
                        ],
                        regex: '(size)(\\s*\\[)(-*\\d+)(\\,\\s*)(-*\\d+)(\\])',
                    },
                    {
                        token: 'keyword',
                        regex: '(inertia)',
                    },
                    {
                        token: [
                            'punctuation',
                            'punctuation',
                            'constant.numeric',
                            'punctuation',
                            'constant.numeric',
                            'punctuation',
                            'punctuation',
                        ],
                        regex: '(\\[*)(\\[)(\\d+(?:\\.\\d{1,})*)(\\,\\s*)(\\d+(?:\\.\\d{1,}))(\\])(\\]*)',
                    },
                    {
                        token: [
                            'variable.parameter.function.asp',
                            'punctuation',
                            'variable.parameter.function.asp',
                        ],
                        regex: '(\\s*[#;&$£%^*()-+,.a-zA-Z0-9\\s*]+)(\\-\\>)(\\s*[#;&$£%^*()-+,.a-zA-Z0-9\\s*]+)',
                    },
                    {
                        token: [
                            'variable.parameter.function.asp',
                            'punctuation',
                            'variable.parameter.function.asp',
                        ],
                        regex: '(\\s*[a-zA-Z0-9\\s*]+)(\\+(?:\\<\\>|\\<|\\>))(\\s*[a-zA-Z0-9\\s*]+)',
                    },
                    {
                        token: [
                            'variable.parameter.function.asp',
                            'punctuation',
                            'punctuation.definition.string.begin.asp',
                            'punctuation',
                            'variable.parameter.function.asp',
                        ],
                        regex: "(\\s*[a-zA-Z0-9\\s*]+)(\\+(?:\\'))([^']+)(\\'(?:\\<\\>|\\<|\\>))(\\s*[a-zA-Z0-9\\s*]+)",
                    },
                    {
                        token: 'text',
                        regex: '.',
                        defaultToken: 'text'
                    },
                ],
                comment: [
                    {
                        token: 'comment', // closing comment
                        regex: '\\*\\/',
                        next: 'start',
                    },
                    {
                        token: 'comment',
                        regex: '.',
                        defaultToken: 'comment'
                    },
                ],
            };
        };

        oop.inherits(OwmHighlightRules, TextHighlightRules);
        exports.OwmHighlightRules = OwmHighlightRules;
    },
);
