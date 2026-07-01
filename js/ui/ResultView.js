/**
 * Result panel presentation (SRP).
 * @typedef {{ score: number, level: number, name: string, message: string }} QuizResult
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

  show(score, level, { shared = false } = {}) {
    const items = this.#i18n.t("levels.items");
    const messages = this.#i18n.t("result.messages");
    const actions = this.#i18n.t("result.actions");
    const idx = level - 1;

    this.#lastResult = {
      score,
      level,
      name: items[idx].name,
      message: messages[idx],
    };

    const { resultSection, resultCard, resultLevel, resultName, resultMessage, resultAction, resultScoreValue, sharedBanner } =
      this.#els;

    resultCard.dataset.level = level;
    resultCard.classList.toggle("shake", level === 5);
    resultLevel.innerHTML = `${this.#i18n.t("result.levelIntro")} <span>${this.#i18n.t("levels.colLevel")} ${level}</span>`;
    resultName.textContent = items[idx].name;
    resultMessage.textContent = `"${messages[idx]}"`;
    resultAction.textContent = actions[idx];
    resultScoreValue.textContent = score;

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
