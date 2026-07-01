import { STATS } from "../config/constants.js";

const RECORD_KEY_PREFIX = "eitpl-stats-recorded-";

/** Midpoints of each level band for estimated averages from distribution. */
const LEVEL_SCORE_MIDPOINTS = [2, 7, 11, 15, 20];

/**
 * Fetches public stats and optionally records anonymous completions (SRP).
 */
export class StatsService {
  #publicUrl;
  #ingestUrl;

  constructor() {
    this.#publicUrl = STATS.publicUrl;
    this.#ingestUrl = STATS.ingestUrl;
  }

  async fetch() {
    const response = await fetch(this.#publicUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Stats fetch failed: ${response.status}`);
    return response.json();
  }

  aggregate(data) {
    const byLevel = Array.isArray(data.byLevel) ? data.byLevel : [0, 0, 0, 0, 0];
    const total = data.total ?? byLevel.reduce((sum, count) => sum + count, 0);
    const level4Plus = (byLevel[3] ?? 0) + (byLevel[4] ?? 0);
    const level4PlusPct =
      data.level4PlusPct ?? (total > 0 ? Math.round((level4Plus / total) * 100) : 0);
    const avgScore = data.avgScore ?? this.#weightedAverage(byLevel, total);

    return { total, level4PlusPct, avgScore };
  }

  async record(level, score, submissionId) {
    const dedupeKey = `${RECORD_KEY_PREFIX}${submissionId}`;
    if (sessionStorage.getItem(dedupeKey)) return false;
    if (!this.#ingestUrl) return false;

    await fetch(this.#ingestUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ level, score }),
    });

    sessionStorage.setItem(dedupeKey, "1");
    return true;
  }

  #weightedAverage(byLevel, total) {
    if (!total) return 0;
    const sum = byLevel.reduce(
      (acc, count, index) => acc + count * (LEVEL_SCORE_MIDPOINTS[index] ?? 0),
      0
    );
    return Math.round((sum / total) * 10) / 10;
  }
}
