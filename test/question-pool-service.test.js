import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { QuestionPoolService } from "../js/services/QuestionPoolService.js";
import { QUIZ_MODES } from "../js/config/pool/meta.js";

beforeEach(() => {
  const dom = new JSDOM("<!doctype html><html></html>", { url: "https://example.com/" });
  globalThis.sessionStorage = dom.window.sessionStorage;
});

function weightCounts(questions) {
  return questions.reduce((acc, q) => ({ ...acc, [q.weight]: (acc[q.weight] ?? 0) + 1 }), {});
}

for (const mode of Object.keys(QUIZ_MODES)) {
  const { length } = QUIZ_MODES[mode];
  const unit = length / 10;

  test(`getSessionQuestions(${mode}): returns ${length} questions with a balanced severity mix`, () => {
    const questions = new QuestionPoolService().getSessionQuestions(mode);
    assert.equal(questions.length, length);
    assert.deepEqual(weightCounts(questions), { 1: 2 * unit, 2: 4 * unit, 3: 4 * unit });
    assert.equal(questions.reduce((sum, q) => sum + q.weight, 0), 22 * unit);
  });
}

test("getSessionQuestions: returns the same set on repeated calls within a session", () => {
  const service = new QuestionPoolService();
  const first = service.getSessionQuestions("express").map((q) => q.id);
  const second = service.getSessionQuestions("express").map((q) => q.id);
  assert.deepEqual(first, second);
});

test("getSessionQuestions: switching modes mid-session replaces the previous pick", () => {
  const service = new QuestionPoolService();
  service.getSessionQuestions("express");
  const normalQuestions = service.getSessionQuestions("normal");
  assert.equal(normalQuestions.length, 20);
  assert.equal(service.getStoredMode(), "normal");
});

test("getSessionQuestions: no question is pinned by id across sessions", () => {
  const seen = new Set();
  for (let i = 0; i < 15; i++) {
    new QuestionPoolService().getSessionQuestions("express", true).forEach((q) => seen.add(q.id));
  }
  // With a 100-question pool and fully random picks, 15 sessions of 10 questions
  // each should surface far more than just 10 fixed ids.
  assert.ok(seen.size > 30);
});

test("getStoredMode: null before any session is started, set after picking one", () => {
  const service = new QuestionPoolService();
  assert.equal(service.getStoredMode(), null);
  service.getSessionQuestions("detailed");
  assert.equal(service.getStoredMode(), "detailed");
});

test("resetSession: clears the stored session so a new pick is generated", () => {
  const service = new QuestionPoolService();
  service.getSessionQuestions("express");
  assert.ok(sessionStorage.getItem("eitpl-session-questions"));

  service.resetSession();
  assert.equal(sessionStorage.getItem("eitpl-session-questions"), null);
  assert.equal(service.getStoredMode(), null);
});
