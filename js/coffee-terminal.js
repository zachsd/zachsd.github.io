(function () {
  var screen = document.getElementById('coffee-code-screen');
  if (!screen) return;

  var snippets = [
    {
      lang: 'python',
      lines: [
        'def brew_more_code(caffeine_reserve: int, quality_score: float, eyelids: str) -> str:',
        '    if caffeine_reserve < 2 or quality_score < 0.8 or eyelids == "closing":',
        '        caffeine_reserve += 3  # ☕ refill',
        '        return f"☕➡️💻 Refilled to {caffeine_reserve}. more coffee equals more code"',
        '    return "✅ Ship it. Brain is compiling cleanly."',
        'print(brew_more_code(1, 0.61, "closing"))'
      ],
      output: '☕➡️💻 Refilled to 4. more coffee equals more code'
    },
    {
      lang: 'pwsh',
      lines: [
        'function Get-MoreCode([int]$CaffeineReserve, [double]$QualityScore, [string]$Eyelids) {',
        '  if ($CaffeineReserve -lt 2 -or $QualityScore -lt 0.8 -or $Eyelids -eq "closing") {',
        '    $CaffeineReserve += 3  # ☕ refill',
        '    return "☕➡️💻 Refilled to $CaffeineReserve. more coffee equals more code"',
        '  } else { return "✅ Build passed. Keep shipping." }',
        '}',
        'Get-MoreCode -CaffeineReserve 1 -QualityScore 0.61 -Eyelids "closing"'
      ],
      output: '☕➡️💻 Refilled to 4. more coffee equals more code'
    },
    {
      lang: 'javascript',
      lines: [
        'const brewMoreCode = ({ caffeineReserve, qualityScore, eyelids }) => {',
        '  if (caffeineReserve < 2 || qualityScore < 0.8 || eyelids === "closing") {',
        '    caffeineReserve += 3; // ☕ refill',
        '    return `☕➡️💻 Refilled to ${caffeineReserve}. more coffee equals more code`;',
        '  }',
        '  return "✅ Linter happy. Vibes immaculate.";',
        '};',
        'console.log(brewMoreCode({ caffeineReserve: 1, qualityScore: 0.61, eyelids: "closing" }));'
      ],
      output: '☕➡️💻 Refilled to 4. more coffee equals more code'
    },
    {
      lang: 'bash',
      lines: [
        'brew_more_code() {',
        '  local caffeine_reserve="$1" quality_score="$2" eyelids="$3"',
        '  if (( caffeine_reserve < 2 )) || awk "BEGIN {exit !($quality_score < 0.8)}" || [[ "$eyelids" == "closing" ]]; then',
        '    caffeine_reserve=$((caffeine_reserve + 3))  # ☕ refill',
        '    echo "☕➡️💻 Refilled to ${caffeine_reserve}. more coffee equals more code"',
        '  else',
        '    echo "✅ Tests green. Keyboard still clacking."',
        '  fi',
        '}',
        'brew_more_code 1 0.61 closing'
      ],
      output: '☕➡️💻 Refilled to 4. more coffee equals more code'
    }
  ];

  var wait = function (ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  };

  var escapeHtml = function (value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  var highlightLine = function (lang, rawLine) {
    var html = escapeHtml(rawLine);

    if (lang === 'python') {
      html = html.replace(/\b(def|if|or|return|print)\b/g, '<span class="token-keyword">$1</span>');
      html = html.replace(/\b(int|float|str)\b/g, '<span class="token-type">$1</span>');
    } else if (lang === 'pwsh') {
      html = html.replace(/\b(function|if|or|else|return)\b/gi, '<span class="token-keyword">$1</span>');
      html = html.replace(/\$[A-Za-z][A-Za-z0-9]*/g, '<span class="token-variable">$&</span>');
      html = html.replace(/\[(int|double|string)\]/gi, '[<span class="token-type">$1</span>]');
    } else if (lang === 'javascript') {
      html = html.replace(/\b(const|if|return)\b/g, '<span class="token-keyword">$1</span>');
    } else if (lang === 'bash') {
      html = html.replace(/\b(if|then|else|fi|local|echo)\b/g, '<span class="token-keyword">$1</span>');
    }

    html = html.replace(/("[^"\\]*(?:\\.[^"\\]*)*")/g, '<span class="token-string">$1</span>');
    html = html.replace(/(\#.*$)/g, '<span class="token-comment">$1</span>');
    html = html.replace(/\b(0\.61|0\.8|1|2|3|4)\b/g, '<span class="token-number">$1</span>');

    return html;
  };

  var typeLine = function (lang, text, className) {
    return new Promise(function (resolve) {
      var line = document.createElement('div');
      line.className = 'code-terminal__line' + (className ? ' ' + className : '');
      screen.appendChild(line);

      var i = 0;
      var interval = setInterval(function () {
        line.textContent = text.slice(0, i);
        i += 1;

        if (i > text.length) {
          clearInterval(interval);
          if (!className) {
            line.innerHTML = highlightLine(lang, text);
          }
          resolve();
        }
      }, 16);
    });
  };

  var runCycle = async function () {
    while (true) {
      for (var s = 0; s < snippets.length; s += 1) {
        screen.innerHTML = '';
        var snippet = snippets[s];
        await typeLine(snippet.lang, '❯ ' + snippet.lang, 'code-terminal__line--prompt');
        await wait(180);

        for (var l = 0; l < snippet.lines.length; l += 1) {
          await typeLine(snippet.lang, snippet.lines[l]);
          await wait(90);
        }

        await wait(350);
        await typeLine(snippet.lang, snippet.output, 'code-terminal__line--output');
        await wait(7000);
      }
    }
  };

  runCycle();
})();
