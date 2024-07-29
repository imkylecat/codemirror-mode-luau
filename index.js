//import CodeMirror from "codemirror";

CodeMirror.defineMode("luau", function () {
    const keywords =
        /\b(function|export|type|self|end|if|then|else|elseif|while|do|for|in|repeat|until|return|local|not|and|or)\b/;
    const globals =
        /\b(print|math|table|string|coroutine|Vector2|Vector3|UDim|UDim2|os|io|debug|package|require|_G|shared|game|pairs|ipairs)\b/;

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

    function backtickString(stream, state) {
        while (!stream.eol()) {
            if (stream.match(/`/)) {
                state.tokenize = null;
                break;
            }
            stream.next();
        }
        return "string";
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
            if (stream.match(/`/)) {
                state.tokenize = backtickString;
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
            if (stream.match(keywords)) {
                return "keyword";
            }
            if (state.afterColon && stream.match(/[^=|,]+(?==|,|\bin\b)/)) {
                state.afterColon = false;
                return "type";
            }
            if (stream.match(globals)) {
                return "builtin";
            }
            if (stream.match(/\btrue\b/)) {
                return "positive";
            }
            if (stream.match(/\bfalse\b/)) {
                return "negative";
            }
            /*
            if (stream.match(/\b(true|false)\b/)) {
                return "atom";
            }
            */
            if (stream.match(/[a-zA-Z_]\w*/)) {
                return "variable";
            }
            if (stream.match(/:/)) {
                state.afterColon = true;
                return "operator";
            }
            if (stream.match(/==|~=|>=|<=|[=+\-*/|()?\[\]&]/)) {
                state.afterColon = false;
                return "operator";
            }
            if (stream.match(/[{}]/)) {
                return "bracket";
            }
            stream.next();
            return null;
        },
    };
});

CodeMirror.defineMIME("text/x-lua", "luau");
CodeMirror.defineMIME("text/x-luau", "luau");
