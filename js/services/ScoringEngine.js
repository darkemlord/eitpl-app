/**
 * Pure scoring logic — no DOM, no i18n (SRP + testable).
 */
export class ScoringEngine {
  #questions;
  #thresholds;

  constructor(questions, thresholds) {
    this.#questions = questions;
    this.#thresholds = thresholds;
  }

  get questions() {
    return this.#questions;
  }

  setQuestions(questions) {
    this.#questions = questions;
  }

  get maxScore() {
    return this.#questions.reduce((sum, q) => sum + q.weight, 0);
  }

  scoreAnswer(weight, value) {
    if (value === "yes") return weight;
    if (value === "sometimes") return Math.ceil(weight / 2);
    return 0;
  }

  calculate(answers) {
    return this.#questions.reduce(
      (sum, q) => sum + this.scoreAnswer(q.weight, answers[q.id] || "no"),
      0
    );
  }

  levelFromPercentage(percentage) {
    for (let i = 0; i < this.#thresholds.length; i++) {
      if (percentage <= this.#thresholds[i]) return i + 1;
    }
    return this.#thresholds.length;
  }

  /** Single entry point: raw score, max possible, percentage and resulting level. */
  evaluate(answers) {
    const score = this.calculate(answers);
    const maxScore = this.maxScore;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    return { score, maxScore, percentage, level: this.levelFromPercentage(percentage) };
  }
}
