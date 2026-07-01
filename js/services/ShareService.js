/**
 * Native share, WhatsApp, clipboard (SRP).
 */
export class ShareService {
  #i18n;
  #feedbackEl;
  #resultUrl;

  constructor(translationService, feedbackEl, resultUrlService) {
    this.#i18n = translationService;
    this.#feedbackEl = feedbackEl;
    this.#resultUrl = resultUrlService;
  }

  buildText(result, lang) {
    if (!result) return "";
    const url = this.#resultUrl.build(result, lang);
    return this.#i18n
      .t("result.shareTemplate")
      .replace("{level}", result.level)
      .replace("{name}", result.name)
      .replace("{message}", result.message)
      .replace("{url}", url);
  }

  async share(result, lang) {
    const text = this.buildText(result, lang);
    if (!text) return;

    if (navigator.share) {
      try {
        await navigator.share({ text, title: this.#i18n.t("meta.title") });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    await this.#copyToClipboard(text);
  }

  shareWhatsApp(result, lang) {
    const text = this.buildText(result, lang);
    if (!text) return;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async #copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.#showFeedback(this.#i18n.t("result.copied"));
    } catch {
      this.#showFeedback(text);
    }
  }

  #showFeedback(message) {
    this.#feedbackEl.textContent = message;
    this.#feedbackEl.hidden = false;
  }

  hideFeedback() {
    this.#feedbackEl.hidden = true;
    this.#feedbackEl.textContent = this.#i18n.t("result.copied");
  }
}
