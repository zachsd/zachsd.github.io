(function () {
  var screen = document.getElementById('coffee-code-screen');
  if (!screen) return;

  var snippets = [
    {
      lang: 'python',
      lines: [
        'def more_code(coffee_cups: int) -> str:',
        '    return "more coffee equals more code" if coffee_cups > 0 else "need coffee"',
        '',
        'print(more_code(2))'
      ],
      output: 'more coffee equals more code'
    },
    {
      lang: 'pwsh',
      lines: [
        'function Get-MoreCode([int]$CoffeeCups) {',
        '  if ($CoffeeCups -gt 0) { "more coffee equals more code" } else { "need coffee" }',
        '}',
        'Get-MoreCode -CoffeeCups 2'
      ],
      output: 'more coffee equals more code'
    },
    {
      lang: 'javascript',
      lines: [
        'const moreCode = (coffeeCups) =>',
        '  coffeeCups > 0 ? "more coffee equals more code" : "need coffee";',
        'console.log(moreCode(2));'
      ],
      output: 'more coffee equals more code'
    },
    {
      lang: 'bash',
      lines: [
        'more_code() {',
        '  local coffee_cups="$1"',
        '  [[ "$coffee_cups" -gt 0 ]] && echo "more coffee equals more code" || echo "need coffee"',
        '}',
        'more_code 2'
      ],
      output: 'more coffee equals more code'
    }
  ];

  var wait = function (ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  };

  var typeLine = function (text, className) {
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
          resolve();
        }
      }, 24);
    });
  };

  var runCycle = async function () {
    while (true) {
      for (var s = 0; s < snippets.length; s += 1) {
        screen.innerHTML = '';
        var snippet = snippets[s];
        await typeLine('❯ ' + snippet.lang, 'code-terminal__line--prompt');
        await wait(180);

        for (var l = 0; l < snippet.lines.length; l += 1) {
          await typeLine(snippet.lines[l]);
          await wait(120);
        }

        await wait(350);
        await typeLine(snippet.output, 'code-terminal__line--output');
        await wait(7000);
      }
    }
  };

  runCycle();
})();
