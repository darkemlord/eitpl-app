/**
 * Renders the 5-level scale grid (SRP).
 */
export class LevelsRenderer {
  #container;
  #i18n;

  constructor(container, translationService) {
    this.#container = container;
    this.#i18n = translationService;
  }

  render() {
    const items = this.#i18n.t("levels.items");
    this.#container.innerHTML = "";

    items.forEach((item, i) => {
      const level = i + 1;
      const card = document.createElement("article");
      card.className = "level-card card-surface";
      card.dataset.level = level;
      card.innerHTML = `
        ${level === 5 ? `<span class="level-card-badge">${this.#i18n.t("result.certBadge")}</span>` : ""}
        <div class="level-card-icon">
          <span class="level-dot" aria-hidden="true"></span>
        </div>
        <span class="level-card-label">${this.#i18n.t("quiz.levelPrefix")} ${level}</span>
        <h3 class="level-card-name">${item.name}</h3>
        <p class="level-card-desc">"${item.desc}"</p>
        <p class="level-card-action">${item.action}</p>
      `;
      this.#container.appendChild(card);
    });
  }
}
