const VALID_LANGS = ["es", "en", "ja"];

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
    const score = Number.parseInt(params.get("s"), 10);
    const lang = params.get("lang");
    const variantIndex = Number.parseInt(params.get("m"), 10);

    if (!Number.isFinite(level) || !Number.isFinite(score)) return null;
    if (level < 1 || level > 5 || score < 0 || score > 22) return null;

    return {
      level,
      score,
      lang: VALID_LANGS.includes(lang) ? lang : null,
      ...(Number.isInteger(variantIndex) ? { variantIndex } : {}),
    };
  }

  build(result, lang) {
    const url = new URL(window.location.origin + this.#basePath);
    url.searchParams.set("l", String(result.level));
    url.searchParams.set("s", String(result.score));
    url.searchParams.set("lang", lang);
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
