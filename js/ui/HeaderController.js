/**
 * Sticky header scroll behavior (SRP).
 */
export class HeaderController {
  #header;
  #scrollThreshold;

  constructor(headerEl, scrollThreshold = 50) {
    this.#header = headerEl;
    this.#scrollThreshold = scrollThreshold;
  }

  init() {
    window.addEventListener("scroll", () => {
      this.#header.classList.toggle("is-scrolled", window.scrollY > this.#scrollThreshold);
    });
  }
}
