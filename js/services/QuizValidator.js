/**
 * Collects and validates quiz answers from the DOM (SRP).
 */
export class QuizValidator {
  #questions;

  constructor(questions) {
    this.#questions = questions;
  }

  collectFromDom() {
    const answers = {};
    let allAnswered = true;

    for (const q of this.#questions) {
      const selected = document.querySelector(`input[name="${q.id}"]:checked`);
      if (!selected) {
        allAnswered = false;
      } else {
        answers[q.id] = selected.value;
      }
    }

    return { answers, allAnswered };
  }

  markInvalid(answers) {
    document.querySelectorAll(".question-card").forEach((card) => {
      const qId = card.dataset.question;
      const missing = !answers[qId];
      card.classList.toggle("invalid", missing);
      card.classList.toggle("unanswered", missing);
    });
  }

  clearInvalidMarks() {
    document.querySelectorAll(".question-card").forEach((card) => {
      card.classList.remove("invalid", "unanswered");
    });
  }

  scrollToFirstInvalid() {
    document
      .querySelector(".question-card.invalid")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
