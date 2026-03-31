(function() {
  "use strict";

  var STORAGE_KEY = "duftaAdminOverrides";
  var PROJECT_OVERRIDES_URL = "./files/admin-overrides.json";

  function emptyState() {
    return { version: 1, globalCss: "", elements: {}, translations: {} };
  }

  function normalizeState(state) {
    var n = emptyState();
    if (!state || typeof state !== "object") return n;
    if (typeof state.globalCss === "string") n.globalCss = state.globalCss;

    if (
      state.elements &&
      typeof state.elements === "object" &&
      !Array.isArray(state.elements)
    ) {
      Object.keys(state.elements).forEach(function(selector) {
        if (!selector || typeof selector !== "string") return;
        var ov = state.elements[selector];
        if (!ov || typeof ov !== "object") return;
        var out = {};
        if (ov.contentMode === "text" || ov.contentMode === "html") {
          out.contentMode = ov.contentMode;
          out.content = typeof ov.content === "string" ? ov.content : "";
        }
        if (
          ov.attributes &&
          typeof ov.attributes === "object" &&
          !Array.isArray(ov.attributes)
        ) {
          var attrs = {};
          Object.keys(ov.attributes).forEach(function(attr) {
            if (typeof ov.attributes[attr] === "string")
              attrs[attr] = ov.attributes[attr];
          });
          if (Object.keys(attrs).length) out.attributes = attrs;
        }
        if (Object.keys(out).length) n.elements[selector] = out;
      });
    }

    if (
      state.translations &&
      typeof state.translations === "object" &&
      !Array.isArray(state.translations)
    ) {
      Object.keys(state.translations).forEach(function(key) {
        var langs = state.translations[key];
        if (!langs || typeof langs !== "object") return;
        var outLangs = {};
        ["ru", "en", "lv", "lt", "ee"].forEach(function(lang) {
          if (typeof langs[lang] === "string") outLangs[lang] = langs[lang];
        });
        if (Object.keys(outLangs).length) n.translations[key] = outLangs;
      });
    }

    return n;
  }

  function loadLocalState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeState(JSON.parse(raw)) : emptyState();
    } catch (e) {
      return emptyState();
    }
  }

  function mergeStates(baseState, topState) {
    var base = normalizeState(baseState);
    var top = normalizeState(topState);
    return {
      version: 1,
      globalCss: top.globalCss || base.globalCss || "",
      elements: Object.assign({}, base.elements, top.elements),
      translations: Object.assign({}, base.translations, top.translations),
    };
  }

  function ensureStyleTag() {
    var id = "dufta-admin-overrides-style";
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement("style");
      st.id = id;
      document.head.appendChild(st);
    }
    return st;
  }

  function parseImgSrcSelector(selector) {
    var m = selector.match(/^img\[src="(.*)"\]$/);
    return m ? m[1] : null;
  }

  function applyAttributes(el, attrs, originalImgSrc) {
    if (!attrs) return;
    Object.keys(attrs).forEach(function(attr) {
      var value = attrs[attr];
      if (value === "") el.removeAttribute(attr);
      else el.setAttribute(attr, value);

      if (attr === "src" && el.tagName && el.tagName.toLowerCase() === "img") {
        if (originalImgSrc && !el.getAttribute("data-admin-orig-src")) {
          el.setAttribute("data-admin-orig-src", originalImgSrc);
        }
        var parent = el.parentElement;
        if (
          parent &&
          parent.tagName &&
          parent.tagName.toLowerCase() === "picture"
        ) {
          Array.from(parent.querySelectorAll("source")).forEach(function(
            sourceEl,
          ) {
            if (value === "") sourceEl.removeAttribute("srcset");
            else sourceEl.setAttribute("srcset", value);
          });
        }
      }
    });
  }

  function applyElementOverride(selector, override) {
    var originalImgSrc = parseImgSrcSelector(selector);
    var elements = [];

    try {
      if (originalImgSrc != null) {
        var nextSrc =
          override && override.attributes ? override.attributes.src : "";
        elements = Array.from(document.querySelectorAll("img")).filter(function(
          img,
        ) {
          var current = img.getAttribute("src") || "";
          var markedOrig = img.getAttribute("data-admin-orig-src") || "";
          return (
            current === originalImgSrc ||
            (nextSrc && current === nextSrc) ||
            markedOrig === originalImgSrc
          );
        });
      } else {
        elements = Array.from(document.querySelectorAll(selector));
      }
    } catch (e) {
      elements = [];
    }

    if (!elements.length) return;

    elements.forEach(function(el) {
      if (override.contentMode === "text")
        el.textContent = override.content || "";
      if (override.contentMode === "html")
        el.innerHTML = override.content || "";
      applyAttributes(el, override.attributes, originalImgSrc);
    });
  }

  function applyTranslations(state, language) {
    var lang = language || localStorage.getItem("selectedLanguage") || "en";
    Object.keys(state.translations || {}).forEach(function(key) {
      var text = state.translations[key] && state.translations[key][lang];
      if (typeof text !== "string" || text === "") return;
      try {
        var el = document.querySelector('[data-key="' + key + '"]');
        if (el) el.textContent = text;
      } catch (e) {}
    });
  }

  function applyState(state, language) {
    var n = normalizeState(state);
    ensureStyleTag().textContent = n.globalCss || "";
    Object.keys(n.elements || {}).forEach(function(selector) {
      applyElementOverride(selector, n.elements[selector]);
    });
    applyTranslations(n, language);
  }

  async function loadProjectState() {
    try {
      var response = await fetch(PROJECT_OVERRIDES_URL + "?t=" + Date.now(), {
        cache: "no-store",
      });
      if (!response.ok) return emptyState();
      return normalizeState(await response.json());
    } catch (e) {
      return emptyState();
    }
  }

  async function applyRuntimeState(event) {
    var projectState = await loadProjectState();
    var localState = loadLocalState();
    var runtimeState = mergeStates(projectState, localState);
    var lang =
      event && event.detail && event.detail.language
        ? event.detail.language
        : null;
    applyState(runtimeState, lang);
  }

  applyRuntimeState();
  window.addEventListener("language:updated", applyRuntimeState);
  window.addEventListener("admin:refresh-overrides", applyRuntimeState);
})();
