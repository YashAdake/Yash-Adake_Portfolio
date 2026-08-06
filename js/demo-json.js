/* ============================================================
   MyJSON case study: "try a slice of it" widget.
   A deliberately tiny, standalone demo of the product's rule:
   everything happens in this tab. This file makes no network
   requests and shares no code with the product; it exists so a
   visitor can verify the principle in ten seconds.
   ============================================================ */
(function () {
    'use strict';

    var input = document.getElementById('demoInput');
    var output = document.getElementById('demoOutput');
    var status = document.getElementById('demoStatus');
    var pathEl = document.getElementById('demoPath');
    if (!input || !output) return;

    var SAMPLE = {
        product: 'MyJSON',
        privacy: { network_requests: 0, telemetry: null },
        tools: ['format', 'query', 'diff', 'codegen', 'convert'],
        jq: { real: true, version: '1.8', runtime: 'WebAssembly' },
        themes: 14
    };
    input.value = JSON.stringify(SAMPLE, null, 2);

    function say(msg, isError) {
        status.textContent = msg;
        status.classList.toggle('demo-status-err', !!isError);
    }

    function parse() {
        try {
            return { ok: true, value: JSON.parse(input.value) };
        } catch (e) {
            // Surface the position if the engine gives one.
            var m = /position (\d+)/.exec(e.message);
            var where = '';
            if (m) {
                var upto = input.value.slice(0, +m[1]);
                var line = upto.split('\n').length;
                var col = upto.length - upto.lastIndexOf('\n');
                where = ' (line ' + line + ', col ' + col + ')';
            }
            say('Parse error' + where + ': ' + e.message, true);
            return { ok: false };
        }
    }

    function show(value) {
        output.textContent = typeof value === 'string'
            ? value
            : JSON.stringify(value, null, 2);
    }

    // A small dotted-path evaluator: $.a.b[0].c, nothing more.
    // The real product ships JSONPath, jq 1.8 (WASM) and JSON Pointer.
    function queryPath(doc, path) {
        var p = path.trim();
        if (!p || p === '$') return { ok: true, value: doc };
        if (p[0] === '$') p = p.slice(1);
        var tokens = p.match(/\.[A-Za-z_][\w-]*|\[\d+\]/g);
        var consumed = tokens ? tokens.join('') : '';
        if (consumed !== p) return { ok: false, err: 'Unsupported path. This mini-demo only does $.key.key[0] chains.' };
        var cur = doc;
        for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            var key = t[0] === '.' ? t.slice(1) : +t.slice(1, -1);
            if (cur === null || typeof cur !== 'object' || !(key in cur)) {
                return { ok: false, err: 'No value at ' + path + ' (stopped at "' + t + '")' };
            }
            cur = cur[key];
        }
        return { ok: true, value: cur };
    }

    document.getElementById('demoFormat').addEventListener('click', function () {
        var r = parse();
        if (!r.ok) return;
        input.value = JSON.stringify(r.value, null, 2);
        show(r.value);
        say('Formatted. Check the Network tab: still silent.');
    });

    document.getElementById('demoMinify').addEventListener('click', function () {
        var r = parse();
        if (!r.ok) return;
        var min = JSON.stringify(r.value);
        show(min);
        say('Minified: ' + min.length + ' characters. No request was made.');
    });

    document.getElementById('demoQuery').addEventListener('click', function () {
        var r = parse();
        if (!r.ok) return;
        var q = queryPath(r.value, pathEl.value || '$');
        if (!q.ok) { say(q.err, true); return; }
        show(q.value);
        say('Queried ' + (pathEl.value || '$') + ' locally, like everything else here.');
    });

    input.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('demoFormat').click();
        }
    });
})();
