/**
 * Quiz carousel interactions: step validation, navigation, submit (SRP).
 */
export class QuizController {
  #form;
  #hint;
  #submitLabel;
  #prevBtn;
  #validator;
  #scoring;
  #storage;
  #carousel;
  #i18n;
  #onSubmit;
  #onStepChange;

  constructor({
    form,
    hint,
    submitLabel,
    prevBtn,
    validator,
    scoringEngine,
    storageService,
    carousel,
    translationService,
    onSubmit,
    onStepChange,
  }) {
    this.#form = form;
    this.#hint = hint;
    this.#submitLabel = submitLabel;
    this.#prevBtn = prevBtn;
    this.#validator = validator;
    this.#scoring = scoringEngine;
    this.#storage = storageService;
    this.#carousel = carousel;
    this.#i18n = translationService;
    this.#onSubmit = onSubmit;
    this.#onStepChange = onStepChange;
  }

  bind(container) {
    this.#form.addEventListener("submit", (e) => this.#handleSubmit(e));
    container.addEventListener("change", () => this.#handleChange());
    this.#prevBtn.addEventListener("click", () => this.#handlePrev());
  }

  /** Called after the carousel is (re)initialized for a fresh quiz attempt. */
  start() {
    this.#hint.hidden = true;
    this.#validator.clearInvalidMarks();
    this.#refreshStepUi();
  }

  #handleSubmit(e) {
    e.preventDefault();
    const batch = this.#carousel.currentBatch();
    const { answers, allAnswered } = this.#validator.collectFromDom(batch);

    if (!allAnswered) {
      this.#validator.markInvalid(answers);
      this.#hint.hidden = false;
      this.#validator.scrollToFirstInvalid();
      return;
    }

    this.#validator.clearInvalidMarks();
    this.#hint.hidden = true;
    this.#storage.saveAnswers({ ...this.#storage.getAnswers(), ...answers });

    if (!this.#carousel.isLastStep()) {
      this.#carousel.next();
      this.#refreshStepUi();
      this.#scrollToQuiz();
      return;
    }

    const result = this.#scoring.evaluate(this.#storage.getAnswers());
    this.#onSubmit?.({ ...result, submissionId: String(Date.now()) });
  }

  #handlePrev() {
    this.#carousel.prev();
    this.#validator.clearInvalidMarks();
    this.#hint.hidden = true;
    this.#refreshStepUi();
    this.#scrollToQuiz();
  }

  #handleChange() {
    const { answers } = this.#validator.collectFromDom(this.#carousel.currentBatch());
    this.#storage.saveAnswers({ ...this.#storage.getAnswers(), ...answers });
    this.#validator.markInvalid(answers);
  }

  #refreshStepUi() {
    this.#prevBtn.hidden = this.#carousel.isFirstStep();
    const key = this.#carousel.isLastStep() ? "quiz.submit" : "quiz.next";
    this.#submitLabel.dataset.i18n = key;
    this.#submitLabel.textContent = this.#i18n.t(key);
    this.#onStepChange?.(this.#carousel.currentStep, this.#carousel.totalSteps);
  }

  #scrollToQuiz() {
    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
  }
}
