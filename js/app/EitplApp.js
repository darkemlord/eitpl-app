import { TRANSLATIONS } from "../config/i18n.js";
import { PERCENT_THRESHOLDS, STATS } from "../config/constants.js";
import { POOL_TEXTS } from "../config/pool/texts.js";
import { StorageService } from "../services/StorageService.js";
import { TranslationService } from "../services/TranslationService.js";
import { ScoringEngine } from "../services/ScoringEngine.js";
import { QuizValidator } from "../services/QuizValidator.js";
import { ShareService } from "../services/ShareService.js";
import { ResultUrlService } from "../services/ResultUrlService.js";
import { MetaTagService } from "../services/MetaTagService.js";
import { CertificateService } from "../services/CertificateService.js";
import { QuestionPoolService } from "../services/QuestionPoolService.js";
import { StatsService } from "../services/StatsService.js";
import { I18nBinder } from "../ui/I18nBinder.js";
import { LevelsRenderer } from "../ui/LevelsRenderer.js";
import { QuizRenderer } from "../ui/QuizRenderer.js";
import { QuizCarousel } from "../ui/QuizCarousel.js";
import { ModePicker } from "../ui/ModePicker.js";
import { ResultView } from "../ui/ResultView.js";
import { HeaderController } from "../ui/HeaderController.js";
import { QuizProgressBar } from "../ui/QuizProgressBar.js";
import { StatsView } from "../ui/StatsView.js";
import { QuizController } from "../controllers/QuizController.js";

/**
 * Application orchestrator — wires dependencies, owns lifecycle (DIP).
 */
export class EitplApp {
  #storage;
  #i18n;
  #i18nBinder;
  #scoring;
  #validator;
  #levelsRenderer;
  #quizRenderer;
  #carousel;
  #modePicker;
  #resultView;
  #shareService;
  #resultUrl;
  #meta;
  #certificate;
  #progressBar;
  #quizController;
  #headerController;
  #statsService;
  #statsView;
  #statsTimer;
  #poolService;
  #currentMode = null;

  constructor() {
    this.#storage = new StorageService();
    this.#poolService = new QuestionPoolService();
    this.#i18n = new TranslationService(TRANSLATIONS, POOL_TEXTS, this.#storage.getLanguage());
    this.#i18nBinder = new I18nBinder(this.#i18n);
    this.#scoring = new ScoringEngine([], PERCENT_THRESHOLDS);
    this.#validator = new QuizValidator([]);
    this.#resultUrl = new ResultUrlService();
    this.#meta = new MetaTagService();

    this.#levelsRenderer = new LevelsRenderer(
      document.getElementById("levels-grid"),
      this.#i18n
    );

    this.#quizRenderer = new QuizRenderer(
      document.getElementById("questions-container"),
      [],
      this.#i18n,
      this.#storage
    );

    this.#carousel = new QuizCarousel(this.#quizRenderer);

    this.#modePicker = new ModePicker(
      document.getElementById("mode-picker-grid"),
      this.#i18n,
      (modeId) => this.#startQuiz(modeId)
    );

    this.#resultView = new ResultView(
      {
        resultSection: document.getElementById("result"),
        resultCard: document.getElementById("result-card"),
        resultLevel: document.getElementById("result-level"),
        resultName: document.getElementById("result-name"),
        resultMessage: document.getElementById("result-message"),
        resultAction: document.getElementById("result-action"),
        resultScoreValue: document.getElementById("result-score-value"),
        resultModeLabel: document.getElementById("result-mode-label"),
        sharedBanner: document.getElementById("result-shared-banner"),
      },
      this.#i18n
    );

    this.#shareService = new ShareService(
      this.#i18n,
      document.getElementById("share-feedback"),
      this.#resultUrl
    );

    this.#certificate = new CertificateService(this.#i18n);

    this.#progressBar = new QuizProgressBar({
      fillEl: document.getElementById("quiz-progress-fill"),
      labelEl: document.getElementById("quiz-progress-label"),
      translationService: this.#i18n,
    });

    this.#quizController = new QuizController({
      form: document.getElementById("quiz-form"),
      hint: document.getElementById("quiz-hint"),
      submitLabel: document.getElementById("btn-submit-label"),
      prevBtn: document.getElementById("btn-prev"),
      validator: this.#validator,
      scoringEngine: this.#scoring,
      storageService: this.#storage,
      carousel: this.#carousel,
      translationService: this.#i18n,
      onSubmit: (payload) =>
        this.#handleResult(payload.percentage, payload.level, this.#currentMode, {
          shared: false,
          recordStats: true,
          submissionId: payload.submissionId,
        }),
      onStepChange: (step, total) => this.#progressBar.update(step, total),
    });

    this.#headerController = new HeaderController(document.getElementById("site-header"));

    this.#statsService = new StatsService();
    this.#statsView = new StatsView(document.getElementById("hero-stats"), this.#i18n);
  }

  init() {
    this.#injectPlausible();
    this.#meta.setDefault(this.#i18n);
    this.#applyLanguage(this.#i18n.lang);
    this.#headerController.init();
    this.#bindNavigation();
    this.#bindLanguageSwitcher();
    this.#bindResultActions();
    this.#bindQuizActions();
    this.#modePicker.render();
    this.#modePicker.bind();
    this.#quizController.bind(document.getElementById("questions-container"));
    this.#loadStats();
    this.#statsTimer = setInterval(() => this.#loadStats(), STATS.refreshMs);

    const restoredResult = this.#restoreFromUrl();
    if (!restoredResult) {
      const storedMode = this.#poolService.getStoredMode();
      if (storedMode) this.#startQuiz(storedMode);
      else this.#showModePicker();
    }
  }

  setLanguage(lang) {
    if (!this.#i18n.setLanguage(lang)) return;
    this.#storage.setLanguage(lang);
    this.#applyLanguage(lang);

    const last = this.#resultView.lastResult;
    if (last) {
      this.#handleResult(last.percentage, last.level, last.mode, {
        shared: false,
        variantIndex: last.variantIndex,
      });
    }
  }

  #applyLanguage(lang) {
    document.body.lang = lang;
    this.#i18nBinder.applyDocument();
    this.#levelsRenderer.render();
    this.#modePicker.render();
    this.#carousel.refresh();
    this.#progressBar.update(this.#carousel.currentStep, this.#carousel.totalSteps);
    this.#statsView.refreshLabels();
  }

  #startQuiz(modeId, forceNew = false) {
    const questions = this.#poolService.getSessionQuestions(modeId, forceNew);
    this.#currentMode = modeId;
    this.#scoring.setQuestions(questions);
    this.#validator.setQuestions(questions);
    this.#carousel.init(questions);
    this.#quizController.start();
    this.#showCarousel();
  }

  #showModePicker() {
    document.getElementById("mode-picker").hidden = false;
    document.getElementById("quiz-form").hidden = true;
  }

  #showCarousel() {
    document.getElementById("mode-picker").hidden = true;
    document.getElementById("quiz-form").hidden = false;
  }

  #handleResult(percentage, level, mode, { shared = false, recordStats = false, submissionId = "", variantIndex } = {}) {
    this.#resultView.show(percentage, level, mode, { shared, variantIndex });
    this.#resultUrl.sync(this.#resultView.lastResult, this.#i18n.lang);
    this.#meta.setForResult(this.#resultView.lastResult, this.#i18n);
    this.#shareService.hideFeedback();

    if (recordStats && submissionId) {
      this.#statsService
        .record(level, percentage, submissionId)
        .then((recorded) => {
          if (recorded) this.#loadStats();
        })
        .catch(() => {});
    }
  }

  #clearResult() {
    this.#resultView.hide();
    this.#resultUrl.clear();
    this.#meta.setDefault(this.#i18n);
    this.#shareService.hideFeedback();
  }

  /** @returns {boolean} whether a shared result was found and restored */
  #restoreFromUrl() {
    const parsed = this.#resultUrl.parse();
    if (!parsed) return false;

    if (parsed.lang && parsed.lang !== this.#i18n.lang) {
      this.#i18n.setLanguage(parsed.lang);
      this.#storage.setLanguage(parsed.lang);
      this.#applyLanguage(parsed.lang);
    }

    this.#handleResult(parsed.percentage, parsed.level, parsed.mode ?? "express", {
      shared: true,
      variantIndex: parsed.variantIndex,
    });
    this.#showModePicker();
    return true;
  }

  async #loadStats() {
    try {
      const data = await this.#statsService.fetch();
      this.#statsView.render(this.#statsService.aggregate(data));
    } catch {
      this.#statsView.hide();
    }
  }

  #injectPlausible() {
    if (!STATS.plausibleDomain || document.querySelector("[data-plausible]")) return;

    const script = document.createElement("script");
    script.defer = true;
    script.dataset.domain = STATS.plausibleDomain;
    script.dataset.plausible = "true";
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);
  }

  #bindNavigation() {
    const scrollTo = (id) => () =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

    document.getElementById("btn-start")?.addEventListener("click", scrollTo("quiz"));
    document.getElementById("btn-start-header")?.addEventListener("click", scrollTo("quiz"));
    document.getElementById("btn-levels")?.addEventListener("click", scrollTo("levels"));
  }

  #bindLanguageSwitcher() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.setLanguage(btn.dataset.lang));
    });
  }

  #bindResultActions() {
    document.getElementById("btn-share")?.addEventListener("click", () => {
      this.#shareService.share(this.#resultView.lastResult, this.#i18n.lang);
    });

    document.getElementById("btn-whatsapp")?.addEventListener("click", () => {
      this.#shareService.shareWhatsApp(this.#resultView.lastResult, this.#i18n.lang);
    });

    document.getElementById("btn-certificate")?.addEventListener("click", () => {
      this.#certificate.download(this.#resultView.lastResult);
    });

    document.getElementById("btn-retry")?.addEventListener("click", () => {
      this.#clearResult();
      this.#poolService.resetSession();
      this.#storage.clearAnswers();
      this.#showModePicker();
    });
  }

  #bindQuizActions() {
    document.getElementById("btn-cancel-quiz")?.addEventListener("click", () => {
      this.#poolService.resetSession();
      this.#storage.clearAnswers();
      this.#currentMode = null;
      this.#showModePicker();
      document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
    });
  }
}
