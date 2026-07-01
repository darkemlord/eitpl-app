import { MAX_SCORE } from "../config/constants.js";

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

  get maxScore() {
    return MAX_SCORE;
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

  levelFromScore(score) {
    for (let i = 0; i < this.#thresholds.length; i++) {
      if (score <= this.#thresholds[i]) return i + 1;
    }
    return this.#thresholds.length;
  }
}
