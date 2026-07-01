import { LEVELS } from "../config/constants.js";

/**
 * Generates a downloadable PNG certificate via Canvas (SRP).
 */
export class CertificateService {
  #i18n;

  constructor(translationService) {
    this.#i18n = translationService;
  }

  download(result) {
    if (!result) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    const levelColor = LEVELS[result.level - 1]?.color ?? "#6366f1";

    this.#drawBackground(ctx, canvas.width, canvas.height, levelColor);
    this.#drawContent(ctx, canvas.width, result, levelColor);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `eitpl-nivel-${result.level}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  #drawBackground(ctx, w, h, accent) {
    ctx.fillStyle = "#0f1117";
    ctx.fillRect(0, 0, w, h);

    const gradient = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, w * 0.6);
    gradient.addColorStop(0, `${accent}33`);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, w - 96, h - 96);
  }

  #drawContent(ctx, w, result, accent) {
    const items = this.#i18n.t("levels.items");
    const idx = result.level - 1;

    ctx.textAlign = "center";
    ctx.fillStyle = "#908fa0";
    ctx.font = "600 28px Inter, system-ui, sans-serif";
    ctx.fillText(this.#i18n.t("certificate.brand"), w / 2, 140);

    ctx.fillStyle = accent;
    ctx.font = "800 120px Inter, system-ui, sans-serif";
    ctx.fillText(String(result.level), w / 2, 320);

    ctx.fillStyle = "#e0e2e7";
    ctx.font = "700 42px Inter, system-ui, sans-serif";
    ctx.fillText(items[idx].name, w / 2, 420);

    ctx.fillStyle = "#908fa0";
    ctx.font = "400 32px Inter, system-ui, sans-serif";
    this.#wrapText(ctx, `"${result.message}"`, w / 2, 520, w - 200, 42);

    ctx.fillStyle = "#6366f1";
    ctx.font = "800 48px Inter, system-ui, sans-serif";
    ctx.fillText(`${result.score}${this.#i18n.t("result.scoreMax")}`, w / 2, 780);

    if (result.level === 5) {
      ctx.fillStyle = "#fbbf24";
      ctx.font = "700 24px JetBrains Mono, monospace";
      ctx.fillText(this.#i18n.t("result.certBadge"), w / 2, 860);
    }

    ctx.fillStyle = "#464554";
    ctx.font = "400 22px Inter, system-ui, sans-serif";
    ctx.fillText(this.#i18n.t("certificate.footer"), w / 2, 980);
  }

  #wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let drawY = y;

    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, drawY);
        line = word;
        drawY += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, drawY);
  }
}
