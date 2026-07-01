/**
 * Renders live stats strip in the hero (SRP).
 */
export class StatsView {
  #root;
  #totalEl;
  #level4El;
  #avgEl;
  #liveEl;
  #i18n;

  constructor(root, translationService) {
    this.#root = root;
    this.#totalEl = root?.querySelector("[data-stat='total']");
    this.#level4El = root?.querySelector("[data-stat='level4']");
    this.#avgEl = root?.querySelector("[data-stat='avg']");
    this.#liveEl = root?.querySelector("[data-stat='live']");
    this.#i18n = translationService;
  }

  showLoading() {
    if (!this.#root) return;
    this.#root.hidden = false;
    this.#root.dataset.state = "loading";
  }

  render(metrics) {
    if (!this.#root || !metrics?.total) return;

    const locale = this.#locale();
    const fmt = new Intl.NumberFormat(locale);

    this.#totalEl.textContent = fmt.format(metrics.total);
    this.#level4El.textContent = `${metrics.level4PlusPct}%`;
    this.#avgEl.textContent = metrics.avgScore.toLocaleString(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

    this.#root.hidden = false;
    this.#root.dataset.state = "ready";
  }

  hide() {
    if (this.#root) this.#root.hidden = true;
  }

  refreshLabels() {
    if (!this.#root) return;
    this.#root.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = this.#i18n.t(el.dataset.i18n);
      if (typeof value === "string") el.textContent = value;
    });
    if (this.#liveEl) {
      this.#liveEl.textContent = this.#i18n.t("stats.live");
    }
  }

  #locale() {
    const lang = this.#i18n.lang;
    if (lang === "ja") return "ja-JP";
    if (lang === "en") return "en-US";
    return "es-AR";
  }
}
