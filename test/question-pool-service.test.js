import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { QuestionPoolService } from "../js/services/QuestionPoolService.js";

beforeEach(() => {
  const dom = new JSDOM("<!doctype html><html></html>", { url: "https://example.com/" });
  globalThis.sessionStorage = dom.window.sessionStorage;
});

function weightCounts(questions) {
  return questions.reduce(
    (acc, q) => ({ ...acc, [q.weight]: (acc[q.weight] ?? 0) + 1 }),
    {}
  );
}

test("getSessionQuestions: returns 10 questions with a 4/4/2 severity mix summing to 22", () => {
  const questions = new QuestionPoolService().getSessionQuestions();
  assert.equal(questions.length, 10);
  assert.deepEqual(weightCounts(questions), { 1: 2, 2: 4, 3: 4 });
  assert.equal(questions.reduce((sum, q) => sum + q.weight, 0), 22);
});

test("getSessionQuestions: returns the same set on repeated calls within a session", () => {
  const service = new QuestionPoolService();
  const first = service.getSessionQuestions().map((q) => q.id);
  const second = service.getSessionQuestions().map((q) => q.id);
  assert.deepEqual(first, second);
});

test("getSessionQuestions: no question is pinned by id across sessions", () => {
  const seen = new Set();
  for (let i = 0; i < 15; i++) {
    new QuestionPoolService().getSessionQuestions(true).forEach((q) => seen.add(q.id));
  }
  // With a 100-question pool and fully random picks, 15 sessions of 10 questions
  // each should surface far more than just 10 fixed ids.
  assert.ok(seen.size > 30);
});

test("resetSession: clears the stored session so a new pick is generated", () => {
  const service = new QuestionPoolService();
  service.getSessionQuestions();
  assert.ok(sessionStorage.getItem("eitpl-session-questions"));

  service.resetSession();
  assert.equal(sessionStorage.getItem("eitpl-session-questions"), null);
});
