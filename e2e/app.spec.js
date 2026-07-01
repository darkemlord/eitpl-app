import { test, expect } from "@playwright/test";

const OPTION_LABELS = {
  es: { yes: "Sí", sometimes: "A veces", no: "No" },
  en: { yes: "Yes", sometimes: "Sometimes", no: "No" },
  ja: { yes: "はい", sometimes: "時々", no: "いいえ" },
};

async function answerAllQuestions(page, value = "sometimes", lang = "es") {
  const label = OPTION_LABELS[lang][value];
  const cards = page.locator(".question-card");
  const count = await cards.count();

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    await card.getByText(label, { exact: true }).click();
  }
}

test.describe("EITPL smoke e2e", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload();
  });

  test("homepage loads with hero, stats, and 10 quiz questions", async ({ page }) => {
    await expect(page).toHaveTitle(/EITPL/i);
    await expect(page.locator("#hero-stats")).toBeVisible();
    await expect(page.locator("[data-stat='total']")).not.toHaveText("—");

    await page.locator("#btn-start").click();
    await expect(page.locator("#quiz")).toBeInViewport();

    const cards = page.locator(".question-card");
    await expect(cards).toHaveCount(10);

    for (const card of await cards.all()) {
      await expect(card.locator(".question-text")).not.toBeEmpty();
      await expect(card.locator('input[type="radio"]')).toHaveCount(3);
    }
  });

  test("submit without answers shows hint", async ({ page }) => {
    await page.locator("#btn-submit").click();
    const hint = page.locator("#quiz-hint");
    await expect(hint).toBeVisible();
    await expect(page.locator(".question-card.invalid").first()).toBeVisible();
    await expect(page.locator("#result")).toBeHidden();
  });

  test("full quiz flow shows result and updates URL", async ({ page }) => {
    await page.locator("#btn-start").click();

    await expect(page.locator(".question-card")).toHaveCount(10);
    await answerAllQuestions(page, "sometimes");

    await page.locator("#btn-submit").scrollIntoViewIfNeeded();
    await page.locator("#btn-submit").click();

    const result = page.locator("#result");
    await expect(result).toBeVisible();
    await expect(page.locator("#result-score-value")).not.toHaveText("0");
    await expect(page.locator("#result-level")).not.toBeEmpty();
    await expect(page.locator("#result-name")).not.toBeEmpty();

    const url = new URL(page.url());
    expect(url.searchParams.get("l")).toBeTruthy();
    expect(url.searchParams.get("s")).toBeTruthy();
    expect(url.searchParams.get("lang")).toBe("es");
  });

  test("session always keeps a 4/4/2 severity mix, with varying questions", async ({ page }) => {
    const seenAcrossRuns = new Set();

    for (let run = 0; run < 3; run++) {
      await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.clear();
      });
      await page.reload();
      await page.locator("#btn-start").click();

      const [grave, moderado, leve] = await Promise.all([
        page.locator(".severity-badge--3").count(),
        page.locator(".severity-badge--2").count(),
        page.locator(".severity-badge--1").count(),
      ]);
      expect(grave).toBe(4);
      expect(moderado).toBe(4);
      expect(leve).toBe(2);

      const texts = await page.locator(".question-text").allTextContents();
      texts.forEach((t) => seenAcrossRuns.add(t));
    }

    // With no fixed anchor questions, 3 sessions should surface more than 10 distinct questions.
    expect(seenAcrossRuns.size).toBeGreaterThan(10);
  });

  test("retry resets quiz with 10 new random questions", async ({ page }) => {
    await page.locator("#btn-start").click();
    await answerAllQuestions(page, "yes");
    await page.locator("#btn-submit").scrollIntoViewIfNeeded();
    await page.locator("#btn-submit").click();
    await expect(page.locator("#result")).toBeVisible();

    const before = await page.locator(".question-text").allTextContents();

    await page.locator("#btn-retry").click();
    await expect(page.locator("#result")).toBeHidden();
    await expect(page.locator(".question-card")).toHaveCount(10);

    const after = await page.locator(".question-text").allTextContents();
    expect(after.length).toBe(10);
    expect(after.some((t, i) => t !== before[i])).toBeTruthy();
  });

  test("language switch updates UI", async ({ page }) => {
    await page.locator('.lang-btn[data-lang="en"]').click();
    await expect(page.locator("#btn-start")).toHaveText(/Take the diagnosis/i);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.locator('.lang-btn[data-lang="ja"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  });

  test("shared result URL restores result view", async ({ page }) => {
    await page.goto("/?l=4&s=16&lang=es");
    await expect(page.locator("#result")).toBeVisible();
    await expect(page.locator("#result-score-value")).toHaveText("16");
    await expect(page.locator("#result-shared-banner")).toBeVisible();
    await expect(page.locator("#result-name")).not.toBeEmpty();
  });

  test("progress bar updates when answering", async ({ page }) => {
    await page.locator("#btn-start").click();
    await expect(page.locator("#quiz-progress-label")).toContainText("0 de 10");

    const first = page.locator(".question-card").first();
    await first.scrollIntoViewIfNeeded();
    await first.getByText("No", { exact: true }).click();
    await expect(page.locator("#quiz-progress-label")).toContainText("1 de 10");
  });
});
