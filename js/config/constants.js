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
 * @type {ReadonlyArray<{ id: string, weight: number }>}
 */
export const QUESTIONS = [
  { id: "q1", weight: 1 },
  { id: "q2", weight: 3 },
  { id: "q3", weight: 2 },
  { id: "q4", weight: 2 },
  { id: "q5", weight: 2 },
  { id: "q6", weight: 2 },
  { id: "q7", weight: 2 },
  { id: "q8", weight: 2 },
  { id: "q9", weight: 1 },
  { id: "q10", weight: 3 },
  { id: "q11", weight: 2 },
];

export const ANSWER_VALUES = ["yes", "sometimes", "no"];
