(function () {
  var form = document.getElementById("ai-lab-form");
  if (!form) return;

  var modeSelect = document.getElementById("ai-lab-mode");
  var modelSelect = document.getElementById("ai-lab-model");
  var modelNote = document.getElementById("ai-lab-model-note");
  var promptInput = document.getElementById("ai-lab-prompt");
  var submitButton = document.getElementById("ai-lab-submit");
  var status = document.getElementById("ai-lab-status");
  var output = document.getElementById("ai-lab-output");
  var consolePanel = form.parentNode.querySelector(".ai-lab__console");
  var modelBadge = document.getElementById("ai-lab-model-badge");
  var presetButtons = form.querySelectorAll("[data-ai-prompt]");

  var API_BASE_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8787/v1"
      : "https://api.zachdavis.org/v1";

  var setStatus = function (message) {
    status.textContent = message;
  };

  var setOutput = function (message) {
    output.textContent = message;
  };

  var setRunningState = function (isRunning) {
    submitButton.disabled = isRunning;
    submitButton.textContent = isRunning ? "Running..." : "Run AI Demo";
    consolePanel.classList.toggle("is-running", isRunning);
    consolePanel.setAttribute("aria-busy", isRunning ? "true" : "false");
  };

  var setBadge = function (value) {
    modelBadge.textContent = value || "openrouter/free";
  };

  var normalizeContent = function (content) {
    if (typeof content === "string") return content.trim();

    if (Array.isArray(content)) {
      return content
        .map(function (part) {
          if (typeof part === "string") return part;
          if (part && typeof part.text === "string") return part.text;
          return "";
        })
        .join("\n")
        .trim();
    }

    return "";
  };

  var extractError = function (payload) {
    if (!payload) return "The request failed before a usable response was returned.";
    if (payload.error && payload.error.message) return payload.error.message;
    if (payload.message) return payload.message;
    return "The request failed before a usable response was returned.";
  };

  var makeOption = function (value, label) {
    var option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  };

  var populateModels = function (models) {
    var fragment = document.createDocumentFragment();
    fragment.appendChild(makeOption("openrouter/free", "openrouter/free (worker-selected free model)"));

    models.forEach(function (model) {
      fragment.appendChild(makeOption(model.id, model.name + " [" + model.id + "]"));
    });

    modelSelect.innerHTML = "";
    modelSelect.appendChild(fragment);
  };

  var loadFreeModels = function () {
    fetch(API_BASE_URL + "/models")
      .then(function (response) {
        return response.json().then(function (payload) {
          if (!response.ok) throw new Error(extractError(payload));
          return payload;
        });
      })
      .then(function (payload) {
        var models = payload.data || [];
        populateModels(models);
        modelSelect.value = "openrouter/free";
        modelNote.textContent = models.length
          ? "Loaded " + models.length + " free text-capable models from the Cloudflare proxy."
          : "The proxy did not return explicit free models, so the router alias remains selected.";
      })
      .catch(function (error) {
        modelNote.textContent = error.message || "Could not refresh the free-model list from the proxy.";
      });
  };

  modelSelect.addEventListener("change", function () {
    setBadge(modelSelect.value || "openrouter/free");
  });

  Array.prototype.forEach.call(presetButtons, function (button) {
    button.addEventListener("click", function () {
      var prompt = button.getAttribute("data-ai-prompt");
      var mode = button.getAttribute("data-ai-mode");
      if (mode) modeSelect.value = mode;
      promptInput.value = prompt || "";
      promptInput.focus();
      setStatus("Preset loaded. Run the demo to get a live response.");
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var prompt = promptInput.value.trim();
    var mode = modeSelect.value;
    var selectedModel = modelSelect.value || "openrouter/free";

    if (!prompt) {
      setStatus("Add a prompt or load one of the suggested examples.");
      promptInput.focus();
      return;
    }

    setRunningState(true);
    setBadge(selectedModel);
    setStatus("Calling the Cloudflare Worker proxy...");
    setOutput("Running live inference through api.zachdavis.org.");

    fetch(API_BASE_URL + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: mode,
        model: selectedModel,
        prompt: prompt,
      }),
    })
      .then(function (response) {
        return response.json().then(function (payload) {
          if (!response.ok) {
            throw new Error(extractError(payload));
          }

          return payload;
        });
      })
      .then(function (payload) {
        var choice = payload.choices && payload.choices[0];
        var content = choice && choice.message ? normalizeContent(choice.message.content) : "";
        var responseModel = payload.model || selectedModel;

        if (!content) {
          throw new Error("The model returned an empty response.");
        }

        setBadge(responseModel);
        setStatus("Live response received.");
        setOutput(content);
      })
      .catch(function (error) {
        setStatus("Request failed.");
        setOutput(error.message || "The request did not complete successfully.");
      })
      .finally(function () {
        setRunningState(false);
      });
  });

  loadFreeModels();
})();
