define('ace/mode/owm', function(require, exports) {
	var oop = require('ace/lib/oop');
	var TextMode = require('ace/mode/text').Mode;
	var OwmHighlightRules = require('ace/mode/owm_highlight_rules')
		.OwmHighlightRules;


	var Mode = function() {
		this.HighlightRules = OwmHighlightRules;
	};
	oop.inherits(Mode, TextMode);

	(function() {
		this.lineCommentStart = "//";
    	this.blockComment = {start: "/*", end: "*/"};
	}.call(Mode.prototype));

	exports.Mode = Mode;
});

define('ace/mode/owm_highlight_rules', function(require, exports) {
	var oop = require('ace/lib/oop');
	var TextHighlightRules = require('ace/mode/text_highlight_rules')
		.TextHighlightRules;

	var DocCommentHighlightRules = function() {
		this.$rules = {
			"start" : [ {
				token : "comment.doc.tag",
				regex : "@[\\w\\d_]+" // TODO: fix email addresses
			}, 
			DocCommentHighlightRules.getTagRule(),
			{
				defaultToken : "comment.doc",
				caseInsensitive: true
			}]
		};
	};

	oop.inherits(DocCommentHighlightRules, TextHighlightRules);
	
	DocCommentHighlightRules.getTagRule = function(start) {
		return {
			token : "comment.doc.tag.storage.type",
			regex : "\\b(?:TODO|FIXME|XXX|HACK)\\b"
		};
	};
	
	DocCommentHighlightRules.getStartRule = function(start) {
		return {
			token : "comment.doc", // doc comment
			regex : "\\/\\*(?=\\*)",
			next  : start
		};
	};
	
	DocCommentHighlightRules.getEndRule = function (start) {
		return {
			token : "comment.doc", // closing comment
			regex : "\\*\\/",
			next  : start
		};
	};

	var OwmHighlightRules = function() {
		this.$rules = {
			"start" : [
				{
					"token" : "punctuation.definition.comment.asp",
					"regex" : "(\\/\\/.*$)"
				},
				 DocCommentHighlightRules.getStartRule("doc-start"),
				{
					token : "comment", // multi line comment
					regex : "\\/\\*",
					next : "comment"
				},
				 {
					"token" : ["keyword", "variable.parameter.function.asp"],
					"regex" : "(evolution|annotations|annotation|component|title|style|outsource|build|product|buy)(\\s*[a-zA-Z0-9\\s*]+)"
				 },
				 {
					"token" : "keyword",
					"regex" : "(inertia)"
				 },
				 {
					"token" : ["punctuation", "punctuation", "constant.numeric", "punctuation", "constant.numeric", "punctuation", "punctuation"],
					"regex" : "(\\[*)(\\[)(\\d+(?:\\.\\d{1,})*)(\\,\\s*)(\\d+(?:\\.\\d{1,}))(\\])(\\]*)"
				 },
				 {
					"token" : ["keyword", "constant.numeric"],
					"regex" : "(evolve)(\\s*\\d+(?:\\.\\d{1,})*)"
				 },
				 {
					"token" : ["keyword", "constant.numeric"],
					"regex" : "(evolve)(\\s*(?:\\.\\d{1,})*)"
				 },
				 {
					"token" : ["variable.parameter.function.asp", "punctuation", "variable.parameter.function.asp"],
					"regex" : "(\\s*[a-zA-Z0-9\\s*]+)(\\-\\>)(\\s*[a-zA-Z0-9\\s*]+)"
				 },
				 {
					"token" : ["variable.parameter.function.asp", "punctuation", "variable.parameter.function.asp"],
					"regex" : "(\\s*[a-zA-Z0-9\\s*]+)(\\+(?:\\<\\>|\\<|\\>))(\\s*[a-zA-Z0-9\\s*]+)"
				 },
				 {
					"token" : ["variable.parameter.function.asp", "punctuation", "punctuation.definition.string.begin.asp", "punctuation", "variable.parameter.function.asp"],
					"regex" : "(\\s*[a-zA-Z0-9\\s*]+)(\\+(?:\\'))([^']+)(\\'(?:\\<\\>|\\<|\\>))(\\s*[a-zA-Z0-9\\s*]+)"
				 },
				 {
					defaultToken : "text",
				 }
			 ],
			 "comment" : [
				{
					token : "comment", // closing comment
					regex : "\\*\\/",
					next : "start"
				}, {
					defaultToken : "comment"
				}
			]
		};
	};

	
	oop.inherits(OwmHighlightRules, TextHighlightRules);
	exports.OwmHighlightRules = OwmHighlightRules;
});
