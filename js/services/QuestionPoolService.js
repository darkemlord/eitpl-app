import { QUESTION_POOL, QUIZ_MODES, buildSeverityMix } from "../config/pool/meta.js";

const STORAGE_KEY = "eitpl-session-questions";

/**
 * Picks a fresh stratified-random set of questions for one quiz session (SRP).
 * No question is ever pinned by ID — the severity mix (weight distribution)
 * stays constant across sessions of the same mode, so every diagnosis is
 * comparable to others taken in that mode.
 */
export class QuestionPoolService {
  #poolById;

  constructor(pool = QUESTION_POOL) {
    this.#poolById = new Map(pool.map((q) => [q.id, q]));
  }

  getStoredMode() {
    return this.#readStored()?.mode ?? null;
  }

  getSessionQuestions(mode, forceNew = false) {
    const length = QUIZ_MODES[mode].length;

    if (!forceNew) {
      const saved = this.#readStored();
      if (saved?.mode === mode && saved.ids?.length === length) {
        const questions = saved.ids.map((id) => this.#poolById.get(id)).filter(Boolean);
        if (questions.length === length) return questions;
      }
    }

    const selected = this.#pickQuestions(length);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, ids: selected.map((q) => q.id) }));
    return selected;
  }

  resetSession() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  #readStored() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  #pickQuestions(length) {
    const budget = buildSeverityMix(length).reduce((sum, w) => sum + w, 0);

    for (let attempt = 0; attempt < 50; attempt++) {
      const picked = this.#pickBySlots(length, budget);
      if (picked) return this.#shuffle(picked);
    }

    return this.#fallback(length);
  }

  #pickBySlots(length, budget) {
    const slots = this.#shuffle(buildSeverityMix(length));
    const picked = [];
    const used = new Set();

    for (const weight of slots) {
      const options = QUESTION_POOL.filter((q) => q.weight === weight && !used.has(q.id));
      if (!options.length) return null;
      const choice = options[Math.floor(Math.random() * options.length)];
      used.add(choice.id);
      picked.push(choice);
    }

    const sum = picked.reduce((acc, q) => acc + q.weight, 0);
    return sum === budget ? picked : null;
  }

  #fallback(length) {
    return this.#shuffle([...QUESTION_POOL]).slice(0, length);
  }

  #shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
