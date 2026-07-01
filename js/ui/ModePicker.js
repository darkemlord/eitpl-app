import { QUIZ_MODES } from "../config/pool/meta.js";

/**
 * Renders the 3 depth-mode cards (Express/Normal/Detallado) and reports the
 * chosen mode (SRP — selection wiring only, no quiz/session logic).
 */
export class ModePicker {
  #container;
  #i18n;
  #onSelect;

  constructor(container, translationService, onSelect) {
    this.#container = container;
    this.#i18n = translationService;
    this.#onSelect = onSelect;
  }

  render() {
    const modes = this.#i18n.t("quiz.modes");
    const metaTemplate = this.#i18n.t("quiz.modeMeta");
    this.#container.innerHTML = "";

    Object.values(QUIZ_MODES).forEach((mode) => {
      const copy = modes[mode.id];
      const card = document.createElement("article");
      card.className = "mode-card card-surface";
      card.dataset.mode = mode.id;
      card.innerHTML = `
        <h3 class="mode-card-name">${copy.name}</h3>
        <p class="mode-card-desc">${copy.desc}</p>
        <p class="mode-card-meta">${metaTemplate
          .replace("{n}", String(mode.length))
          .replace("{minutes}", String(copy.minutes))}</p>
        <button type="button" class="btn btn-primary mode-card-cta" data-mode="${mode.id}">${copy.cta}</button>
      `;
      this.#container.appendChild(card);
    });
  }

  bind() {
    this.#container.addEventListener("click", (e) => {
      const btn = e.target.closest(".mode-card-cta");
      if (!btn) return;
      this.#onSelect(btn.dataset.mode);
    });
  }
}
