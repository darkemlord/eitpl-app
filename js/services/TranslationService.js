/**
 * i18n lookups and language state (SRP).
 */
export class TranslationService {
  #translations;
  #poolTexts;
  #lang;

  constructor(translations, poolTexts, initialLang) {
    this.#translations = translations;
    this.#poolTexts = poolTexts;
    this.#lang = initialLang;
  }

  get lang() {
    return this.#lang;
  }

  hasLanguage(lang) {
    return Boolean(this.#translations[lang]);
  }

  setLanguage(lang) {
    if (!this.hasLanguage(lang)) return false;
    this.#lang = lang;
    return true;
  }

  /** @param {string} key Dot-separated path, e.g. "quiz.title" */
  t(key) {
    const parts = key.split(".");
    let value = this.#translations[this.#lang];
    for (const part of parts) {
      value = value?.[part];
    }
    return value ?? key;
  }

  severityLabel(weight) {
    const map = this.t("quiz.severity");
    if (weight >= 3) return map[3];
    if (weight >= 2) return map[2];
    return map[1];
  }

  severityTier(weight) {
    if (weight >= 3) return 3;
    if (weight >= 2) return 2;
    return 1;
  }

  questionText(id) {
    return this.#poolTexts[this.#lang]?.[id] ?? id;
  }
}
