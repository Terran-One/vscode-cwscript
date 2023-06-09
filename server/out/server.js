"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CWScriptLanguageServer = void 0;
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const node_1 = require("vscode-languageserver/node");
const language_server_1 = require("./language-server");
const semantic_tokens_1 = require("./services/semantic-tokens");
const signature_help_1 = require("./services/signature-help");
const diagnostics_1 = require("./services/diagnostics");
const document_symbol_1 = require("./services/document-symbol");
const cwsc_1 = require("@terran-one/cwsc");
const position_1 = require("@terran-one/cwsc/dist/util/position");
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
class CWScriptLanguageServer extends language_server_1.LanguageServer {
    constructor() {
        super(...arguments);
        this.SERVER_INFO = {
            name: "cwsls",
            version: "0.0.1",
        };
        this.SERVICES = [
            diagnostics_1.default,
            document_symbol_1.default,
            semantic_tokens_1.default,
            signature_help_1.default,
        ];
        this.parseCache = new Map();
        this.parserListeners = [];
    }
    setup() {
        // initialize a parser cache
        this.documents.onDidChangeContent((change) => {
            const { uri } = change.document;
            const source = this.documents.get(uri)?.getText();
            if (source)
                this.parseFile(uri, source);
        });
    }
    getCachedOrParse(uri) {
        if (this.parseCache.has(uri))
            return this.parseCache.get(uri);
        const source = this.documents.get(uri)?.getText();
        if (source)
            return this.parseFile(uri, source);
    }
    parseFile(uri, source) {
        try {
            const textView = new position_1.TextView(source);
            const parser = new cwsc_1.CWSParser(source);
            const ast = parser.parse();
            const entry = { status: 'success', uri, textView, ast, parser };
            this.parseCache.set(uri, entry);
            this.parserListeners.forEach((listener) => {
                if (typeof listener === "function") {
                    listener(entry);
                }
                else {
                    listener.onParse(entry);
                }
            });
            return entry;
        }
        catch (e) {
            return {
                status: 'error',
                uri,
                previous: this.parseCache.get(uri),
                error: e,
            };
        }
    }
}
exports.CWScriptLanguageServer = CWScriptLanguageServer;
const cwsls = new CWScriptLanguageServer();
cwsls.listen(connection);
connection.listen();
//# sourceMappingURL=server.js.map