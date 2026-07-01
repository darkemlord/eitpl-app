import {
  ANCHOR_IDS,
  QUESTION_POOL,
  QUIZ_LENGTH,
  RANDOM_WEIGHT_BUDGET,
} from "../config/pool/meta.js";

const STORAGE_KEY = "eitpl-session-questions";

/** Weight slots for the 6 random picks (sum = RANDOM_WEIGHT_BUDGET). */
const RANDOM_SLOTS = [3, 2, 2, 2, 1, 1];

/**
 * Picks anchor + stratified random questions for one quiz session (SRP).
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
      const random = this.#pickRandomSet();
      if (random) {
        const anchors = ANCHOR_IDS.map((id) => this.#poolById.get(id)).filter(Boolean);
        return this.#shuffle([...anchors, ...random]);
      }
    }

    return this.#fallback();
  }

  #pickRandomSet() {
    const anchors = new Set(ANCHOR_IDS);
    const pool = QUESTION_POOL.filter((q) => !anchors.has(q.id));
    const slots = this.#shuffle([...RANDOM_SLOTS]);
    const picked = [];
    const used = new Set();

    for (const weight of slots) {
      const options = pool.filter((q) => q.weight === weight && !used.has(q.id));
      if (!options.length) return null;
      const choice = options[Math.floor(Math.random() * options.length)];
      used.add(choice.id);
      picked.push(choice);
    }

    const sum = picked.reduce((acc, q) => acc + q.weight, 0);
    return sum === RANDOM_WEIGHT_BUDGET ? picked : null;
  }

  #fallback() {
    const anchors = ANCHOR_IDS.map((id) => this.#poolById.get(id)).filter(Boolean);
    const rest = QUESTION_POOL.filter((q) => !q.anchor).slice(0, QUIZ_LENGTH - anchors.length);
    return [...anchors, ...rest];
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
