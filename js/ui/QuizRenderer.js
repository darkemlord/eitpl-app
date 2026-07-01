import { ANSWER_VALUES } from "../config/constants.js";

/**
 * Renders quiz question cards (SRP).
 */
export class QuizRenderer {
  #container;
  #questions;
  #i18n;
  #storage;

  constructor(container, questions, translationService, storageService) {
    this.#container = container;
    this.#questions = questions;
    this.#i18n = translationService;
    this.#storage = storageService;
  }

  setQuestions(questions) {
    this.#questions = questions;
  }

  render(startIndex = 0) {
    const opts = this.#i18n.t("quiz.options");
    const saved = this.#storage.getAnswers();

    this.#container.innerHTML = "";

    this.#questions.forEach((q, i) => {
      const tier = this.#i18n.severityTier(q.weight);
      const card = document.createElement("div");
      card.className = "question-card card-surface";
      card.dataset.question = q.id;

      card.innerHTML = `
        <div class="question-row">
          <div class="question-number" aria-hidden="true">${this.#padNum(startIndex + i + 1)}</div>
          <div class="question-body">
            <span class="severity-badge severity-badge--${tier}">
              ${this.#i18n.t("quiz.severityPrefix")} ${this.#i18n.severityLabel(q.weight)}
            </span>
            <p class="question-text" id="${q.id}-label">${this.#i18n.questionText(q.id)}</p>
          </div>
          <div class="options-group" role="radiogroup" aria-labelledby="${q.id}-label"></div>
        </div>
      `;

      const group = card.querySelector(".options-group");
      ANSWER_VALUES.forEach((value) => {
        group.appendChild(this.#createOption(q.id, value, opts[value], saved[q.id] === value));
      });

      this.#container.appendChild(card);
    });
  }

  #padNum(n) {
    return String(n).padStart(2, "0");
  }

  #createOption(questionId, value, label, checked) {
    const id = `${questionId}-${value}`;
    const labelEl = document.createElement("label");
    labelEl.className = "option-label";
    labelEl.innerHTML = `
      <input type="radio" name="${questionId}" id="${id}" value="${value}" ${checked ? "checked" : ""}>
      <span class="option-pill">${label}</span>
    `;
    return labelEl;
  }
}
