/**
 * Quiz form interactions: submit, validate, persist (SRP).
 */
export class QuizController {
  #form;
  #hint;
  #validator;
  #scoring;
  #storage;
  #resultView;
  #quizRenderer;
  #onSubmit;
  #onChange;

  constructor({
    form,
    hint,
    validator,
    scoringEngine,
    storageService,
    resultView,
    quizRenderer,
    onSubmit,
    onChange,
  }) {
    this.#form = form;
    this.#hint = hint;
    this.#validator = validator;
    this.#scoring = scoringEngine;
    this.#storage = storageService;
    this.#resultView = resultView;
    this.#quizRenderer = quizRenderer;
    this.#onSubmit = onSubmit;
    this.#onChange = onChange;
  }

  bind(container) {
    this.#form.addEventListener("submit", (e) => this.#handleSubmit(e));
    container.addEventListener("change", () => this.#handleChange());
  }

  retry() {
    this.#resultView.hide();
    this.#storage.clearAnswers();
    this.#quizRenderer.render();
    this.#validator.clearInvalidMarks();
    this.#hint.hidden = true;
    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
  }

  #handleSubmit(e) {
    e.preventDefault();
    const { answers, allAnswered } = this.#validator.collectFromDom();

    if (!allAnswered) {
      this.#validator.markInvalid(answers);
      this.#hint.hidden = false;
      this.#validator.scrollToFirstInvalid();
      return;
    }

    this.#validator.clearInvalidMarks();
    this.#hint.hidden = true;
    this.#storage.saveAnswers(answers);

    const score = this.#scoring.calculate(answers);
    const level = this.#scoring.levelFromScore(score);
    this.#onSubmit?.({ score, level, answers, submissionId: String(Date.now()) });
  }

  #handleChange() {
    const { answers } = this.#validator.collectFromDom();
    this.#storage.saveAnswers(answers);
    this.#validator.markInvalid(answers);
    this.#onChange?.(Object.keys(answers).length);

    if (Object.keys(answers).length === this.#scoring.questions.length) {
      this.#hint.hidden = true;
    }
  }
}
