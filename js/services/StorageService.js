import { STORAGE_KEYS } from "../config/constants.js";

/**
 * Persistence abstraction (DIP — callers depend on this, not raw Web Storage).
 */
export class StorageService {
  #langKey;
  #answersKey;

  constructor(langKey = STORAGE_KEYS.LANG, answersKey = STORAGE_KEYS.ANSWERS) {
    this.#langKey = langKey;
    this.#answersKey = answersKey;
  }

  getLanguage(defaultLang = "es") {
    return localStorage.getItem(this.#langKey) || defaultLang;
  }

  setLanguage(lang) {
    localStorage.setItem(this.#langKey, lang);
  }

  getAnswers() {
    try {
      return JSON.parse(sessionStorage.getItem(this.#answersKey) || "{}");
    } catch {
      return {};
    }
  }

  saveAnswers(answers) {
    sessionStorage.setItem(this.#answersKey, JSON.stringify(answers));
  }

  clearAnswers() {
    sessionStorage.removeItem(this.#answersKey);
  }
}
