import { test } from "node:test";
import assert from "node:assert/strict";
import { ScoringEngine } from "../js/services/ScoringEngine.js";

const PERCENT_THRESHOLDS = [20, 40, 60, 80, 100];
const questions = [
  { id: "a", weight: 3 },
  { id: "b", weight: 2 },
  { id: "c", weight: 1 },
];

test("scoreAnswer: yes scores full weight, sometimes scores half rounded up, no scores 0", () => {
  const engine = new ScoringEngine(questions, PERCENT_THRESHOLDS);
  assert.equal(engine.scoreAnswer(3, "yes"), 3);
  assert.equal(engine.scoreAnswer(3, "sometimes"), 2);
  assert.equal(engine.scoreAnswer(2, "sometimes"), 1);
  assert.equal(engine.scoreAnswer(3, "no"), 0);
  assert.equal(engine.scoreAnswer(3, "garbage"), 0);
});

test("calculate: sums weighted answers and treats missing answers as 'no'", () => {
  const engine = new ScoringEngine(questions, PERCENT_THRESHOLDS);
  const score = engine.calculate({ a: "yes", b: "sometimes" });
  assert.equal(score, 3 + 1);
});

test("maxScore: derived from the current question set's weights, not a fixed constant", () => {
  const engine = new ScoringEngine(questions, PERCENT_THRESHOLDS);
  assert.equal(engine.maxScore, 6);
  engine.setQuestions([{ id: "z", weight: 1 }]);
  assert.equal(engine.maxScore, 1);
});

test("evaluate: computes score, maxScore, percentage and level together", () => {
  const engine = new ScoringEngine(questions, PERCENT_THRESHOLDS);
  const result = engine.evaluate({ a: "yes", b: "yes", c: "yes" });
  assert.deepEqual(result, { score: 6, maxScore: 6, percentage: 100, level: 5 });
});

test("evaluate: percentage is comparable across question sets of different sizes (Express/Normal/Detallado)", () => {
  const express = [{ id: "a", weight: 3 }, { id: "b", weight: 2 }]; // max 5
  const normal = [
    { id: "a", weight: 3 },
    { id: "b", weight: 3 },
    { id: "c", weight: 2 },
    { id: "d", weight: 2 },
  ]; // max 10, same 3:2 ratio doubled

  const expressResult = new ScoringEngine(express, PERCENT_THRESHOLDS).evaluate({ a: "yes", b: "no" });
  const normalResult = new ScoringEngine(normal, PERCENT_THRESHOLDS).evaluate({
    a: "yes",
    b: "yes",
    c: "no",
    d: "no",
  });

  assert.equal(expressResult.percentage, 60);
  assert.equal(normalResult.percentage, 60);
  assert.equal(expressResult.level, normalResult.level);
});

test("levelFromPercentage: maps percentages to levels at threshold boundaries", () => {
  const engine = new ScoringEngine(questions, PERCENT_THRESHOLDS);
  assert.equal(engine.levelFromPercentage(0), 1);
  assert.equal(engine.levelFromPercentage(20), 1);
  assert.equal(engine.levelFromPercentage(21), 2);
  assert.equal(engine.levelFromPercentage(40), 2);
  assert.equal(engine.levelFromPercentage(41), 3);
  assert.equal(engine.levelFromPercentage(80), 4);
  assert.equal(engine.levelFromPercentage(81), 5);
  assert.equal(engine.levelFromPercentage(100), 5);
});

test("levelFromPercentage: values beyond the last threshold still resolve to the max level", () => {
  const engine = new ScoringEngine(questions, PERCENT_THRESHOLDS);
  assert.equal(engine.levelFromPercentage(999), 5);
});

test("setQuestions: swaps the active question set used by calculate/evaluate", () => {
  const engine = new ScoringEngine(questions, PERCENT_THRESHOLDS);
  engine.setQuestions([{ id: "z", weight: 1 }]);
  assert.equal(engine.questions.length, 1);
  assert.equal(engine.calculate({ z: "yes" }), 1);
});
