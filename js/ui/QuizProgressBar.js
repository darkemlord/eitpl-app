/**
 * Quiz carousel step indicator (SRP).
 */
export class QuizProgressBar {
  #fillEl;
  #labelEl;
  #i18n;

  constructor({ fillEl, labelEl, translationService }) {
    this.#fillEl = fillEl;
    this.#labelEl = labelEl;
    this.#i18n = translationService;
  }

  /** @param {number} currentStep 1-based current step @param {number} totalSteps */
  update(currentStep, totalSteps) {
    const pct = totalSteps > 0 ? Math.min(100, (currentStep / totalSteps) * 100) : 0;
    this.#fillEl.style.width = `${pct}%`;
    this.#labelEl.textContent = this.#i18n
      .t("quiz.progress")
      .replace("{n}", String(currentStep))
      .replace("{total}", String(totalSteps));
  }
}
