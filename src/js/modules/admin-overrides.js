const STORAGE_KEY = "duftaAdminOverrides";
const STYLE_TAG_ID = "dufta-admin-overrides-style";
export const PROJECT_OVERRIDES_URL = "./files/admin-overrides.json";

function createEmptyAdminState() {
  return {
    version: 1,
    globalCss: "",
    elements: {},
    translations: {},
  };
}

function normalizeElementOverride(override) {
  if (!override || typeof override !== "object") {
    return null;
  }

  const normalized = {};

  if (override.contentMode === "text" || override.contentMode === "html") {
    normalized.contentMode = override.contentMode;
    normalized.content =
      typeof override.content === "string" ? override.content : "";
  }

  if (
    override.attributes &&
    typeof override.attributes === "object" &&
    !Array.isArray(override.attributes)
  ) {
    const attributes = {};

    Object.entries(override.attributes).forEach(
      ([attributeName, attributeValue]) => {
        if (
          typeof attributeName !== "string" ||
          typeof attributeValue !== "string"
        ) {
          return;
        }

        attributes[attributeName] = attributeValue;
      },
    );

    if (Object.keys(attributes).length) {
      normalized.attributes = attributes;
    }
  }

  return Object.keys(normalized).length ? normalized : null;
}

export function normalizeAdminState(state) {
  const normalized = createEmptyAdminState();

  if (!state || typeof state !== "object") {
    return normalized;
  }

  if (typeof state.globalCss === "string") {
    normalized.globalCss = state.globalCss;
  }

  if (
    state.elements &&
    typeof state.elements === "object" &&
    !Array.isArray(state.elements)
  ) {
    Object.entries(state.elements).forEach(([selector, override]) => {
      if (typeof selector !== "string" || !selector.trim()) {
        return;
      }

      const normalizedOverride = normalizeElementOverride(override);
      if (normalizedOverride) {
        normalized.elements[selector] = normalizedOverride;
      }
    });
  }

  const SUPPORTED_LANGS = ["ru", "en", "lv", "lt", "ee"];
  if (
    state.translations &&
    typeof state.translations === "object" &&
    !Array.isArray(state.translations)
  ) {
    Object.entries(state.translations).forEach(([key, langs]) => {
      if (typeof key !== "string" || !key.trim() || typeof langs !== "object") {
        return;
      }
      const normalizedLangs = {};
      SUPPORTED_LANGS.forEach((lang) => {
        if (typeof langs[lang] === "string") {
          normalizedLangs[lang] = langs[lang];
        }
      });
      if (Object.keys(normalizedLangs).length) {
        normalized.translations[key] = normalizedLangs;
      }
    });
  }

  return normalized;
}

export function loadAdminState() {
  try {
    const rawState = localStorage.getItem(STORAGE_KEY);
    if (!rawState) {
      return createEmptyAdminState();
    }

    return normalizeAdminState(JSON.parse(rawState));
  } catch (error) {
    console.warn("Failed to load admin overrides", error);
    return createEmptyAdminState();
  }
}

export function mergeAdminStates(...states) {
  return states.reduce((mergedState, currentState) => {
    const normalizedState = normalizeAdminState(currentState);

    if (normalizedState.globalCss) {
      mergedState.globalCss = normalizedState.globalCss;
    }

    mergedState.elements = {
      ...mergedState.elements,
      ...normalizedState.elements,
    };

    mergedState.translations = {
      ...mergedState.translations,
      ...normalizedState.translations,
    };

    return mergedState;
  }, createEmptyAdminState());
}

export async function loadProjectAdminState(url = PROJECT_OVERRIDES_URL) {
  try {
    const response = await fetch(`${url}?t=${Date.now()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return createEmptyAdminState();
    }

    return normalizeAdminState(await response.json());
  } catch (error) {
    console.warn("Failed to load project admin overrides", error);
    return createEmptyAdminState();
  }
}

export async function loadRuntimeAdminState() {
  const [projectState, localState] = await Promise.all([
    loadProjectAdminState(),
    Promise.resolve(loadAdminState()),
  ]);

  return mergeAdminStates(projectState, localState);
}

export function saveAdminState(state) {
  const normalizedState = normalizeAdminState(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedState));
  return normalizedState;
}

export function clearAdminState() {
  localStorage.removeItem(STORAGE_KEY);
  return createEmptyAdminState();
}

function ensureStyleTag(documentRef) {
  let styleTag = documentRef.getElementById(STYLE_TAG_ID);
  if (styleTag) {
    return styleTag;
  }

  styleTag = documentRef.createElement("style");
  styleTag.id = STYLE_TAG_ID;
  documentRef.head.append(styleTag);
  return styleTag;
}

function applyAttributes(element, attributes) {
  if (!attributes) {
    return;
  }

  Object.entries(attributes).forEach(([attributeName, attributeValue]) => {
    if (attributeValue === "") {
      element.removeAttribute(attributeName);
      return;
    }

    element.setAttribute(attributeName, attributeValue);

    // Keep picture/source in sync when overriding image src.
    if (
      attributeName === "src" &&
      element.tagName &&
      element.tagName.toLowerCase() === "img"
    ) {
      const parent = element.parentElement;
      if (
        parent &&
        parent.tagName &&
        parent.tagName.toLowerCase() === "picture"
      ) {
        parent.querySelectorAll("source").forEach((sourceElement) => {
          if (attributeValue === "") {
            sourceElement.removeAttribute("srcset");
          } else {
            sourceElement.setAttribute("srcset", attributeValue);
          }
        });
      }
    }
  });
}

function parseImgSrcSelector(selector) {
  const match = selector.match(/^img\[src="(.*)"\]$/);
  return match ? match[1] : null;
}

function selectOverrideElements(root, selector, override) {
  const originalImgSrc = parseImgSrcSelector(selector);
  if (originalImgSrc == null) {
    return Array.from(root.querySelectorAll(selector));
  }

  const nextSrc = override?.attributes?.src || "";
  return Array.from(root.querySelectorAll("img")).filter((imageElement) => {
    const currentSrc = imageElement.getAttribute("src") || "";
    const markedOriginalSrc =
      imageElement.getAttribute("data-admin-orig-src") || "";
    return (
      currentSrc === originalImgSrc ||
      (nextSrc && currentSrc === nextSrc) ||
      markedOriginalSrc === originalImgSrc
    );
  });
}

export function applyElementOverride(root, selector, override) {
  try {
    const elements = selectOverrideElements(root, selector, override);
    if (!elements.length) {
      return false;
    }

    const originalImgSrc = parseImgSrcSelector(selector);
    elements.forEach((element) => {
      if (override.contentMode === "text") {
        element.textContent = override.content || "";
      }

      if (override.contentMode === "html") {
        element.innerHTML = override.content || "";
      }

      if (
        originalImgSrc &&
        element.tagName &&
        element.tagName.toLowerCase() === "img" &&
        !element.getAttribute("data-admin-orig-src")
      ) {
        element.setAttribute("data-admin-orig-src", originalImgSrc);
      }

      applyAttributes(element, override.attributes);
    });
    return true;
  } catch (error) {
    console.warn(
      `Failed to apply admin override for selector: ${selector}`,
      error,
    );
    return false;
  }
}

export function applyTranslationOverrides(root, state, language) {
  const normalizedState = normalizeAdminState(state);
  const lang =
    language ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("selectedLanguage")
      : null) ||
    "en";
  const scope = root.nodeType === 9 ? root : root;

  Object.entries(normalizedState.translations).forEach(([key, langs]) => {
    if (!langs[lang]) return;
    try {
      const element = scope.querySelector(`[data-key="${key}"]`);
      if (element) {
        element.textContent = langs[lang];
      }
    } catch (error) {
      console.warn(
        `Failed to apply translation override for key: ${key}`,
        error,
      );
    }
  });
}

export function applyAdminOverrides(
  root = document,
  state = loadAdminState(),
  language,
) {
  const normalizedState = normalizeAdminState(state);
  const documentRef = root.nodeType === 9 ? root : root.ownerDocument;
  const scope = root.nodeType === 9 ? root : root;

  const styleTag = ensureStyleTag(documentRef);
  styleTag.textContent = normalizedState.globalCss;

  Object.entries(normalizedState.elements).forEach(([selector, override]) => {
    applyElementOverride(scope, selector, override);
  });

  applyTranslationOverrides(scope, normalizedState, language);

  return normalizedState;
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }

  return value.replace(/([#.;?+<>~:\\[\](){}'"` ])/g, "\\$1");
}

export function buildElementSelector(element) {
  if (!(element instanceof Element)) {
    return "";
  }

  if (element.id) {
    return `#${cssEscape(element.id)}`;
  }

  if (element.hasAttribute("data-key")) {
    return `[data-key="${cssEscape(element.getAttribute("data-key"))}"]`;
  }

  const parts = [];
  let currentElement = element;

  while (
    currentElement &&
    currentElement.tagName &&
    currentElement.tagName.toLowerCase() !== "html"
  ) {
    if (currentElement.id) {
      parts.unshift(`#${cssEscape(currentElement.id)}`);
      break;
    }

    if (currentElement.hasAttribute("data-key")) {
      parts.unshift(
        `[data-key="${cssEscape(currentElement.getAttribute("data-key"))}"]`,
      );
      break;
    }

    let selector = currentElement.tagName.toLowerCase();
    const stableClassName = Array.from(currentElement.classList).find(
      (className) =>
        !className.startsWith("swiper") &&
        !className.startsWith("is-") &&
        !className.startsWith("js-"),
    );

    if (stableClassName) {
      selector += `.${cssEscape(stableClassName)}`;
    }

    if (currentElement.parentElement) {
      const sameTypeSiblings = Array.from(
        currentElement.parentElement.children,
      ).filter((sibling) => sibling.tagName === currentElement.tagName);

      if (sameTypeSiblings.length > 1) {
        selector += `:nth-of-type(${sameTypeSiblings.indexOf(currentElement) +
          1})`;
      }
    }

    parts.unshift(selector);
    currentElement = currentElement.parentElement;
  }

  return parts.join(" > ");
}

function initAdminOverrides() {
  const applyOverrides = async (event) => {
    const runtimeState = await loadRuntimeAdminState();
    const language =
      event?.detail?.language ||
      localStorage.getItem("selectedLanguage") ||
      "en";
    applyAdminOverrides(document, runtimeState, language);
  };

  applyOverrides();
  window.addEventListener("language:updated", applyOverrides);
  window.addEventListener("admin:refresh-overrides", applyOverrides);
}

export default initAdminOverrides;
