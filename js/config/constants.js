/** @readonly */
export const STORAGE_KEYS = {
  LANG: "eitpl-lang",
  ANSWERS: "eitpl-answers",
};

export const MAX_SCORE = 22;

/** Level N if score <= THRESHOLDS[N - 1] */
export const THRESHOLDS = [4, 9, 13, 17, MAX_SCORE];

export const LEVELS = [
  { id: 1, color: "#22c55e" },
  { id: 2, color: "#eab308" },
  { id: 3, color: "#f59e0b" },
  { id: 4, color: "#f97316" },
  { id: 5, color: "#7f1d1d" },
];

/**
 * Weights: yes = weight, sometimes = ceil(weight / 2), no = 0
 * Question pool lives in js/config/pool/ (100 items, 10 per session).
 */
export const ANSWER_VALUES = ["yes", "sometimes", "no"];

/** Live stats — see scripts/stats-ingest.gs for optional Google Apps Script ingest. */
export const STATS = {
  publicUrl: "data/stats.json",
  ingestUrl: "",
  refreshMs: 60_000,
  plausibleDomain: "",
};
