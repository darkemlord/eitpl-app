import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { ResultUrlService } from "../js/services/ResultUrlService.js";

function setLocation(url) {
  const dom = new JSDOM("<!doctype html><html></html>", { url });
  globalThis.window = dom.window;
  globalThis.history = dom.window.history;
}

beforeEach(() => {
  setLocation("https://example.com/eitpl-app/");
});

test("parse: returns null when level or score params are missing", () => {
  setLocation("https://example.com/eitpl-app/");
  assert.equal(new ResultUrlService().parse(), null);
});

test("parse: returns null when level or score are out of range", () => {
  setLocation("https://example.com/eitpl-app/?l=6&s=10&lang=es");
  assert.equal(new ResultUrlService().parse(), null);

  setLocation("https://example.com/eitpl-app/?l=3&s=-1&lang=es");
  assert.equal(new ResultUrlService().parse(), null);
});

test("parse: reads valid level/score/lang and rejects unsupported languages", () => {
  setLocation("https://example.com/eitpl-app/?l=4&s=16&lang=en");
  assert.deepEqual(new ResultUrlService().parse(), { level: 4, score: 16, lang: "en" });

  setLocation("https://example.com/eitpl-app/?l=4&s=16&lang=fr");
  assert.deepEqual(new ResultUrlService().parse(), { level: 4, score: 16, lang: null });
});

test("build: encodes level, score and lang as query params on the base path", () => {
  setLocation("https://example.com/eitpl-app/");
  const url = new ResultUrlService().build({ level: 5, score: 22 }, "ja");
  const parsed = new URL(url);

  assert.equal(parsed.pathname, "/eitpl-app/");
  assert.equal(parsed.searchParams.get("l"), "5");
  assert.equal(parsed.searchParams.get("s"), "22");
  assert.equal(parsed.searchParams.get("lang"), "ja");
});

test("sync then clear: replaces history state and clear removes the query string", () => {
  setLocation("https://example.com/eitpl-app/");
  const service = new ResultUrlService();

  service.sync({ level: 2, score: 7 }, "es");
  assert.equal(window.location.search, "?l=2&s=7&lang=es");

  service.clear();
  assert.equal(window.location.search, "");
});
