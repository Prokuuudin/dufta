(function() {
  "use strict";

  var STORAGE_KEY = "duftaAdminOverrides";
  var SESSION_KEY = "duftaAdminSession";
  var CONFIG_URL = "./files/admin-config.json";
  var DEFAULT_HASH =
    "a9bbc79c24c7ad72012f15e0942353af3d02fe973a296b0c723343f0a17dd67e";
  var LOCAL_HASH_KEY = "duftaAdminPasswordHash";
  var HISTORY_LIMIT = 30;
  var SUPPORTED_LANGS = ["ru", "en", "lv", "lt", "ee"];
  var LANGUAGE_LABELS = {
    ru: "Русский",
    en: "English",
    lv: "Latviešu",
    lt: "Lietuvių",
    ee: "Eesti",
  };

  var adminState = loadState();
  var projectFileHandle = null;
  var configFileHandle = null;
  var adminConfig = { passwordHash: DEFAULT_HASH };
  var previewDoc = null;
  var selectedSelector = "";
  var selectedPersistentSelector = "";
  var selectedDataKey = "";
  var pendingSelection = "";
  var lastStateSaveOk = true;
  var isProbingLanguages = false;
  var changeHistory = [];

  function $(id) {
    return document.getElementById(id);
  }

  var authOverlay = $("admin-auth");
  var authPassword = $("admin-password");
  var authLoginBtn = $("admin-login");
  var authCloseBtn = $("admin-auth-close");
  var authStatus = $("admin-auth-status");
  var logoutBtn = $("admin-logout");
  var topbarStatus = $("admin-status");
  var langSelect = $("admin-language");
  var saveAllBtn = $("save-all");
  var undoBtn = $("admin-undo");
  var previewFrame = $("preview-frame");
  var panelIdle = $("panel-idle");
  var panelForm = $("panel-form");
  var editTag = $("edit-tag");
  var saveElementBtn = $("save-element");
  var removeElementBtn = $("remove-element");
  var fieldGroupI18n = $("field-group-i18n");
  var fieldGroupImage = $("field-group-image");
  var I18N = {
    ru: $("i18n-field-ru"),
    en: $("i18n-field-en"),
    lv: $("i18n-field-lv"),
    lt: $("i18n-field-lt"),
    ee: $("i18n-field-ee"),
  };
  var fieldSrc = $("field-src");
  var fieldAlt = $("field-alt");
  var imageUpload = $("field-image-upload");
  var overridesList = $("saved-overrides");
  var overridesCount = $("saved-overrides-count");
  var advancedPanel = $("advanced-panel");
  var advancedOverlay = $("advanced-overlay");
  var toggleAdvBtn = $("toggle-advanced");
  var closeAdvBtn = $("close-advanced");
  var saveProjectBtn = $("save-project-file");
  var resetBtn = $("reset-overrides");
  var projectStatus = $("project-file-status");
  var globalCssTA = null;
  var configStatus = null;

  /* STATE */

  function emptyState() {
    return { version: 1, globalCss: "", elements: {}, translations: {} };
  }

  function normalizeState(s) {
    var n = emptyState();
    if (!s || typeof s !== "object") return n;
    if (typeof s.globalCss === "string") n.globalCss = s.globalCss;
    if (s.elements && typeof s.elements === "object") {
      Object.keys(s.elements).forEach(function(sel) {
        var ov = s.elements[sel];
        if (!ov || typeof ov !== "object") return;
        var r = {};
        if (ov.contentMode === "text" || ov.contentMode === "html") {
          r.contentMode = ov.contentMode;
          r.content = typeof ov.content === "string" ? ov.content : "";
        }
        if (ov.attributes && typeof ov.attributes === "object") {
          var a = {};
          Object.keys(ov.attributes).forEach(function(k) {
            if (typeof ov.attributes[k] === "string") a[k] = ov.attributes[k];
          });
          if (Object.keys(a).length) r.attributes = a;
        }
        if (Object.keys(r).length) n.elements[sel] = r;
      });
    }
    if (s.translations && typeof s.translations === "object") {
      Object.keys(s.translations).forEach(function(key) {
        var langs = s.translations[key];
        if (!langs || typeof langs !== "object") return;
        var nl = {};
        SUPPORTED_LANGS.forEach(function(lang) {
          if (typeof langs[lang] === "string") nl[lang] = langs[lang];
        });
        if (Object.keys(nl).length) n.translations[key] = nl;
      });
    }
    return n;
  }

  function loadState() {
    try {
      var r = localStorage.getItem(STORAGE_KEY);
      return r ? normalizeState(JSON.parse(r)) : emptyState();
    } catch (e) {
      return emptyState();
    }
  }

  function saveState(state) {
    var n = normalizeState(state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(n));
      lastStateSaveOk = true;
    } catch (e) {
      lastStateSaveOk = false;
      setStatus(
        "Не удалось сохранить: данные слишком большие (попробуйте URL вместо файла).",
        "error",
      );
    }
    return n;
  }

  function clearState() {
    localStorage.removeItem(STORAGE_KEY);
    return emptyState();
  }

  /* APPLY OVERRIDES */

  function applyOverrides(doc, state, lang) {
    var n = normalizeState(state);
    var language = lang || getCurrentLanguage();
    var sid = "dufta-admin-overrides-style";
    var st = doc.getElementById(sid);
    if (!st) {
      st = doc.createElement("style");
      st.id = sid;
      doc.head.appendChild(st);
    }
    st.textContent = n.globalCss;
    Object.keys(n.elements).forEach(function(sel) {
      var ov = n.elements[sel];
      try {
        var isImgSrcSel = /^img\[src=/.test(sel);
        var els;
        if (isImgSrcSel) {
          var origSrc = sel.replace(/^img\[src="(.*)"\]$/, "$1");
          var newSrc = (ov.attributes && ov.attributes.src) || "";
          els = Array.from(doc.querySelectorAll("img")).filter(function(img) {
            var s = img.getAttribute("src") || "";
            return s === origSrc || (newSrc && s === newSrc);
          });
        } else {
          var matched = doc.querySelectorAll(sel);
          els = matched.length ? Array.from(matched) : [];
        }
        if (!els.length) return;
        els.forEach(function(el) {
          if (ov.contentMode === "text") el.textContent = ov.content || "";
          if (ov.contentMode === "html") el.innerHTML = ov.content || "";
          if (ov.attributes)
            Object.keys(ov.attributes).forEach(function(a) {
              if (ov.attributes[a] === "") el.removeAttribute(a);
              else el.setAttribute(a, ov.attributes[a]);

              // If image is inside <picture>, update <source srcset> as well.
              if (
                a === "src" &&
                el.tagName &&
                el.tagName.toLowerCase() === "img" &&
                el.parentElement &&
                el.parentElement.tagName &&
                el.parentElement.tagName.toLowerCase() === "picture"
              ) {
                var nextSrc = ov.attributes[a];
                Array.from(el.parentElement.querySelectorAll("source")).forEach(
                  function(sourceEl) {
                    if (nextSrc === "") sourceEl.removeAttribute("srcset");
                    else sourceEl.setAttribute("srcset", nextSrc);
                  },
                );
              }
            });
        });
      } catch (e) {}
    });
    Object.keys(n.translations).forEach(function(key) {
      var langs = n.translations[key];
      var text = langs[language];
      if (text == null || text === "") return;
      try {
        var el = doc.querySelector('[data-key="' + key + '"]');
        if (el) el.textContent = text;
      } catch (e) {}
    });
  }

  /* SELECTOR BUILDER */

  function cssEsc(v) {
    return window.CSS && window.CSS.escape
      ? window.CSS.escape(v)
      : v.replace(/([#.;?+<>~:\\[\](){}'" ])/g, "\\$1");
  }

  function isDomElement(el) {
    return !!el && el.nodeType === 1 && typeof el.tagName === "string";
  }

  function buildSelector(el) {
    if (!isDomElement(el)) return "";
    if (el.id) return "#" + cssEsc(el.id);
    if (el.hasAttribute("data-key"))
      return '[data-key="' + cssEsc(el.getAttribute("data-key")) + '"]';
    var parts = [],
      cur = el;
    while (cur && cur.tagName && cur.tagName.toLowerCase() !== "html") {
      if (cur.id) {
        parts.unshift("#" + cssEsc(cur.id));
        break;
      }
      if (cur.hasAttribute("data-key")) {
        parts.unshift(
          '[data-key="' + cssEsc(cur.getAttribute("data-key")) + '"]',
        );
        break;
      }
      var s = cur.tagName.toLowerCase();
      var cls = Array.from(cur.classList).find(function(c) {
        return (
          !c.startsWith("swiper") &&
          !c.startsWith("is-") &&
          !c.startsWith("js-")
        );
      });
      if (cls) s += "." + cssEsc(cls);
      if (cur.parentElement) {
        var sibs = Array.from(cur.parentElement.children).filter(function(x) {
          return x.tagName === cur.tagName;
        });
        if (sibs.length > 1)
          s += ":nth-of-type(" + (sibs.indexOf(cur) + 1) + ")";
      }
      parts.unshift(s);
      cur = cur.parentElement;
    }
    return parts.join(" > ");
  }

  /* HELPERS */

  var TAG_LABELS = {
    h1: "Заголовок 1",
    h2: "Заголовок 2",
    h3: "Заголовок 3",
    h4: "Заголовок 4",
    h5: "Заголовок 5",
    h6: "Заголовок 6",
    p: "Абзац",
    a: "Ссылка",
    button: "Кнопка",
    span: "Текст",
    img: "Изображение",
    li: "Пункт списка",
    strong: "Жирный текст",
    em: "Курсив",
    label: "Подпись",
  };

  function getTag(el) {
    return TAG_LABELS[el.tagName.toLowerCase()] || "Элемент";
  }

  function setStatus(msg, type) {
    if (topbarStatus) {
      topbarStatus.textContent = msg;
      topbarStatus.dataset.status = type || "info";
    }
  }

  function getCurrentLanguage() {
    try {
      return localStorage.getItem("selectedLanguage") || "en";
    } catch (e) {
      return "en";
    }
  }

  function syncLanguageControl(language) {
    if (!langSelect || !language) return;
    if (langSelect.value !== language) langSelect.value = language;
  }

  function refreshSelectedElementFields() {
    if (isProbingLanguages) return;
    if (!selectedSelector || !previewDoc) return;
    try {
      var selected = null;
      try {
        selected = previewDoc.querySelector(selectedSelector);
      } catch (e) {}
      if (!selected && selectedDataKey) {
        try {
          selected = previewDoc.querySelector(
            '[data-key="' + cssEsc(selectedDataKey) + '"]',
          );
          if (selected)
            selectedSelector = '[data-key="' + cssEsc(selectedDataKey) + '"]';
        } catch (e) {}
      }
      if (!selected) return;
      selected.setAttribute("data-admin-selected", "true");
      fillFields(selected);
      showPanel(selected);
    } catch (e) {}
  }

  function setPreviewLanguage(language) {
    if (SUPPORTED_LANGS.indexOf(language) === -1) return;
    localStorage.setItem("selectedLanguage", language);
    syncLanguageControl(language);

    if (!previewDoc) {
      setStatus(
        "Язык предпросмотра: " + (LANGUAGE_LABELS[language] || language),
        "info",
      );
      return;
    }

    try {
      var radio = previewDoc.querySelector(
        'input[name="language"][value="' + language + '"]',
      );
      if (radio) {
        var changeEvent = previewDoc.createEvent("Event");
        radio.checked = true;
        changeEvent.initEvent("change", true, true);
        radio.dispatchEvent(changeEvent);
      } else {
        applyOverrides(previewDoc, adminState, language);
      }
    } catch (e) {
      applyOverrides(previewDoc, adminState, language);
    }

    refreshSelectedElementFields();
    setStatus(
      "Язык предпросмотра: " + (LANGUAGE_LABELS[language] || language),
      "info",
    );
  }

  function getPreviewTextForLanguage(language, dataKey) {
    if (!previewDoc) return "";
    try {
      var radio = previewDoc.querySelector(
        'input[name="language"][value="' + language + '"]',
      );
      if (radio) {
        var changeEvent = previewDoc.createEvent("Event");
        radio.checked = true;
        changeEvent.initEvent("change", true, true);
        radio.dispatchEvent(changeEvent);
      } else {
        applyOverrides(previewDoc, adminState, language);
      }

      var el = null;
      try {
        el = selectedSelector
          ? previewDoc.querySelector(selectedSelector)
          : null;
      } catch (e) {}
      if (!el && dataKey) {
        try {
          el = previewDoc.querySelector('[data-key="' + cssEsc(dataKey) + '"]');
        } catch (e) {}
      }
      return el ? (el.textContent || "").trim() : "";
    } catch (e) {
      return "";
    }
  }

  function setProjStatus(msg, type) {
    if (projectStatus) {
      projectStatus.textContent = msg;
      projectStatus.dataset.status = type || "info";
    }
  }
  function setCfgStatus(msg, type) {
    if (configStatus) {
      configStatus.textContent = msg;
      configStatus.dataset.status = type || "info";
    }
  }

  /* AUTH */

  async function sha256(str) {
    var buf = new TextEncoder().encode(str);
    var hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash))
      .map(function(b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  async function loadConfig() {
    try {
      var res = await fetch(CONFIG_URL + "?t=" + Date.now(), {
        cache: "no-store",
      });
      if (res.ok) {
        var d = await res.json();
        localStorage.removeItem(LOCAL_HASH_KEY);
        return {
          passwordHash:
            typeof d.passwordHash === "string" && d.passwordHash
              ? d.passwordHash
              : DEFAULT_HASH,
        };
      }
    } catch (e) {}

    try {
      var local = localStorage.getItem(LOCAL_HASH_KEY);
      if (local) return { passwordHash: local };
    } catch (e) {}

    return { passwordHash: DEFAULT_HASH };
  }

  function unlockAdmin() {
    document.body.classList.add("is-authorized");
    authOverlay.hidden = true;
    sessionStorage.setItem(SESSION_KEY, "authorized");
    authStatus.textContent = "Доступ разрешен.";
    authStatus.dataset.status = "success";
  }

  function showAuthOverlay() {
    document.body.classList.remove("is-authorized");
    authOverlay.hidden = false;
    if (authPassword) authPassword.value = "";
    if (authStatus) authStatus.textContent = "";
  }

  function lockAdmin() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "./index.html";
  }

  function goBack() {
    window.location.href = "./index.html";
  }

  function closeAdvancedPanel() {
    if (advancedPanel) advancedPanel.hidden = true;
    if (advancedOverlay) advancedOverlay.hidden = true;
    if (toggleAdvBtn) toggleAdvBtn.classList.remove("is-active");
  }

  async function submitLogin() {
    var pw = authPassword.value;
    if (!pw) {
      authStatus.textContent = "Введите пароль.";
      authStatus.dataset.status = "error";
      return;
    }
    var hash = await sha256(pw);
    if (hash !== adminConfig.passwordHash) {
      authStatus.textContent = "Неверный пароль.";
      authStatus.dataset.status = "error";
      return;
    }
    unlockAdmin();
    setStatus("Добро пожаловать! Кликните любой элемент на сайте.", "success");
  }

  /* HISTORY */

  function cloneState(s) {
    return normalizeState(JSON.parse(JSON.stringify(normalizeState(s))));
  }

  function pushHistory(label) {
    changeHistory.unshift({
      label: label,
      timestamp: new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      state: cloneState(adminState),
    });
    if (changeHistory.length > HISTORY_LIMIT)
      changeHistory = changeHistory.slice(0, HISTORY_LIMIT);
    updateHistoryList();
  }

  function updateHistoryList() {
    if (undoBtn) undoBtn.disabled = !changeHistory.length;
  }

  function undoLast() {
    if (!changeHistory.length) {
      setStatus("История пуста.", "error");
      return;
    }
    var last = changeHistory.shift();
    adminState = saveState(last.state);
    updateOverridesList();
    updateHistoryList();
    setStatus("Откат: " + last.label, "success");
    reloadPreview(selectedPersistentSelector);
  }

  /* PANEL */

  function showPanel(element) {
    var tag = element.tagName.toLowerCase();
    var isImg = tag === "img";
    var hasKey = element.hasAttribute("data-key");
    if (fieldGroupI18n) fieldGroupI18n.hidden = !hasKey;
    if (fieldGroupImage) fieldGroupImage.hidden = !isImg;
    if (editTag) editTag.textContent = getTag(element);
    if (panelIdle) panelIdle.hidden = true;
    if (panelForm) panelForm.hidden = false;
  }

  function closePanel() {
    if (panelIdle) panelIdle.hidden = false;
    if (panelForm) panelForm.hidden = true;
    selectedSelector = "";
    selectedPersistentSelector = "";
    selectedDataKey = "";
    if (previewDoc)
      previewDoc
        .querySelectorAll("[data-admin-selected]")
        .forEach(function(el) {
          el.removeAttribute("data-admin-selected");
        });
    setStatus("Кликните любой элемент на сайте, чтобы изменить его.", "info");
  }

  /* FILL FIELDS */

  function getAttr(attr) {
    if (!selectedSelector) return "";
    var el = null;
    try {
      el = previewDoc ? previewDoc.querySelector(selectedSelector) : null;
    } catch (e) {}
    var ov = adminState.elements[selectedPersistentSelector];
    if (
      ov &&
      ov.attributes &&
      Object.prototype.hasOwnProperty.call(ov.attributes, attr)
    )
      return ov.attributes[attr];
    return (el && el.getAttribute(attr)) || "";
  }

  function fillFields(element) {
    var dataKey = element.getAttribute("data-key");

    if (dataKey) {
      var saved =
        (adminState.translations && adminState.translations[dataKey]) || {};
      if (Object.keys(saved).length > 0) {
        SUPPORTED_LANGS.forEach(function(lang) {
          if (I18N[lang]) I18N[lang].value = saved[lang] || "";
        });
      } else {
        var previousLang = getCurrentLanguage();
        isProbingLanguages = true;
        SUPPORTED_LANGS.forEach(function(lang) {
          if (!I18N[lang]) return;
          I18N[lang].value = getPreviewTextForLanguage(lang, dataKey);
        });
        setPreviewLanguage(previousLang);
        isProbingLanguages = false;
      }
      if (removeElementBtn)
        removeElementBtn.disabled = !(
          adminState.translations && adminState.translations[dataKey]
        );
    } else {
      var ov = adminState.elements[selectedPersistentSelector] || null;
      try {
        if (fieldSrc) fieldSrc.value = getAttr("src");
        if (fieldAlt) fieldAlt.value = getAttr("alt");
      } catch (e) {}
      if (removeElementBtn) removeElementBtn.disabled = !ov;
    }
    setStatus("Редактируете: " + getTag(element), "success");
  }

  /* SELECT ELEMENT */

  function isEditable(el) {
    return (
      isDomElement(el) &&
      !el.matches("html, head, script, style, meta, link, iframe")
    );
  }

  function selectElement(element) {
    if (!previewDoc || !isEditable(element)) return;
    previewDoc
      .querySelectorAll("[data-admin-selected],[data-admin-hover]")
      .forEach(function(el) {
        el.removeAttribute("data-admin-selected");
        el.removeAttribute("data-admin-hover");
      });
    selectedDataKey = element.getAttribute("data-key") || "";
    if (selectedDataKey) {
      selectedSelector = '[data-key="' + cssEsc(selectedDataKey) + '"]';
      selectedPersistentSelector = selectedSelector;
    } else if (element.tagName.toLowerCase() === "img" && !element.id) {
      var adminKey = element.getAttribute("data-admin-key");
      if (!adminKey) {
        adminKey =
          "elem-" +
          Date.now() +
          "-" +
          Math.random()
            .toString(36)
            .substr(2, 9);
        element.setAttribute("data-admin-key", adminKey);
      }
      selectedSelector = '[data-admin-key="' + adminKey + '"]';
      var currentSrc = element.getAttribute("src") || "";
      var persistKey =
        'img[src="' +
        currentSrc.replace(/\\/g, "\\\\").replace(/"/g, '\\"') +
        '"]';
      Object.keys(adminState.elements).forEach(function(k) {
        if (k.indexOf("img[src=") === 0) {
          var kov = adminState.elements[k];
          if (kov.attributes && kov.attributes.src === currentSrc)
            persistKey = k;
        }
      });
      selectedPersistentSelector = persistKey;
    } else {
      selectedSelector = buildSelector(element);
      selectedPersistentSelector = selectedSelector;
    }
    element.setAttribute("data-admin-selected", "true");
    fillFields(element);
    showPanel(element);
    updateOverridesList();
  }

  /* PERSIST */

  function persistState() {
    adminState = saveState(adminState);
    updateOverridesList();
    if (globalCssTA) globalCssTA.value = adminState.globalCss;
    if (previewDoc) {
      var lang = getCurrentLanguage();
      applyOverrides(previewDoc, adminState, lang);
    }
    return lastStateSaveOk;
  }

  /* SAVE ELEMENT */

  function saveElement() {
    if (!selectedSelector) {
      setStatus("Сначала выберите элемент.", "error");
      return false;
    }
    var el = null;
    try {
      el = previewDoc ? previewDoc.querySelector(selectedSelector) : null;
    } catch (e) {}
    if (!el) {
      setStatus("Элемент не найден. Кликните на него снова.", "error");
      return false;
    }

    if (selectedDataKey) {
      var langs = {};
      SUPPORTED_LANGS.forEach(function(lang) {
        if (I18N[lang]) langs[lang] = I18N[lang].value;
      });
      pushHistory("Перевод: " + selectedDataKey);
      if (!adminState.translations) adminState.translations = {};
      adminState.translations[selectedDataKey] = langs;
      if (!persistState()) return false;
      if (removeElementBtn) removeElementBtn.disabled = false;
      setStatus("Текст сохранён на всех 5 языках.", "success");
      return true;
    }

    var nextOv = {};

    var attrMap = { src: fieldSrc, alt: fieldAlt };
    var attrs = {};
    var existOv = adminState.elements[selectedPersistentSelector] || {};
    Object.keys(attrMap).forEach(function(attr) {
      var f = attrMap[attr];
      if (!f) return;
      if (
        f.value !== "" ||
        el.hasAttribute(attr) ||
        (existOv.attributes &&
          Object.prototype.hasOwnProperty.call(existOv.attributes, attr))
      )
        attrs[attr] = f.value.trim();
    });
    if (Object.keys(attrs).length) nextOv.attributes = attrs;

    if (!Object.keys(nextOv).length) {
      if (!adminState.elements[selectedPersistentSelector]) {
        setStatus("Нет изменений.", "info");
        return false;
      }
      pushHistory("Сброс: " + selectedPersistentSelector);
      delete adminState.elements[selectedPersistentSelector];
    } else {
      pushHistory("Изменение: " + selectedPersistentSelector);
      adminState.elements[selectedPersistentSelector] = nextOv;
    }
    if (!persistState()) return false;
    setStatus("Изменения сохранены.", "success");
    return true;
  }

  /* REMOVE ELEMENT */

  function removeElement() {
    if (selectedDataKey) {
      if (
        !adminState.translations ||
        !adminState.translations[selectedDataKey]
      ) {
        setStatus("Нет сохранённых изменений.", "error");
        return;
      }
      pushHistory("Сброс перевода: " + selectedDataKey);
      delete adminState.translations[selectedDataKey];
      adminState = saveState(adminState);
      if (removeElementBtn) removeElementBtn.disabled = true;
      updateOverridesList();
      setStatus("Перевод сброшен.", "info");
      reloadPreview(selectedSelector);
      return;
    }
    if (
      !selectedPersistentSelector ||
      !adminState.elements[selectedPersistentSelector]
    ) {
      setStatus("Нет сохранённых изменений.", "error");
      return;
    }
    pushHistory("Удаление: " + selectedPersistentSelector);
    delete adminState.elements[selectedPersistentSelector];
    adminState = saveState(adminState);
    setStatus("Override удалён.", "info");
    reloadPreview(selectedPersistentSelector);
  }

  /* CSS */

  function saveGlobalCss() {
    if (!globalCssTA) return false;
    var val = globalCssTA.value;
    if (adminState.globalCss === val) return false;
    pushHistory("Изменение CSS");
    adminState.globalCss = val;
    if (!persistState()) return false;
    setStatus("CSS сохранён.", "success");
    return true;
  }

  async function quickSave() {
    var changed = saveElement();
    if (!changed) {
      setStatus("Нет новых изменений.", "info");
      return;
    }
    if (projectFileHandle) {
      await saveProjectFile();
    }
  }

  function reloadPreview(selector) {
    if (!previewFrame) return;
    pendingSelection = selector || "";
    try {
      var src =
        previewFrame.getAttribute("src") || "./index.html?adminPreview=1";
      var url = new URL(src, window.location.href);
      url.searchParams.set("_adminRefresh", String(Date.now()));
      previewFrame.src = url.pathname + url.search;
    } catch (e) {
      previewFrame.src =
        "./index.html?adminPreview=1&_adminRefresh=" + Date.now();
    }
  }

  function ensurePreviewBinding() {
    if (!previewFrame) return;
    try {
      var doc = previewFrame.contentDocument;
      if (doc && doc.readyState && doc.readyState !== "loading") bindPreview();
    } catch (e) {}
  }

  function bindPreview() {
    previewDoc = previewFrame.contentDocument;
    if (!previewDoc) {
      setStatus("Не удалось подключиться к превью.", "error");
      return;
    }

    if (!previewDoc.getElementById("dufta-admin-preview-style")) {
      var s = previewDoc.createElement("style");
      s.id = "dufta-admin-preview-style";
      s.textContent =
        '[data-admin-selected="true"]{outline:3px solid #f37f21!important;outline-offset:2px!important}[data-admin-hover="true"]{outline:2px dashed rgba(243,127,33,.55)!important;outline-offset:2px!important;cursor:crosshair!important}';
      previewDoc.head.appendChild(s);
    }

    var lang = getCurrentLanguage();
    applyOverrides(previewDoc, adminState, lang);
    syncLanguageControl(lang);

    try {
      previewDoc.defaultView.addEventListener("language:updated", function(
        event,
      ) {
        var nextLang =
          event && event.detail && event.detail.language
            ? event.detail.language
            : getCurrentLanguage();
        syncLanguageControl(nextLang);
        applyOverrides(previewDoc, adminState, nextLang);
        if (isProbingLanguages) return;
        refreshSelectedElementFields();
      });
    } catch (e) {}

    previewDoc.addEventListener(
      "mouseover",
      function(e) {
        var el = e.target.closest("body *");
        if (!el || !isEditable(el)) return;
        previewDoc.querySelectorAll("[data-admin-hover]").forEach(function(x) {
          x.removeAttribute("data-admin-hover");
        });
        if (el.getAttribute("data-admin-selected") !== "true")
          el.setAttribute("data-admin-hover", "true");
      },
      true,
    );

    previewDoc.addEventListener(
      "click",
      function(e) {
        e.preventDefault();
        e.stopPropagation();
        var el = e.target.closest("body *");
        if (!el || !isEditable(el)) {
          closePanel();
          return;
        }
        selectElement(el);
      },
      true,
    );

    if (pendingSelection) {
      try {
        var pending = previewDoc.querySelector(pendingSelection);
        if (pending) selectElement(pending);
      } catch (e) {}
      pendingSelection = "";
    }

    setStatus("Кликните любой элемент на сайте, чтобы изменить его.", "info");
  }

  /* OVERRIDES LIST */

  function updateOverridesList() {
    var tKeys = Object.keys(adminState.translations || {});
    var eKeys = Object.keys(adminState.elements || {});
    if (overridesCount)
      overridesCount.textContent = String(tKeys.length + eKeys.length);
    if (!overridesList) return;
    overridesList.innerHTML = "";
    if (!tKeys.length && !eKeys.length) {
      overridesList.innerHTML = '<p class="adv-empty">Изменений пока нет.</p>';
      return;
    }
    tKeys.forEach(function(key) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "adv-override-item" + (selectedDataKey === key ? " is-active" : "");
      btn.textContent = "🌐 " + key;
      btn.addEventListener("click", function() {
        if (!previewDoc) return;
        try {
          var el = previewDoc.querySelector('[data-key="' + key + '"]');
          if (el) selectElement(el);
          else setStatus("Элемент не найден: " + key, "error");
        } catch (e) {}
      });
      overridesList.appendChild(btn);
    });
    eKeys.forEach(function(sel) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "adv-override-item" +
        (selectedPersistentSelector === sel ? " is-active" : "");
      btn.textContent = sel;
      btn.addEventListener("click", function() {
        if (!previewDoc) return;
        try {
          var el = previewDoc.querySelector(sel);
          if (el) selectElement(el);
          else setStatus("Элемент не найден: " + sel, "error");
        } catch (e) {}
      });
      overridesList.appendChild(btn);
    });
  }

  /* RESET */

  function resetAll() {
    if (!confirm("Удалить все сохранённые изменения?")) return;
    pushHistory("Сброс всего");
    adminState = clearState();
    closePanel();
    updateOverridesList();
    setStatus("Все изменения удалены.", "info");
    reloadPreview();
  }

  /* PROJECT FILE */

  async function saveProjectFile() {
    var payload = JSON.stringify(normalizeState(adminState), null, 2);
    if (!("showSaveFilePicker" in window) && !projectFileHandle) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([payload], { type: "application/json" }),
      );
      a.download = "dufta-admin-overrides.json";
      a.click();
      setProjStatus("Файл скачан.", "info");
      return;
    }
    try {
      if (!projectFileHandle) {
        projectFileHandle = await window.showSaveFilePicker({
          suggestedName: "admin-overrides.json",
          types: [
            { description: "JSON", accept: { "application/json": [".json"] } },
          ],
        });
      }
      var w = await projectFileHandle.createWritable();
      await w.write(payload);
      await w.close();
      setProjStatus("Файл сохранён.", "success");
    } catch (e) {
      if (e.name !== "AbortError") {
        setProjStatus("Не удалось сохранить файл.", "error");
      }
    }
  }

  /* IMAGE */

  function loadImage(e) {
    var file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Только изображения.", "error");
      e.target.value = "";
      return;
    }
    var reader = new FileReader();
    reader.onload = function() {
      if (fieldSrc) fieldSrc.value = reader.result;
      setStatus("Картинка загружена. Нажмите Применить.", "success");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  /* KEYBOARD */

  function onKey(e) {
    if (e.key === "Escape") {
      if (authOverlay && !authOverlay.hidden) {
        goBack();
        return;
      }
      closePanel();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (e.shiftKey) saveProjectFile();
      else quickSave();
    }
  }

  /* INIT */

  async function init() {
    adminConfig = await loadConfig();
    updateOverridesList();
    updateHistoryList();
    setProjStatus("", "info");
    setStatus("Загружаю сайт...", "info");

    if (previewFrame) {
      previewFrame.addEventListener("load", bindPreview);
      ensurePreviewBinding();
    }
    if (saveElementBtn) saveElementBtn.addEventListener("click", saveElement);
    if (removeElementBtn)
      removeElementBtn.addEventListener("click", removeElement);
    if (saveAllBtn) saveAllBtn.addEventListener("click", quickSave);
    if (undoBtn) undoBtn.addEventListener("click", undoLast);
    if (saveProjectBtn)
      saveProjectBtn.addEventListener("click", saveProjectFile);
    if (resetBtn) resetBtn.addEventListener("click", resetAll);
    if (imageUpload) imageUpload.addEventListener("change", loadImage);
    if (toggleAdvBtn)
      toggleAdvBtn.addEventListener("click", function() {
        advancedPanel.hidden = !advancedPanel.hidden;
        if (advancedOverlay) advancedOverlay.hidden = advancedPanel.hidden;
        toggleAdvBtn.classList.toggle("is-active", !advancedPanel.hidden);
      });
    if (closeAdvBtn) closeAdvBtn.addEventListener("click", closeAdvancedPanel);
    if (advancedPanel)
      advancedPanel.addEventListener("click", function(e) {
        if (e.target === advancedPanel) closeAdvancedPanel();
      });
    if (advancedOverlay)
      advancedOverlay.addEventListener("click", closeAdvancedPanel);
    if (authCloseBtn) authCloseBtn.addEventListener("click", goBack);
    if (authOverlay)
      authOverlay.addEventListener("click", function(e) {
        if (e.target === authOverlay) goBack();
      });
    if (authLoginBtn) authLoginBtn.addEventListener("click", submitLogin);
    if (authPassword)
      authPassword.addEventListener("keydown", function(e) {
        if (e.key === "Enter") submitLogin();
      });
    if (langSelect) {
      syncLanguageControl(getCurrentLanguage());
      langSelect.addEventListener("change", function(event) {
        setPreviewLanguage(event.target.value);
      });
    }
    if (logoutBtn) logoutBtn.addEventListener("click", lockAdmin);
    document.addEventListener("keydown", onKey);

    if (sessionStorage.getItem(SESSION_KEY) === "authorized") unlockAdmin();
    else showAuthOverlay();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
