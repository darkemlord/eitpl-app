import { test } from "node:test";
import assert from "node:assert/strict";
import { ScoringEngine } from "../js/services/ScoringEngine.js";

const THRESHOLDS = [4, 9, 13, 17, 22];
const questions = [
  { id: "a", weight: 3 },
  { id: "b", weight: 2 },
  { id: "c", weight: 1 },
];

test("scoreAnswer: yes scores full weight, sometimes scores half rounded up, no scores 0", () => {
  const engine = new ScoringEngine(questions, THRESHOLDS);
  assert.equal(engine.scoreAnswer(3, "yes"), 3);
  assert.equal(engine.scoreAnswer(3, "sometimes"), 2);
  assert.equal(engine.scoreAnswer(2, "sometimes"), 1);
  assert.equal(engine.scoreAnswer(3, "no"), 0);
  assert.equal(engine.scoreAnswer(3, "garbage"), 0);
});

test("calculate: sums weighted answers and treats missing answers as 'no'", () => {
  const engine = new ScoringEngine(questions, THRESHOLDS);
  const score = engine.calculate({ a: "yes", b: "sometimes" });
  assert.equal(score, 3 + 1);
});

test("calculate: all yes hits the max score for the question set", () => {
  const engine = new ScoringEngine(questions, THRESHOLDS);
  const score = engine.calculate({ a: "yes", b: "yes", c: "yes" });
  assert.equal(score, 6);
});

test("levelFromScore: maps scores to levels at threshold boundaries", () => {
  const engine = new ScoringEngine(questions, THRESHOLDS);
  assert.equal(engine.levelFromScore(0), 1);
  assert.equal(engine.levelFromScore(4), 1);
  assert.equal(engine.levelFromScore(5), 2);
  assert.equal(engine.levelFromScore(9), 2);
  assert.equal(engine.levelFromScore(10), 3);
  assert.equal(engine.levelFromScore(17), 4);
  assert.equal(engine.levelFromScore(18), 5);
  assert.equal(engine.levelFromScore(22), 5);
});

test("levelFromScore: scores beyond the last threshold still resolve to the max level", () => {
  const engine = new ScoringEngine(questions, THRESHOLDS);
  assert.equal(engine.levelFromScore(999), 5);
});

test("setQuestions: swaps the active question set used by calculate", () => {
  const engine = new ScoringEngine(questions, THRESHOLDS);
  engine.setQuestions([{ id: "z", weight: 1 }]);
  assert.equal(engine.questions.length, 1);
  assert.equal(engine.calculate({ z: "yes" }), 1);
});
