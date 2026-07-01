import { QUESTION_POOL, QUIZ_LENGTH, SESSION_SLOTS, SESSION_WEIGHT_BUDGET } from "../config/pool/meta.js";

const STORAGE_KEY = "eitpl-session-questions";

/**
 * Picks a fresh stratified-random set of questions for one quiz session (SRP).
 * No question is ever pinned by ID — the severity mix (weight distribution)
 * stays constant across sessions so every diagnosis is comparable.
 */
export class QuestionPoolService {
  #poolById;

  constructor(pool = QUESTION_POOL) {
    this.#poolById = new Map(pool.map((q) => [q.id, q]));
  }

  getSessionQuestions(forceNew = false) {
    if (!forceNew) {
      const saved = this.#readStored();
      if (saved?.length === QUIZ_LENGTH) {
        return saved.map((id) => this.#poolById.get(id)).filter(Boolean);
      }
    }

    const selected = this.#pickQuestions();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selected.map((q) => q.id)));
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

  #pickQuestions() {
    for (let attempt = 0; attempt < 50; attempt++) {
      const picked = this.#pickBySlots();
      if (picked) return this.#shuffle(picked);
    }

    return this.#fallback();
  }

  #pickBySlots() {
    const slots = this.#shuffle([...SESSION_SLOTS]);
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
    return sum === SESSION_WEIGHT_BUDGET ? picked : null;
  }

  #fallback() {
    return this.#shuffle([...QUESTION_POOL]).slice(0, QUIZ_LENGTH);
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
