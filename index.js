import CodeMirror from "codemirror";

CodeMirror.defineMode("luau", function () {
    function longComment(stream, state) {
        while (!stream.eol()) {
            if (stream.match(/\]\]/)) {
                state.tokenize = null;
                break;
            }
            stream.next();
        }
        return "comment";
    }

    return {
        startState: function () {
            return { tokenize: null };
        },
        token: function (stream, state) {
            if (state.tokenize) {
                return state.tokenize(stream, state);
            }

            if (stream.match(/--\[\[/)) {
                state.tokenize = longComment;
                return state.tokenize(stream, state);
            }
            if (stream.match(/--/)) {
                stream.skipToEnd();
                return "comment";
            }
            if (stream.match(/"([^"\\]|\\.)*"?/)) {
                return "string";
            }
            if (stream.match(/'([^'\\]|\\.)*'?/)) {
                return "string";
            }
            if (stream.match(/\b\d+(\.\d+)?\b/)) {
                return "number";
            }
            if (
                stream.match(
                    /\b(function|end|if|then|else|elseif|while|do|for|in|repeat|until|return|local|not|and|or)\b/
                )
            ) {
                return "keyword";
            }
            if (stream.match(/[a-zA-Z_]\w*/)) {
                return "variable";
            }
            stream.next();
            return null;
        },
    };
});

CodeMirror.defineMIME("text/x-lua", "luau");
CodeMirror.defineMIME("text/x-luau", "luau");
