/**
 * Quiz completion progress indicator (SRP).
 */
export class QuizProgressBar {
  #fillEl;
  #labelEl;
  #total;
  #i18n;

  constructor({ fillEl, labelEl, total, translationService }) {
    this.#fillEl = fillEl;
    this.#labelEl = labelEl;
    this.#total = total;
    this.#i18n = translationService;
  }

  update(answeredCount) {
    const pct = Math.min(100, (answeredCount / this.#total) * 100);
    this.#fillEl.style.width = `${pct}%`;
    this.#labelEl.textContent = this.#i18n
      .t("quiz.progress")
      .replace("{n}", String(answeredCount))
      .replace("{total}", String(this.#total));
  }

  reset() {
    this.update(0);
  }
}
