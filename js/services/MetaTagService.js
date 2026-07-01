/**
 * Updates document + Open Graph meta tags (SRP).
 */
export class MetaTagService {
  #assetBase;

  constructor() {
    this.#assetBase = new URL(".", window.location.href).href;
  }

  setDefault(i18n) {
    document.title = i18n.t("meta.title");
    this.#set("description", i18n.t("meta.description"));
    this.#set("og:title", i18n.t("meta.title"), "property");
    this.#set("og:description", i18n.t("meta.ogDescription"), "property");
    this.#set("og:image", this.#ogImage(0), "property");
    this.#set("twitter:card", "summary_large_image");
    this.#set("twitter:title", i18n.t("meta.title"));
    this.#set("twitter:description", i18n.t("meta.ogDescription"));
    this.#set("twitter:image", this.#ogImage(0));
  }

  setForResult(result, i18n) {
    const title = `${i18n.t("meta.titleShort")} — ${i18n.t("levels.colLevel")} ${result.level}: ${result.name}`;

    document.title = title;
    this.#set("description", result.message);
    this.#set("og:title", title, "property");
    this.#set("og:description", result.message, "property");
    this.#set("og:image", this.#ogImage(result.level), "property");
    this.#set("twitter:title", title);
    this.#set("twitter:description", result.message);
    this.#set("twitter:image", this.#ogImage(result.level));
  }

  #ogImage(level) {
    const file = level > 0 ? `level-${level}.png` : "default.png";
    return new URL(`assets/og/${file}`, this.#assetBase).href;
  }

  #set(name, content, attr = "name") {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }
}
