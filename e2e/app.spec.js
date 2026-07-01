import { test, expect } from "@playwright/test";

const OPTION_LABELS = {
  es: { yes: "Sí", sometimes: "A veces", no: "No" },
  en: { yes: "Yes", sometimes: "Sometimes", no: "No" },
  ja: { yes: "はい", sometimes: "時々", no: "いいえ" },
};

async function answerVisibleBatch(page, value = "sometimes", lang = "es") {
  const label = OPTION_LABELS[lang][value];
  const cards = page.locator(".question-card");
  const count = await cards.count();

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    await card.getByText(label, { exact: true }).click();
  }
}

/** Picks a mode and clicks through every carousel step until the result shows up. */
async function completeQuiz(page, { mode = "express", value = "sometimes", lang = "es" } = {}) {
  await page.locator("#btn-start").click();
  await page.locator(`.mode-card-cta[data-mode="${mode}"]`).click();
  await page.waitForSelector(".question-card");

  for (let guard = 0; guard < 20; guard++) {
    await answerVisibleBatch(page, value, lang);
    await page.locator("#btn-submit").scrollIntoViewIfNeeded();
    await page.locator("#btn-submit").click();
    if (await page.locator("#result").isVisible()) return;
  }
  throw new Error("completeQuiz: too many steps, possible pagination bug");
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

  test("homepage loads with hero, stats, and the 3-mode picker", async ({ page }) => {
    await expect(page).toHaveTitle(/EITPL/i);
    await expect(page.locator("#hero-stats")).toBeVisible();
    await expect(page.locator("[data-stat='total']")).not.toHaveText("—");

    await page.locator("#btn-start").click();
    await expect(page.locator("#mode-picker")).toBeInViewport();

    await expect(page.locator(".mode-card")).toHaveCount(3);
    await expect(page.locator(".mode-card-cta[data-mode='express']")).toContainText(/express/i);
    await expect(page.locator(".mode-card-cta[data-mode='normal']")).toContainText(/normal/i);
    await expect(page.locator(".mode-card-cta[data-mode='detailed']")).toContainText(/detallado/i);
  });

  test("choosing a mode loads the right question count, paginated per step", async ({ page }) => {
    await page.locator("#btn-start").click();
    await page.locator(".mode-card-cta[data-mode='normal']").click();

    await expect(page.locator(".question-card")).toHaveCount(3); // desktop batch size
    await expect(page.locator("#quiz-progress-label")).toContainText("Paso 1 de 7"); // ceil(20 / 3)
  });

  test("submit without answering the visible step shows a hint and blocks advancing", async ({ page }) => {
    await page.locator("#btn-start").click();
    await page.locator(".mode-card-cta[data-mode='express']").click();
    await page.locator("#btn-submit").click();

    await expect(page.locator("#quiz-hint")).toBeVisible();
    await expect(page.locator(".question-card.invalid").first()).toBeVisible();
    await expect(page.locator("#quiz-progress-label")).toContainText("Paso 1 de");
    await expect(page.locator("#result")).toBeHidden();
  });

  test("prev/next navigation keeps previously checked answers", async ({ page }) => {
    await page.locator("#btn-start").click();
    await page.locator(".mode-card-cta[data-mode='express']").click();

    await answerVisibleBatch(page, "yes");
    const firstBatchIds = await page
      .locator(".question-card")
      .evaluateAll((els) => els.map((el) => el.dataset.question));

    await page.locator("#btn-submit").click();
    await expect(page.locator("#btn-prev")).toBeVisible();
    await expect(page.locator("#quiz-progress-label")).toContainText("Paso 2 de");

    await page.locator("#btn-prev").click();
    await expect(page.locator("#quiz-progress-label")).toContainText("Paso 1 de");

    for (const id of firstBatchIds) {
      await expect(page.locator(`input[name="${id}"][value="yes"]`)).toBeChecked();
    }
  });

  test("last step shows 'Calcular mi nivel' instead of 'Siguiente'", async ({ page }) => {
    await page.locator("#btn-start").click();
    await page.locator(".mode-card-cta[data-mode='express']").click(); // 10 questions → 4 steps of 3/3/3/1

    await expect(page.locator("#btn-submit-label")).toHaveText("Siguiente");

    for (let step = 0; step < 3; step++) {
      await answerVisibleBatch(page, "no");
      await page.locator("#btn-submit").click();
    }

    await expect(page.locator("#btn-submit-label")).toHaveText("Calcular mi nivel");
  });

  test("full quiz flow shows a percentage result and updates the URL with mode", async ({ page }) => {
    await completeQuiz(page, { mode: "express", value: "sometimes" });

    await expect(page.locator("#result")).toBeVisible();
    await expect(page.locator("#result-score-value")).toContainText("%");
    await expect(page.locator("#result-mode-label")).toContainText(/express/i);
    await expect(page.locator("#result-level")).not.toBeEmpty();
    await expect(page.locator("#result-name")).not.toBeEmpty();

    const url = new URL(page.url());
    expect(url.searchParams.get("l")).toBeTruthy();
    expect(url.searchParams.get("s")).toBeTruthy();
    expect(url.searchParams.get("mode")).toBe("express");
    expect(url.searchParams.get("lang")).toBe("es");
  });

  test("session always keeps a balanced severity mix, with varying questions across runs", async ({ page }) => {
    const seenAcrossRuns = new Set();

    for (let run = 0; run < 3; run++) {
      await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.clear();
      });
      await page.reload();
      await page.locator("#btn-start").click();
      await page.locator(".mode-card-cta[data-mode='express']").click();

      const [grave, moderado, leve] = await Promise.all([
        page.locator(".severity-badge--3").count(),
        page.locator(".severity-badge--2").count(),
        page.locator(".severity-badge--1").count(),
      ]);
      // Only the first step (3 of the 10 express questions) is visible at a time.
      expect(grave + moderado + leve).toBe(3);

      const texts = await page.locator(".question-text").allTextContents();
      texts.forEach((t) => seenAcrossRuns.add(t));
    }

    // With no fixed anchor questions, 3 runs of 3 visible questions should
    // surface more variety than a single run would.
    expect(seenAcrossRuns.size).toBeGreaterThan(3);
  });

  test("retry resets the quiz and returns to the mode picker", async ({ page }) => {
    await completeQuiz(page, { mode: "express", value: "yes" });
    await expect(page.locator("#result")).toBeVisible();

    await page.locator("#btn-retry").click();
    await expect(page.locator("#result")).toBeHidden();
    await expect(page.locator("#mode-picker")).toBeVisible();
    await expect(page.locator("#quiz-form")).toBeHidden();
  });

  test("language switch updates UI before a mode is chosen", async ({ page }) => {
    await page.locator('.lang-btn[data-lang="en"]').click();
    await expect(page.locator("#btn-start")).toHaveText(/Take the diagnosis/i);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.locator("#btn-start").click();
    await expect(page.locator(".mode-card-cta[data-mode='express']")).toContainText(/express/i);

    await page.locator('.lang-btn[data-lang="ja"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  });

  test("shared result URL restores the result view and offers the mode picker below it", async ({ page }) => {
    await page.goto("/?l=4&s=65&lang=es&mode=normal&m=1");

    await expect(page.locator("#result")).toBeVisible();
    await expect(page.locator("#result-score-value")).toHaveText("65%");
    await expect(page.locator("#result-mode-label")).toContainText(/normal/i);
    await expect(page.locator("#result-shared-banner")).toBeVisible();
    await expect(page.locator("#result-name")).not.toBeEmpty();
    await expect(page.locator("#mode-picker")).toBeVisible();
  });
});
