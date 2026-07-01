/**
 * Binds data-i18n attributes and lang switcher UI (SRP).
 */
export class I18nBinder {
  #i18n;

  constructor(translationService) {
    this.#i18n = translationService;
  }

  applyDocument() {
    const lang = this.#i18n.lang;
    document.documentElement.lang = lang;
    document.body.lang = lang;
    document.title = this.#i18n.t("meta.title");
    this.#bindStaticStrings();
    this.#bindLangButtons();
  }

  #bindStaticStrings() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = this.#i18n.t(el.dataset.i18n);
      if (typeof value === "string") el.textContent = value;
    });
  }

  #bindLangButtons() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const active = btn.dataset.lang === this.#i18n.lang;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }
}
