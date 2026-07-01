const VALID_LANGS = ["es", "en", "ja"];
const VALID_MODES = ["express", "normal", "detailed"];

/**
 * Shareable result state in the URL query string (SRP).
 */
export class ResultUrlService {
  #basePath;

  constructor(basePath = window.location.pathname) {
    this.#basePath = basePath;
  }

  parse() {
    const params = new URLSearchParams(window.location.search);
    const level = Number.parseInt(params.get("l"), 10);
    const percentage = Number.parseInt(params.get("s"), 10);
    const lang = params.get("lang");
    const mode = params.get("mode");
    const variantIndex = Number.parseInt(params.get("m"), 10);

    if (!Number.isFinite(level) || !Number.isFinite(percentage)) return null;
    if (level < 1 || level > 5 || percentage < 0 || percentage > 100) return null;

    return {
      level,
      percentage,
      lang: VALID_LANGS.includes(lang) ? lang : null,
      mode: VALID_MODES.includes(mode) ? mode : null,
      ...(Number.isInteger(variantIndex) ? { variantIndex } : {}),
    };
  }

  build(result, lang) {
    const url = new URL(window.location.origin + this.#basePath);
    url.searchParams.set("l", String(result.level));
    url.searchParams.set("s", String(result.percentage));
    url.searchParams.set("lang", lang);
    if (result.mode) url.searchParams.set("mode", result.mode);
    if (Number.isInteger(result.variantIndex)) {
      url.searchParams.set("m", String(result.variantIndex));
    }
    return url.toString();
  }

  sync(result, lang) {
    history.replaceState(null, "", this.build(result, lang));
  }

  clear() {
    history.replaceState(null, "", window.location.pathname);
  }
}
