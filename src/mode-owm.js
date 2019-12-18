define('ace/mode/owm', function (require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var OwmHighlightRules = require("ace/mode/owm_highlight_rules").OwmHighlightRules;

    var Mode = function () {
        this.HighlightRules = OwmHighlightRules;
    };
    oop.inherits(Mode, TextMode);

    (function () {
        // Extra logic goes here. (see below)
    }).call(Mode.prototype);

    exports.Mode = Mode;
});

define('ace/mode/owm_highlight_rules', function (require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var OwmHighlightRules = function () {

        this.$rules = {
            "start": [
                {
                    "token": ["keyword", "variable.parameter.function.asp"],
                    "regex": "(component|title|style|outsource|build|buy)(\\s*[a-zA-Z0-9\\s*]+)"
                },
                {
                    "token": "keyword",
                    "regex": "(inertia)"
                },
                {
                    "token": ["punctuation", "constant.numeric", "punctuation", "constant.numeric", "punctuation"],
                    "regex": "(\\[)(\\d+(?:\\.\\d{1,})*)(\\,\\s*)(\\d+(?:\\.\\d{1,}))(\\])"
                },
                {
                    "token": ["keyword", "constant.numeric"],
                    "regex": "(evolve)(\\s*\\d+(?:\\.\\d{1,})*)"
                },
                {
                    "token": ["keyword", "constant.numeric"],
                    "regex": "(evolve)(\\s*(?:\\.\\d{1,})*)"
                },
                {
                    "token": ["variable.parameter.function.asp", "punctuation", "variable.parameter.function.asp"],
                    "regex": "(\\s*[a-zA-Z0-9\\s*]+)(\\-\\>)(\\s*[a-zA-Z0-9\\s*]+)"
                },
                {
                    "token": ["variable.parameter.function.asp", "punctuation", "variable.parameter.function.asp"],
                    "regex": "(\\s*[a-zA-Z0-9\\s*]+)(\\+(?:\\<\\>|\\<|\\>))(\\s*[a-zA-Z0-9\\s*]+)"
                },
                {
                    "token": ["variable.parameter.function.asp", "punctuation", "punctuation.definition.string.begin.asp", "punctuation", "variable.parameter.function.asp"],
                    "regex": "(\\s*[a-zA-Z0-9\\s*]+)(\\+(?:\\'))([^']+)(\\'(?:\\<\\>|\\<|\\>))(\\s*[a-zA-Z0-9\\s*]+)"
                },
                {
                    defaultToken: "text",
                }
            ]
        };

    }

    oop.inherits(OwmHighlightRules, TextHighlightRules);

    exports.OwmHighlightRules = OwmHighlightRules;
});