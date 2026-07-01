import { QUIZ_MODES } from "../config/pool/meta.js";

/**
 * Result panel presentation (SRP).
 * @typedef {{ percentage: number, level: number, mode: string, name: string, message: string, action: string, variantIndex: number }} QuizResult
 */
export class ResultView {
  #els;
  #i18n;
  #lastResult = null;

  constructor(elements, translationService) {
    this.#els = elements;
    this.#i18n = translationService;
  }

  get lastResult() {
    return this.#lastResult;
  }

  show(percentage, level, mode, { shared = false, variantIndex } = {}) {
    const items = this.#i18n.t("levels.items");
    const messagePool = this.#i18n.t("result.messages")[level - 1];
    const actionPool = this.#i18n.t("result.actions")[level - 1];
    const idx = level - 1;

    const chosen = messagePool[variantIndex] !== undefined
      ? variantIndex
      : Math.floor(Math.random() * messagePool.length);

    this.#lastResult = {
      percentage,
      level,
      mode,
      name: items[idx].name,
      message: messagePool[chosen],
      action: actionPool[chosen] ?? actionPool[0],
      variantIndex: chosen,
    };

    const {
      resultSection,
      resultCard,
      resultLevel,
      resultName,
      resultMessage,
      resultAction,
      resultScoreValue,
      resultModeLabel,
      sharedBanner,
    } = this.#els;

    resultCard.dataset.level = level;
    resultCard.classList.toggle("shake", level === 5);
    resultLevel.innerHTML = `${this.#i18n.t("result.levelIntro")} <span>${this.#i18n.t("levels.colLevel")} ${level}</span>`;
    resultName.textContent = items[idx].name;
    resultMessage.textContent = `"${this.#lastResult.message}"`;
    resultAction.textContent = this.#lastResult.action;
    resultScoreValue.textContent = `${percentage}%`;

    if (resultModeLabel) {
      const modeCopy = this.#i18n.t("quiz.modes")[mode];
      const length = QUIZ_MODES[mode]?.length;
      resultModeLabel.textContent = modeCopy && length
        ? this.#i18n.t("result.modeLabel").replace("{mode}", modeCopy.name).replace("{n}", String(length))
        : "";
    }

    if (sharedBanner) {
      sharedBanner.hidden = !shared;
      if (shared) sharedBanner.textContent = this.#i18n.t("result.viewingShared");
    }

    this.#toggleCertBadge(level);
    resultSection.hidden = false;

    requestAnimationFrame(() => {
      resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  hide() {
    this.#els.resultSection.hidden = true;
    this.#lastResult = null;
  }

  #toggleCertBadge(level) {
    let cert = this.#els.resultCard.querySelector(".cert-badge");

    if (level === 5) {
      if (!cert) {
        cert = document.createElement("span");
        cert.className = "cert-badge";
        this.#els.resultName.after(cert);
      }
      cert.textContent = this.#i18n.t("result.certBadge");
      cert.style.display = "inline-block";
    } else if (cert) {
      cert.style.display = "none";
    }
  }
}
