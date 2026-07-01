import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { QuizValidator } from "../js/services/QuizValidator.js";

const QUESTIONS = [{ id: "q001" }, { id: "q002" }, { id: "q003" }];

function questionCard(id, checkedValue) {
  const options = ["yes", "sometimes", "no"]
    .map((value) => {
      const checked = value === checkedValue ? "checked" : "";
      return `<input type="radio" name="${id}" value="${value}" ${checked}>`;
    })
    .join("");
  return `<div class="question-card" data-question="${id}">${options}</div>`;
}

function mountQuestions(answers) {
  const html = QUESTIONS.map((q) => questionCard(q.id, answers[q.id])).join("");
  const dom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`);
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
}

beforeEach(() => {
  mountQuestions({ q001: "yes", q002: "sometimes", q003: "no" });
});

test("collectFromDom: reads the checked value for every answered question", () => {
  const { answers, allAnswered } = new QuizValidator(QUESTIONS).collectFromDom();
  assert.deepEqual(answers, { q001: "yes", q002: "sometimes", q003: "no" });
  assert.equal(allAnswered, true);
});

test("collectFromDom: flags allAnswered false and omits unanswered questions", () => {
  mountQuestions({ q001: "yes", q003: "no" });
  const { answers, allAnswered } = new QuizValidator(QUESTIONS).collectFromDom();
  assert.deepEqual(answers, { q001: "yes", q003: "no" });
  assert.equal(allAnswered, false);
});

test("collectFromDom: scoping to a subset validates only those questions (carousel batch), ignoring the rest of the session", () => {
  // Only q002's card is mounted, simulating a carousel step showing one question
  // out of a larger session — the other two questions simply aren't in the DOM.
  const dom = new JSDOM(`<!doctype html><html><body>${questionCard("q002", "yes")}</body></html>`);
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;

  const validator = new QuizValidator(QUESTIONS);
  const { answers, allAnswered } = validator.collectFromDom([QUESTIONS[1]]);

  assert.deepEqual(answers, { q002: "yes" });
  assert.equal(allAnswered, true);
});

test("markInvalid: toggles invalid/unanswered only on cards missing an answer", () => {
  mountQuestions({ q001: "yes" });
  const validator = new QuizValidator(QUESTIONS);
  const { answers } = validator.collectFromDom();
  validator.markInvalid(answers);

  const cards = [...document.querySelectorAll(".question-card")];
  const byId = Object.fromEntries(cards.map((c) => [c.dataset.question, c]));

  assert.equal(byId.q001.classList.contains("invalid"), false);
  assert.equal(byId.q002.classList.contains("invalid"), true);
  assert.equal(byId.q003.classList.contains("invalid"), true);
});

test("clearInvalidMarks: removes invalid/unanswered classes from all cards", () => {
  mountQuestions({ q001: "yes" });
  const validator = new QuizValidator(QUESTIONS);
  const { answers } = validator.collectFromDom();
  validator.markInvalid(answers);
  validator.clearInvalidMarks();

  const stillMarked = document.querySelectorAll(".question-card.invalid, .question-card.unanswered");
  assert.equal(stillMarked.length, 0);
});

test("scrollToFirstInvalid: scrolls the first invalid card into view without throwing", () => {
  mountQuestions({ q002: "yes" });
  const validator = new QuizValidator(QUESTIONS);
  const { answers } = validator.collectFromDom();
  validator.markInvalid(answers);

  const firstInvalid = document.querySelector(".question-card.invalid");
  let scrolled = false;
  firstInvalid.scrollIntoView = () => {
    scrolled = true;
  };

  validator.scrollToFirstInvalid();
  assert.equal(scrolled, true);
});
