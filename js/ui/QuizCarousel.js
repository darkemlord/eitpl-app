const DESKTOP_QUERY = "(min-width: 769px)";
const DESKTOP_BATCH_SIZE = 3;
const MOBILE_BATCH_SIZE = 1;

/**
 * Paginates a question set into steps and delegates card rendering to
 * QuizRenderer (SRP — this only owns pagination state, not markup).
 */
export class QuizCarousel {
  #renderer;
  #questions = [];
  #batchSize = MOBILE_BATCH_SIZE;
  #stepIndex = 0;

  constructor(quizRenderer) {
    this.#renderer = quizRenderer;
  }

  /** Batch size is fixed for the session at init time — no resize recompute. */
  init(questions) {
    this.#questions = questions;
    this.#batchSize = window.matchMedia(DESKTOP_QUERY).matches ? DESKTOP_BATCH_SIZE : MOBILE_BATCH_SIZE;
    this.#stepIndex = 0;
    this.#renderCurrent();
  }

  get totalSteps() {
    return Math.ceil(this.#questions.length / this.#batchSize) || 1;
  }

  /** 1-based, for display. */
  get currentStep() {
    return this.#stepIndex + 1;
  }

  isFirstStep() {
    return this.#stepIndex === 0;
  }

  isLastStep() {
    return this.#stepIndex >= this.totalSteps - 1;
  }

  currentBatch() {
    const start = this.#stepIndex * this.#batchSize;
    return this.#questions.slice(start, start + this.#batchSize);
  }

  next() {
    if (this.isLastStep()) return;
    this.#stepIndex += 1;
    this.#renderCurrent();
  }

  prev() {
    if (this.isFirstStep()) return;
    this.#stepIndex -= 1;
    this.#renderCurrent();
  }

  /** Re-renders the current step (e.g. after a language change). */
  refresh() {
    this.#renderCurrent();
  }

  #renderCurrent() {
    const start = this.#stepIndex * this.#batchSize;
    this.#renderer.setQuestions(this.currentBatch());
    this.#renderer.render(start);
  }
}
