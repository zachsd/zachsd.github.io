(function () {
  var screen = document.getElementById("coffee-code-screen");
  var branchAnomaly = document.getElementById("coffee-branch-anomaly");
  var branchRuntime = document.getElementById("coffee-branch-runtime");
  var branchDelta = document.getElementById("coffee-branch-delta");
  if (!screen) return;

  var FRAME_WIDTH = 68;
  var LOG_LIMIT = 4;
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var tickDelay = prefersReducedMotion ? 1800 : 950;

  var state = {
    tick: 0,
    isRefilling: false,
    caffeine_reserves: 74,
    coffee_in_cup: 86,
    eyelid_openness: 92,
    code_quality_score: 89,
    bugs_fixed: 14,
    documentation_created: 8,
    total_lines_of_code: 22,
  };

  var log = [];
  var timerId;
  var branchStatus = {
    anomaly: 24,
    runtime: 37,
    delta: -3,
  };

  var clamp = function (value) {
    return Math.max(0, Math.min(100, value));
  };

  var randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  var clampRange = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  };

  var escapeHtml = function (value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  var repeat = function (char, count) {
    return new Array(count + 1).join(char);
  };

  var padRight = function (value, width) {
    var text = String(value);
    if (text.length >= width) return text.slice(0, width);
    return text + repeat(" ", width - text.length);
  };

  var padLeft = function (value, width) {
    var text = String(value);
    if (text.length >= width) return text.slice(0, width);
    return repeat(" ", width - text.length) + text;
  };

  var bar = function (value) {
    var width = 14;
    var filled = Math.round((clamp(value) / 100) * width);
    return "[" + repeat("#", filled) + repeat(".", width - filled) + "]";
  };

  var addLog = function (message) {
    log.unshift(message);
    if (log.length > LOG_LIMIT) {
      log.length = LOG_LIMIT;
    }
  };

  var updateBranchStatus = function () {
    branchStatus.anomaly = clampRange(
      branchStatus.anomaly + randomInt(-4, 5),
      7,
      99,
    );
    branchStatus.runtime = clampRange(
      branchStatus.runtime + randomInt(-5, 6),
      10,
      99,
    );
    branchStatus.delta = clampRange(
      branchStatus.delta + randomInt(-2, 2),
      -9,
      9,
    );

    if (branchAnomaly) {
      branchAnomaly.textContent = "?" + branchStatus.anomaly;
    }

    if (branchRuntime) {
      branchRuntime.textContent = "~" + branchStatus.runtime;
    }

    if (branchDelta) {
      branchDelta.textContent =
        (branchStatus.delta > 0 ? "+" : "") + branchStatus.delta;
    }
  };

  var noteForMetric = function (key, value) {
    if (key === "caffeine_reserves") {
      if (value < 25) return "espresso emergency";
      if (value < 55) return "dangerously normal";
      return "compiler adequately brewed";
    }

    if (key === "coffee_in_cup") {
      if (value < 15) return "mug running on fumes";
      if (value < 45) return "sip inventory thinning";
      return "bean reserves online";
    }

    if (key === "eyelid_openness") {
      if (value < 25) return "gravity winning";
      if (value < 55) return "blinks getting bold";
      return "eyes mostly negotiating";
    }

    if (key === "code_quality_score") {
      if (value < 25) return "merge-conflict poetry";
      if (value < 55) return "tests feel nervous";
      return "clean enough for daylight";
    }

    if (key === "bugs_fixed") {
      if (value < 25) return "bug backlog heckling";
      if (value < 55) return "cemetery filling nicely";
      return "swatter staying busy";
    }

    if (key === "documentation_created") {
      if (value < 25) return "future-you still guessing";
      if (value < 55) return "wiki receiving crumbs";
      return "docs finally telling the truth";
    }

    if (value < 25) return "one more helper function";
    if (value < 55) return "scope still containable";
    return "the repo is becoming sentient";
  };

  var valueClass = function (value) {
    if (value >= 70) return "terminal-status--good";
    if (value >= 40) return "terminal-status--warn";
    return "terminal-status--bad";
  };

  var pushProgress = function () {
    var bugGain = state.code_quality_score > 45 ? randomInt(1, 4) : randomInt(0, 2);
    var docGain = state.eyelid_openness > 45 ? randomInt(1, 3) : randomInt(0, 1);
    var locGain = state.caffeine_reserves > 35 ? randomInt(2, 6) : randomInt(0, 3);

    state.bugs_fixed = clamp(state.bugs_fixed + bugGain);
    state.documentation_created = clamp(state.documentation_created + docGain);
    state.total_lines_of_code = clamp(state.total_lines_of_code + locGain);

    var drain =
      2 +
      bugGain * 3 +
      docGain * 2 +
      Math.ceil(locGain / 2) +
      (state.eyelid_openness < 45 ? 2 : 0);

    state.caffeine_reserves = clamp(state.caffeine_reserves - drain);
    state.eyelid_openness = clamp(
      state.eyelid_openness - randomInt(2, 5) - (state.caffeine_reserves < 35 ? 2 : 0),
    );

    addLog(
      "Sprint tick: bugs +" +
        bugGain +
        "%, docs +" +
        docGain +
        "%, LOC +" +
        locGain +
        "%, caffeine -" +
        drain +
        "%.",
    );
  };

  var sipCoffee = function () {
    if (state.coffee_in_cup <= 0) return;

    var needsCoffee =
      state.caffeine_reserves < 48 || state.eyelid_openness < 58 || state.code_quality_score < 52;

    if (!needsCoffee) return;

    var sip = Math.min(state.coffee_in_cup, randomInt(10, 18));
    state.coffee_in_cup = clamp(state.coffee_in_cup - sip);
    state.caffeine_reserves = clamp(state.caffeine_reserves + Math.round(sip * 0.85));
    state.eyelid_openness = clamp(state.eyelid_openness + Math.round(sip * 0.4));

    addLog(
      "Emergency sip ☕ transferred " +
        sip +
        "% from coffee_in_cup to caffeine_reserves.",
    );

    if (state.coffee_in_cup <= 12) {
      state.isRefilling = true;
      addLog("coffee_in_cup depleted. Refill run started; output counters paused.");
    }
  };

  var refillCoffee = function () {
    state.coffee_in_cup = clamp(state.coffee_in_cup + randomInt(18, 28));
    state.caffeine_reserves = clamp(state.caffeine_reserves - randomInt(1, 3));
    state.eyelid_openness = clamp(state.eyelid_openness - randomInt(1, 2));

    addLog("Refilling mug... bugs_fixed, documentation_created, and LOC are paused.");

    if (state.coffee_in_cup >= 100) {
      state.isRefilling = false;
      addLog("Mug topped off. Productivity unlocked again.");
    }
  };

  var rebalanceQuality = function () {
    var quality =
      state.eyelid_openness * 0.64 +
      state.caffeine_reserves * 0.22 +
      state.documentation_created * 0.1 -
      Math.max(0, state.total_lines_of_code - state.documentation_created) * 0.12;

    state.code_quality_score = clamp(Math.round(quality));

    if (state.eyelid_openness < 35) {
      addLog("Eyelid_openness dropped hard. code_quality_score took collateral damage.");
    }
  };

  var maybeResetSprint = function () {
    if (
      state.bugs_fixed < 100 ||
      state.documentation_created < 100 ||
      state.total_lines_of_code < 100
    ) {
      return;
    }

    state.bugs_fixed = randomInt(8, 18);
    state.documentation_created = randomInt(4, 12);
    state.total_lines_of_code = randomInt(10, 20);
    addLog("Release shipped. New sprint spawned with fresh chaos and fewer clean counters.");
  };

  var updateState = function () {
    state.tick += 1;
    updateBranchStatus();

    if (state.isRefilling) {
      refillCoffee();
    } else {
      pushProgress();
      sipCoffee();
      if (state.coffee_in_cup <= 12) {
        state.isRefilling = true;
        addLog("Cup entered low-power mode. Heading for the coffee machine.");
      }
    }

    rebalanceQuality();
    maybeResetSprint();
  };

  var metricLine = function (label, key) {
    var value = state[key];
    var labelCell = padRight(label, 22);
    var barCell = bar(value);
    var valueCell = padLeft(value + "%", 4);
    var note = noteForMetric(key, value);

    return (
      '<span class="terminal-label">' +
      escapeHtml(labelCell) +
      "</span> " +
      '<span class="terminal-bar">' +
      escapeHtml(barCell) +
      "</span> " +
      '<span class="terminal-status ' +
      valueClass(value) +
      '">' +
      escapeHtml(valueCell) +
      "</span> " +
      escapeHtml(note)
    );
  };

  var render = function () {
    var separator = repeat("-", FRAME_WIDTH);
    var modeText = state.isRefilling ? "REFILLING" : "CODING";
    var modeClass = state.isRefilling
      ? "terminal-status--paused"
      : "terminal-status--good";

    var lines = [
      {
        className: "code-terminal__line--title",
        html: escapeHtml("dev_shift.exe :: ascii coffee survival simulator"),
      },
      {
        className: "code-terminal__line--muted",
        html:
          escapeHtml("mode: ") +
          '<span class="terminal-status ' +
          modeClass +
          '">' +
          escapeHtml(modeText) +
          "</span>" +
          escapeHtml(
            " | tick: " +
              state.tick +
              " | objective: keep shipping before nap.exe starts",
          ),
      },
      { className: "code-terminal__line--muted", html: escapeHtml(separator) },
      { html: metricLine("caffeine_reserves", "caffeine_reserves") },
      { html: metricLine("coffee_in_cup", "coffee_in_cup") },
      { html: metricLine("eyelid_openness", "eyelid_openness") },
      { html: metricLine("code_quality_score", "code_quality_score") },
      { html: metricLine("bugs_fixed", "bugs_fixed") },
      { html: metricLine("documentation_created", "documentation_created") },
      { html: metricLine("total_lines_of_code", "total_lines_of_code") },
      { className: "code-terminal__line--muted", html: escapeHtml(separator) },
      {
        className: "code-terminal__line--muted",
        html: escapeHtml(
          "rule: refilling coffee_in_cup pauses bugs_fixed, documentation_created, and LOC.",
        ),
      },
      {
        className: "code-terminal__line--muted",
        html: escapeHtml("recent events:"),
      },
    ];

    while (log.length < LOG_LIMIT) {
      log.push("Boot sequence stable. Awaiting the next regrettable TODO.");
    }

    for (var i = 0; i < LOG_LIMIT; i += 1) {
      lines.push({
        className: i === 0 ? "code-terminal__line--output" : "",
        html: escapeHtml("> " + log[i]),
      });
    }

    screen.innerHTML = lines
      .map(function (line) {
        var className = "code-terminal__line";
        if (line.className) {
          className += " " + line.className;
        }

        return '<div class="' + className + '">' + line.html + "</div>";
      })
      .join("");
  };

  addLog("Boot complete. Terminal morale holding at suspiciously acceptable levels.");
  updateBranchStatus();
  render();

  timerId = window.setInterval(function () {
    updateState();
    render();
  }, tickDelay);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && timerId) {
      window.clearInterval(timerId);
      timerId = null;
      return;
    }

    if (!document.hidden && !timerId) {
      render();
      timerId = window.setInterval(function () {
        updateState();
        render();
      }, tickDelay);
    }
  });
})();
