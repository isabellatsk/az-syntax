(function () {
  "use strict";

  var DEBUG = true;

  var EXT_TO_LANG = {
    ".vue": "html"
  };

  function log() {
    if (!DEBUG) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift("[az-vue-syntax]");
    console.log.apply(console, args);
  }

  function getExtension(path) {
    if (!path) return "";
    var clean = path.split("?")[0].split("#")[0];
    var match = /(\.[A-Za-z0-9]+)$/.exec(clean);
    return match ? match[1].toLowerCase() : "";
  }

  function getModelPath(model) {
    try {
      if (model && model.uri) {
        return model.uri.path || model.uri.fsPath || String(model.uri);
      }
    } catch (e) {}
    return "";
  }

  function getModelLanguage(model) {
    if (!model) return "";
    if (typeof model.getLanguageId === "function") return model.getLanguageId();
    if (typeof model.getModeId === "function") return model.getModeId();
    return "";
  }

  function applyToModel(monaco, model) {
    var path = getModelPath(model);
    var ext = getExtension(path);
    var target = EXT_TO_LANG[ext];
    var current = getModelLanguage(model);

    log("model", { path: path, ext: ext, language: current });

    if (!target) return;
    if (current === target) return;

    try {
      monaco.editor.setModelLanguage(model, target);
      log("applied", target, "to", path);
    } catch (e) {
      log("failed to set language", e);
    }
  }

  function start(monaco) {
    log("monaco detected");

    try {
      monaco.editor.getModels().forEach(function (model) {
        applyToModel(monaco, model);
      });
    } catch (e) {
      log("getModels failed", e);
    }

    try {
      monaco.editor.onDidCreateModel(function (model) {
        applyToModel(monaco, model);
      });
    } catch (e) {
      log("onDidCreateModel failed", e);
    }
  }

  function waitForMonaco() {
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      if (window.monaco && window.monaco.editor) {
        clearInterval(timer);
        start(window.monaco);
      } else if (attempts > 200) {
        clearInterval(timer);
        log("monaco not found after waiting");
      }
    }, 300);
  }

  waitForMonaco();
})();
