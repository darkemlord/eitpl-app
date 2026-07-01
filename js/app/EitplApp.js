import { TRANSLATIONS } from "../config/i18n.js";
import { THRESHOLDS, STATS } from "../config/constants.js";
import { POOL_TEXTS } from "../config/pool/texts.js";
import { QUIZ_LENGTH } from "../config/pool/meta.js";
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
  #sessionQuestions;

  constructor() {
    this.#storage = new StorageService();
    this.#poolService = new QuestionPoolService();
    this.#sessionQuestions = this.#poolService.getSessionQuestions();
    this.#i18n = new TranslationService(TRANSLATIONS, POOL_TEXTS, this.#storage.getLanguage());
    this.#i18nBinder = new I18nBinder(this.#i18n);
    this.#scoring = new ScoringEngine(this.#sessionQuestions, THRESHOLDS);
    this.#validator = new QuizValidator(this.#sessionQuestions);
    this.#resultUrl = new ResultUrlService();
    this.#meta = new MetaTagService();

    this.#levelsRenderer = new LevelsRenderer(
      document.getElementById("levels-grid"),
      this.#i18n
    );

    this.#quizRenderer = new QuizRenderer(
      document.getElementById("questions-container"),
      this.#sessionQuestions,
      this.#i18n,
      this.#storage
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
      total: QUIZ_LENGTH,
      translationService: this.#i18n,
    });

    this.#quizController = new QuizController({
      form: document.getElementById("quiz-form"),
      hint: document.getElementById("quiz-hint"),
      validator: this.#validator,
      scoringEngine: this.#scoring,
      storageService: this.#storage,
      resultView: this.#resultView,
      quizRenderer: this.#quizRenderer,
      onSubmit: (payload) =>
        this.#handleResult(payload.score, payload.level, {
          shared: false,
          recordStats: true,
          submissionId: payload.submissionId,
        }),
      onChange: (count) => this.#progressBar.update(count),
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
    this.#quizController.bind(document.getElementById("questions-container"));
    this.#restoreFromUrl();
    this.#loadStats();
    this.#statsTimer = setInterval(() => this.#loadStats(), STATS.refreshMs);
  }

  setLanguage(lang) {
    if (!this.#i18n.setLanguage(lang)) return;
    this.#storage.setLanguage(lang);
    this.#applyLanguage(lang);

    const last = this.#resultView.lastResult;
    if (last) {
      this.#handleResult(last.score, last.level, { shared: false, variantIndex: last.variantIndex });
    }
  }

  #applyLanguage(lang) {
    document.body.lang = lang;
    this.#i18nBinder.applyDocument();
    this.#levelsRenderer.render();
    this.#quizRenderer.render();
    this.#progressBar.update(Object.keys(this.#storage.getAnswers()).length);
    this.#statsView.refreshLabels();
  }

  #handleResult(score, level, { shared = false, recordStats = false, submissionId = "", variantIndex } = {}) {
    this.#resultView.show(score, level, { shared, variantIndex });
    this.#resultUrl.sync(this.#resultView.lastResult, this.#i18n.lang);
    this.#meta.setForResult(this.#resultView.lastResult, this.#i18n);
    this.#shareService.hideFeedback();

    if (recordStats && submissionId) {
      this.#statsService
        .record(level, score, submissionId)
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

  #restoreFromUrl() {
    const parsed = this.#resultUrl.parse();
    if (!parsed) return;

    if (parsed.lang && parsed.lang !== this.#i18n.lang) {
      this.#i18n.setLanguage(parsed.lang);
      this.#storage.setLanguage(parsed.lang);
      this.#applyLanguage(parsed.lang);
    }

    this.#handleResult(parsed.score, parsed.level, { shared: true, variantIndex: parsed.variantIndex });
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
      this.#sessionQuestions = this.#poolService.getSessionQuestions(true);
      this.#scoring.setQuestions(this.#sessionQuestions);
      this.#validator.setQuestions(this.#sessionQuestions);
      this.#quizRenderer.setQuestions(this.#sessionQuestions);
      this.#quizRenderer.render();
      this.#validator.clearInvalidMarks();
      document.getElementById("quiz-hint").hidden = true;
      this.#progressBar.reset();
      document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
    });
  }
}
