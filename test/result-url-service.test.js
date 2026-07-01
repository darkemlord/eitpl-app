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

test("parse: returns null when level or percentage params are missing", () => {
  setLocation("https://example.com/eitpl-app/");
  assert.equal(new ResultUrlService().parse(), null);
});

test("parse: returns null when level or percentage are out of range", () => {
  setLocation("https://example.com/eitpl-app/?l=6&s=50&lang=es");
  assert.equal(new ResultUrlService().parse(), null);

  setLocation("https://example.com/eitpl-app/?l=3&s=-1&lang=es");
  assert.equal(new ResultUrlService().parse(), null);

  setLocation("https://example.com/eitpl-app/?l=3&s=101&lang=es");
  assert.equal(new ResultUrlService().parse(), null);
});

test("parse: reads valid level/percentage/lang and rejects unsupported languages", () => {
  setLocation("https://example.com/eitpl-app/?l=4&s=78&lang=en");
  assert.deepEqual(new ResultUrlService().parse(), {
    level: 4,
    percentage: 78,
    lang: "en",
    mode: null,
  });

  setLocation("https://example.com/eitpl-app/?l=4&s=78&lang=fr");
  assert.deepEqual(new ResultUrlService().parse(), {
    level: 4,
    percentage: 78,
    lang: null,
    mode: null,
  });
});

test("parse: reads mode when present and rejects unsupported modes", () => {
  setLocation("https://example.com/eitpl-app/?l=4&s=78&lang=en&mode=normal");
  assert.equal(new ResultUrlService().parse().mode, "normal");

  setLocation("https://example.com/eitpl-app/?l=4&s=78&lang=en&mode=bogus");
  assert.equal(new ResultUrlService().parse().mode, null);
});

test("build: encodes level, percentage, lang and mode as query params on the base path", () => {
  setLocation("https://example.com/eitpl-app/");
  const url = new ResultUrlService().build({ level: 5, percentage: 100, mode: "detailed" }, "ja");
  const parsed = new URL(url);

  assert.equal(parsed.pathname, "/eitpl-app/");
  assert.equal(parsed.searchParams.get("l"), "5");
  assert.equal(parsed.searchParams.get("s"), "100");
  assert.equal(parsed.searchParams.get("lang"), "ja");
  assert.equal(parsed.searchParams.get("mode"), "detailed");
});

test("sync then clear: replaces history state and clear removes the query string", () => {
  setLocation("https://example.com/eitpl-app/");
  const service = new ResultUrlService();

  service.sync({ level: 2, percentage: 32, mode: "express" }, "es");
  assert.equal(window.location.search, "?l=2&s=32&lang=es&mode=express");

  service.clear();
  assert.equal(window.location.search, "");
});
