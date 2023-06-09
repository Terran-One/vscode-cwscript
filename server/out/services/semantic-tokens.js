"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const cwsc_1 = require("@terran-one/cwsc");
const position_1 = require("@terran-one/cwsc/dist/util/position");
const language_service_1 = require("../language-service");
// include all token types and modifiers
const tokenTypesList = [
    "namespace",
    "type",
    "class",
    "enum",
    "interface",
    "struct",
    "typeParameter",
    "parameter",
    "variable",
    "property",
    "enumMember",
    "event",
    "function",
    "method",
    "macro",
    "keyword",
    "modifier",
    "comment",
    "string",
    "number",
    "regexp",
    "operator",
    "decorator",
];
const tokTypeToNum = new Map();
tokenTypesList.forEach((type, i) => tokTypeToNum.set(type, i));
const tokNumToType = new Map();
tokenTypesList.forEach((type, i) => tokNumToType.set(i, type));
const tokenModifiersList = [
    "declaration",
    "definition",
    "readonly",
    "static",
    "deprecated",
    "abstract",
    "async",
    "modification",
    "documentation",
    "defaultLibrary",
];
const tokModToNum = new Map();
tokenModifiersList.forEach((mod, i) => tokModToNum.set(mod, i));
const tokNumToMod = new Map();
tokenModifiersList.forEach((mod, i) => tokNumToMod.set(i, mod));
const LEGEND = {
    tokenTypes: tokenTypesList,
    tokenModifiers: tokenModifiersList,
};
function provideDocumentSemanticTokens(document) {
    // TODO: implement the real semantic tokens
    let text = document.getText();
    let textView = new position_1.TextView(text);
    let parser = new cwsc_1.CWSParser(text);
    let tb = new node_1.SemanticTokensBuilder();
    try {
        let ast = parser.parse();
        ast.descendantsOfType(cwsc_1.AST.Param).forEach((param) => {
            if (param.name) {
                // get the range
                let { start, end } = textView.rangeOfNode(param.name.$ctx);
                tb.push(start.line, start.character, end.character - start.character, tokTypeToNum.get("parameter"), 0);
            }
        });
        return tb.build();
    }
    catch (e) {
        console.log(e);
        console.log(parser.errors);
        return tb.build();
    }
}
exports.default = (0, language_service_1.defineLanguageService)(function (result) {
    result.capabilities.semanticTokensProvider = {
        range: false,
        legend: LEGEND,
        full: {
            delta: false,
        },
    };
    this.connection.onRequest("textDocument/semanticTokens/full", (params) => {
        let doc = this.documents.get(params.textDocument.uri);
        return provideDocumentSemanticTokens(doc);
    });
    return result;
});
//# sourceMappingURL=semantic-tokens.js.map