import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { QuizCarousel } from "../js/ui/QuizCarousel.js";

function setViewport(isDesktop) {
  const dom = new JSDOM("<!doctype html><html></html>", { url: "https://example.com/" });
  dom.window.matchMedia = () => ({ matches: isDesktop });
  globalThis.window = dom.window;
}

function fakeRenderer() {
  const calls = [];
  return {
    calls,
    setQuestions(qs) {
      calls.push({ method: "setQuestions", value: qs });
    },
    render(startIndex) {
      calls.push({ method: "render", value: startIndex });
    },
  };
}

const questions = Array.from({ length: 10 }, (_, i) => ({ id: `q${i + 1}`, weight: 1 }));

test("init: mobile viewport uses a batch size of 1 (one question per step)", () => {
  setViewport(false);
  const carousel = new QuizCarousel(fakeRenderer());
  carousel.init(questions);

  assert.equal(carousel.totalSteps, 10);
  assert.deepEqual(carousel.currentBatch(), [questions[0]]);
});

test("init: desktop viewport uses a batch size of 3 (three questions per step)", () => {
  setViewport(true);
  const carousel = new QuizCarousel(fakeRenderer());
  carousel.init(questions);

  assert.equal(carousel.totalSteps, 4); // ceil(10 / 3)
  assert.deepEqual(carousel.currentBatch(), questions.slice(0, 3));
});

test("next/prev: move between steps and stop at the edges, last step keeps the partial batch", () => {
  const carousel = new QuizCarousel(fakeRenderer());
  setViewport(true);
  carousel.init(questions);

  assert.equal(carousel.isFirstStep(), true);
  carousel.prev(); // no-op at the first step
  assert.equal(carousel.currentStep, 1);

  carousel.next();
  assert.equal(carousel.currentStep, 2);
  assert.deepEqual(carousel.currentBatch(), questions.slice(3, 6));

  carousel.next();
  carousel.next();
  assert.equal(carousel.isLastStep(), true);
  assert.equal(carousel.currentStep, 4);
  assert.deepEqual(carousel.currentBatch(), questions.slice(9, 10));

  carousel.next(); // no-op past the last step
  assert.equal(carousel.currentStep, 4);
});

test("refresh: re-renders the current step without changing position", () => {
  setViewport(false);
  const renderer = fakeRenderer();
  const carousel = new QuizCarousel(renderer);
  carousel.init(questions);
  carousel.next();

  const callsBefore = renderer.calls.length;
  carousel.refresh();
  assert.equal(renderer.calls.length, callsBefore + 2); // setQuestions + render
  assert.equal(carousel.currentStep, 2);
});
