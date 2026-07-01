/**
 * EITPL — Escala Internacional de Tocada de Pelotas Laboral
 * Config, i18n, scoring, and UI logic.
 */

const STORAGE_KEY = "eitpl-lang";
const MAX_SCORE = 22;

/** Score thresholds: level N if score <= threshold[N-1] */
const THRESHOLDS = [4, 9, 13, 17, MAX_SCORE];

const LEVELS = [
  { id: 1, color: "#22c55e" },
  { id: 2, color: "#eab308" },
  { id: 3, color: "#f59e0b" },
  { id: 4, color: "#f97316" },
  { id: 5, color: "#7f1d1d" },
];

/**
 * Weights: yes = weight, sometimes = ceil(weight/2), no = 0
 * Total max when all "yes": 22
 */
const QUESTIONS = [
  { id: "q1", weight: 1 },
  { id: "q2", weight: 3 },
  { id: "q3", weight: 2 },
  { id: "q4", weight: 2 },
  { id: "q5", weight: 2 },
  { id: "q6", weight: 2 },
  { id: "q7", weight: 2 },
  { id: "q8", weight: 2 },
  { id: "q9", weight: 1 },
  { id: "q10", weight: 3 },
  { id: "q11", weight: 2 },
];

const I18N = {
  es: {
    meta: { title: "EITPL — Escala Internacional de Tocada de Pelotas Laboral" },
    hero: {
      badgeLabel: "Metodología peer-reviewed*",
      title: "¿Qué nivel de",
      titleAccent: "tocada de pelotas laboral",
      titleEnd: "sufrís hoy?",
      subtitle:
        "Diagnóstico de precisión satírica para el profesional moderno. Cuantificá tu hastío con rigor clínico y descubrí si es hora de actualizar el CV.",
      cta: "Hacer el diagnóstico",
      ctaSecondary: "Ver escala",
      disclaimer:
        "*Peer-reviewed por tres ex-compañeros en un bar. Nivel de evidencia: anecdótico pero contundente.",
    },
    levels: {
      title: "La escala EITPL",
      subtitle: "De manotazo inocente a renuncia cinematográfica",
      colLevel: "Nivel",
      colName: "Nombre",
      colDesc: "Descripción",
      colAction: "Qué hacer",
      items: [
        {
          name: "El Manotazo Inocente",
          desc: "Te cambian el horario del standup sin avisarte",
          action: "Respirá hondo",
        },
        {
          name: "El Apretoncito con Cariño",
          desc: 'Sin bono "por el contexto del mercado" por tercera vez seguida',
          action: "Mirá LinkedIn de reojo",
        },
        {
          name: "La Maniobra del Tío Raro",
          desc: "Te quitan el título o te reasignan sin explicación",
          action: "CV actualizado YA",
        },
        {
          name: "El Exprimidor Industrial",
          desc: "Te bajan de nivel con PowerPoint de montaña y sonrisa de RRHH",
          action: "Mandá CVs como spam",
        },
        {
          name: "El Full Garra Rufa Certificado",
          desc: "Te bajan sueldo, nivel, cobran errores selectivos, prometen ascenso fantasma, y encima te piden organizar el nomikai de despedida",
          action: "RENUNCIÁ EL VIERNES CON GAFAS OSCURAS",
        },
      ],
    },
    quiz: {
      title: "Diagnóstico EITPL",
      subtitle: "Respondé con honestidad brutal. Tu psicólogo no va a ver esto.",
      submit: "Calcular mi nivel",
      hint: "Faltan preguntas sin responder. No te hagas el distraído.",
      options: { yes: "Sí", sometimes: "A veces", no: "No" },
      severity: { 1: "Leve", 2: "Moderado", 3: "Grave" },
      severityPrefix: "Severidad:",
      levelPrefix: "NIVEL",
      items: [
        "¿Tu empresa usa metáforas de montaña o alpinismo en las presentaciones de RRHH?",
        "¿Te bajaron de nivel o de sueldo en los últimos 12 meses?",
        "¿Te prometieron un ascenso que lleva más de 6 meses sin materializarse?",
        "¿Los errores te los cobran en la evaluación solo cuando son tuyos, pero no cuando los comete el lead?",
        '¿La empresa está en "modo ahorro" pero los managers siguen yendo a offsite con open bar?',
        "¿Te pidieron organizar un evento de empresa después de anunciar recortes?",
        "¿Tu sueldo actual está por encima del techo de tu propio nivel según el nuevo sistema de grading?",
        '¿La última vez que preguntaste por tu ascenso te respondieron con "te apoyamos" sin fecha concreta?',
        "¿El sistema de evaluación tiene más niveles que antes pero es más difícil subir?",
        "¿Llevás más de 3 meses sin poder subir ni al primer subnivel de tu categoría actual?",
        "¿Te citaron a un 1:1 para decirte que te fuiste temprano un día, y encima anda circulando que 'todos están desmotivados' sin que vos lideres ni el grupo de WhatsApp del piso?",
      ],
    },
    aesthetic: {
      label: "Recomendación",
      text: "Considerá una carrera en la cría de alpacas.",
    },
    result: {
      status: "Diagnóstico finalizado",
      levelIntro: "Tu nivel es",
      scoreMax: "/22",
      share: "Compartir mi resultado",
      retry: "Volver a hacer el test",
      copied: "¡Copiado! Mandalo al grupo de WhatsApp del laburo (o mejor, no).",
      certBadge: "CERTIFICADO OFICIAL",
      messages: [
        "Tranquilo, esto tiene arreglo. Hablá con tu manager, tomate un café, y si en 30 días sigue igual, volvé acá.",
        "La cosa se está poniendo turbia. Actualizá el CV esta noche. No mañana. ESTA NOCHE.",
        "Houston, tenemos un problema. Tu empresa ya tomó decisiones sobre vos sin consultarte. Empezá a hacer entrevistas.",
        "Esto ya no tiene arreglo. Estás en el Exprimidor Industrial. Mandá CVs, contá lo que pasa en las entrevistas, y preparate para salir con dignidad.",
        "La ciencia ha hablado. No hay nada más que analizar. Ponete las gafas oscuras, imprimí la carta de renuncia, y presentate el viernes. Con calma, con clase, y con la satisfacción de quien ya firmó en otro lado.",
      ],
      actions: [
        "Acción recomendada: respirá hondo y monitoreá 30 días.",
        "Acción recomendada: LinkedIn de reojo, CV en silencio.",
        "Acción recomendada: CV actualizado YA + entrevistas discretas.",
        "Acción recomendada: spam de CVs con dignidad.",
        "Acción recomendada: renunciá el viernes con gafas oscuras. ★",
      ],
      shareTemplate:
        "🎱 Mi nivel EITPL: {level} — {name}\n\"{message}\"\n👉 {url}",
    },
    footer: {
      brand: "EITPL © 2026",
      text: "Metodología de Precisión Satírica. Creado por alguien que lo vivió en carne propia.",
      link1: "Privacidad irrelevante",
      link2: "Términos absurdos",
      link3: "Soporte inexistente",
      disclaimer:
        "Herramienta 100% satírica. No reemplaza asesoría laboral, terapia, ni un abogado con cara de pocos amigos.",
    },
  },

  en: {
    meta: { title: "EITPL — International Workplace Ball-Touching Scale" },
    hero: {
      badgeLabel: "Peer-reviewed methodology*",
      title: "What level of",
      titleAccent: "workplace ball-touching",
      titleEnd: "are you suffering today?",
      subtitle:
        "Satirical precision diagnosis for the modern professional. Quantify your burnout with clinical rigor and find out if it's time to update your résumé.",
      cta: "Take the diagnosis",
      ctaSecondary: "View scale",
      disclaimer:
        "*Peer-reviewed by three former coworkers at a bar. Evidence level: anecdotal but devastating.",
    },
    levels: {
      title: "The EITPL Scale",
      subtitle: "From innocent slap to cinematic resignation",
      colLevel: "Level",
      colName: "Name",
      colDesc: "Description",
      colAction: "What to do",
      items: [
        {
          name: "The Innocent Slap",
          desc: "They changed the standup time without telling you",
          action: "Take a deep breath",
        },
        {
          name: "The Loving Squeeze",
          desc: 'No bonus "given market conditions" for the third year running',
          action: "Glance at LinkedIn",
        },
        {
          name: "The Weird Uncle Maneuver",
          desc: "They removed your title or reassigned you with zero explanation",
          action: "Update your résumé NOW",
        },
        {
          name: "The Industrial Juicer",
          desc: "Demoted via a mountain-climbing PowerPoint and an HR smile",
          action: "Spam your résumé everywhere",
        },
        {
          name: "Full Certified Garra Rufa",
          desc: "Pay cut, level drop, selective blame, phantom promotion, AND they asked you to organize the farewell happy hour",
          action: "RESIGN ON FRIDAY WITH SUNGLASSES",
        },
      ],
    },
    quiz: {
      title: "EITPL Diagnosis",
      subtitle: "Answer with brutal honesty. Your therapist won't see this.",
      submit: "Calculate my level",
      hint: "Some questions are unanswered. Don't play innocent.",
      options: { yes: "Yes", sometimes: "Sometimes", no: "No" },
      severity: { 1: "Mild", 2: "Moderate", 3: "Severe" },
      severityPrefix: "Severity:",
      levelPrefix: "LEVEL",
      items: [
        "Does your company use mountain-climbing or alpinism metaphors in HR presentations?",
        "Have you been demoted or had a pay cut in the last 12 months?",
        "Were you promised a promotion that's been pending for over 6 months?",
        "Are mistakes counted against you in reviews, but not when your lead makes them?",
        'Is the company in "cost-saving mode" while managers still go to off-sites with open bars?',
        "Were you asked to organize a company event right after layoffs were announced?",
        "Is your current salary above the ceiling for your level in the new grading system?",
        'The last time you asked about a promotion, did they say "we support you" with no concrete date?',
        "Does the evaluation system have more levels than before but is harder to climb?",
        "Have you gone 3+ months without moving up even one sub-level in your current band?",
        "Were you pulled into a 1:1 for leaving early one day, while word spreads that 'everyone is demotivated' — and you're not even a team lead?",
      ],
    },
    aesthetic: {
      label: "Recommendation",
      text: "Consider a career in alpaca farming.",
    },
    result: {
      status: "Diagnosis complete",
      levelIntro: "Your level is",
      scoreMax: "/22",
      share: "Share my result",
      retry: "Retake the test",
      copied: "Copied! Send it to the work group chat (or maybe don't).",
      certBadge: "OFFICIALLY CERTIFIED",
      messages: [
        "Easy there — this is fixable. Talk to your manager, grab a coffee, and if nothing changes in 30 days, come back.",
        "Things are getting weird. Update your résumé tonight. Not tomorrow. TONIGHT.",
        "Houston, we have a problem. Your company already made decisions about you without asking. Start interviewing.",
        "This isn't fixable anymore. You're in the Industrial Juicer. Spam résumés, talk about what's happening in interviews, and plan a dignified exit.",
        "Science has spoken. Nothing left to analyze. Put on sunglasses, print the resignation letter, and show up Friday. Calm, classy, already signed elsewhere.",
      ],
      actions: [
        "Recommended action: breathe and monitor for 30 days.",
        "Recommended action: side-eye LinkedIn, update résumé quietly.",
        "Recommended action: résumé updated NOW + discreet interviews.",
        "Recommended action: dignified résumé spam.",
        "Recommended action: resign Friday with sunglasses. ★",
      ],
      shareTemplate:
        "🎱 My EITPL level: {level} — {name}\n\"{message}\"\n👉 {url}",
    },
    footer: {
      brand: "EITPL © 2026",
      text: "Satirical Precision Methodology. Built by someone who lived it firsthand.",
      link1: "Irrelevant Privacy",
      link2: "Absurd Terms",
      link3: "Nonexistent Support",
      disclaimer:
        "100% satirical tool. Does not replace legal advice, therapy, or a lawyer who looks like they've seen things.",
    },
  },

  ja: {
    meta: { title: "EITPL — 国際職場ボールタッチング尺度" },
    hero: {
      badgeLabel: "ピアレビュー済み*",
      title: "今日、どのレベルの",
      titleAccent: "職場ボールタッチング",
      titleEnd: "に苦しんでいますか？",
      subtitle:
        "現代のプロフェッショナル向け風刺的精密診断。臨床的厳密さで倦怠感を数値化し、履歴書を更新すべき時かどうかを判定します。",
      cta: "診断を受ける",
      ctaSecondary: "尺度を見る",
      disclaimer:
        "*居酒屋で元同僚3人がレビュー。エビデンスレベル：逸話的だが説得力あり。",
    },
    levels: {
      title: "EITPL尺度",
      subtitle: "軽い一叩きから映画みたいな退職まで",
      colLevel: "レベル",
      colName: "名称",
      colDesc: "症状",
      colAction: "対処法",
      items: [
        {
          name: "無邪気なビンタ",
          desc: "スタンドアップの時間が勝手に変更された",
          action: "深呼吸する",
        },
        {
          name: "愛のある小突き",
          desc: "「市場環境を踏まえて」ボーナスなし、3年目",
          action: "LinkedInをチラ見する",
        },
        {
          name: "怪しいおじさんの手口",
          desc: "肩書きが消えた、または異動理由ゼロ",
          action: "今すぐ履歴書更新",
        },
        {
          name: "工業用絞り器",
          desc: "山登りメタファーのPowerPointと人事の笑顔でグレードダウン",
          action: "履歴書をスパム送信",
        },
        {
          name: "ガラルーファ完全認定",
          desc: "降給、降格、選択的責任追及、幻の昇進、さらに送別会の幹事まで押し付け",
          action: "サングラスをかけて金曜に退職",
        },
      ],
    },
    quiz: {
      title: "EITPL診断",
      subtitle: "正直に答えて。カウンセラーには見せないで。",
      submit: "レベルを計算する",
      hint: "未回答の質問があります。ごまかさないで。",
      options: { yes: "はい", sometimes: "たまに", no: "いいえ" },
      severity: { 1: "軽度", 2: "中度", 3: "重度" },
      severityPrefix: "深刻度：",
      levelPrefix: "レベル",
      items: [
        "人事のプレゼンで山登り・アルピニズムのメタファーを使いますか？",
        "過去12ヶ月以内にグレードダウンまたは降給されましたか？",
        "6ヶ月以上前から約束された昇進がまだ実現していませんか？",
        "評価では自分のミスは厳しく、リードのミスはスルーされますか？",
        "「コスト削減モード」なのにマネージャーはオフサイトでオープンバー付きですか？",
        "リストラ発表の後、会社イベントの幹事を頼まれましたか？",
        "新グレーディング制度で、今の給与が自分のレベルの上限を超えていますか？",
        "昇進について聞いたら「応援しています」とだけ言われ、具体的な日程はありませんでしたか？",
        "評価制度のレベル数は増えたのに、昇格は以前より難しくなりましたか？",
        "現在のグレードで3ヶ月以上、サブレベル1つも上がれていませんか？",
        "早退を理由に1on1で呼ばれたのに、自分はリーダーでもないのに「みんなやる気がない」と社内で言われていませんか？",
      ],
    },
    aesthetic: {
      label: "推奨",
      text: "アルパカ飼育のキャリアを検討してください。",
    },
    result: {
      status: "診断完了",
      levelIntro: "あなたのレベル：",
      scoreMax: "/22",
      share: "結果をシェア",
      retry: "もう一度診断する",
      copied: "コピーしました！職場のグループチャットに送る（しない方がいいかも）。",
      certBadge: "正式認定",
      messages: [
        "大丈夫、まだ治る。マネージャーと話して、コーヒーでも飲んで。30日変わらなければまた来て。",
        "状況が怪しくなってきた。履歴書は今夜更新。明日じゃない。今夜。",
        "ヒューストン、問題発生。会社はもうあなたのこと決めてる。面接始めよう。",
        "もう手遅れ。工業用絞り器ゾーン。履歴書スパム、面接で状況を話して、尊厳を持って退場準備。",
        "科学が語った。分析の余地なし。サングラスをかけ、退職届を印刷し、金曜日に出社。冷静に、品よく、もう次の会社にサイン済みで。",
      ],
      actions: [
        "推奨アクション：深呼吸して30日様子見。",
        "推奨アクション：LinkedInチラ見、こっそり履歴書更新。",
        "推奨アクション：履歴書更新＋こっそり面接。",
        "推奨アクション：尊厳を持った履歴書スパム。",
        "推奨アクション：サングラスをかけて金曜退職。★",
      ],
      shareTemplate:
        "🎱 私のEITPLレベル：{level} — {name}\n「{message}」\n👉 {url}",
    },
    footer: {
      brand: "EITPL © 2026",
      text: "風刺的精密方法論。当事者が作った。",
      link1: "無意味なプライバシー",
      link2: "馬鹿げた利用規約",
      link3: "存在しないサポート",
      disclaimer:
        "100%風刺ツール。労働相談、カウンセリング、顔が疲れた弁護士の代わりにはなりません。",
    },
  },
};

/* ── State ── */
let currentLang = localStorage.getItem(STORAGE_KEY) || "es";
let lastResult = null;

/* ── DOM refs ── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  levelsGrid: $("#levels-grid"),
  questionsContainer: $("#questions-container"),
  quizForm: $("#quiz-form"),
  quizHint: $("#quiz-hint"),
  resultSection: $("#result"),
  resultCard: $("#result-card"),
  resultLevel: $("#result-level"),
  resultName: $("#result-name"),
  resultMessage: $("#result-message"),
  resultAction: $("#result-action"),
  resultScoreValue: $("#result-score-value"),
  shareFeedback: $("#share-feedback"),
};

/* ── i18n helpers ── */
function t(key) {
  const parts = key.split(".");
  let obj = I18N[currentLang];
  for (const p of parts) {
    obj = obj?.[p];
  }
  return obj ?? key;
}

function severityLabel(weight) {
  const map = t("quiz.severity");
  if (weight >= 3) return map[3];
  if (weight >= 2) return map[2];
  return map[1];
}

function severityTier(weight) {
  if (weight >= 3) return 3;
  if (weight >= 2) return 2;
  return 1;
}

function padQuestionNum(n) {
  return String(n).padStart(2, "0");
}

function applyStaticI18n() {
  document.documentElement.lang = currentLang;
  document.title = t("meta.title");

  $$("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (typeof val === "string") el.textContent = val;
  });

  $$(".lang-btn").forEach((btn) => {
    const active = btn.dataset.lang === currentLang;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

/* ── Render levels ── */
function renderLevels() {
  const items = t("levels.items");
  els.levelsGrid.innerHTML = "";

  items.forEach((item, i) => {
    const level = i + 1;
    const card = document.createElement("article");
    card.className = "level-card card-surface";
    card.dataset.level = level;
    card.innerHTML = `
      ${level === 5 ? `<span class="level-card-badge">${t("result.certBadge")}</span>` : ""}
      <div class="level-card-icon">
        <span class="level-dot" aria-hidden="true"></span>
      </div>
      <span class="level-card-label">${t("quiz.levelPrefix")} ${level}</span>
      <h3 class="level-card-name">${item.name}</h3>
      <p class="level-card-desc">"${item.desc}"</p>
      <p class="level-card-action">${item.action}</p>
    `;
    els.levelsGrid.appendChild(card);
  });
}

/* ── Render questions ── */
function renderQuestions() {
  const items = t("quiz.items");
  const opts = t("quiz.options");
  const saved = getSavedAnswers();

  els.questionsContainer.innerHTML = "";

  QUESTIONS.forEach((q, i) => {
    const tier = severityTier(q.weight);
    const card = document.createElement("div");
    card.className = "question-card card-surface";
    card.dataset.question = q.id;

    card.innerHTML = `
      <div class="question-row">
        <div class="question-number" aria-hidden="true">${padQuestionNum(i + 1)}</div>
        <div class="question-body">
          <span class="severity-badge severity-badge--${tier}">
            ${t("quiz.severityPrefix")} ${severityLabel(q.weight)}
          </span>
          <p class="question-text" id="${q.id}-label">${items[i]}</p>
        </div>
        <div class="options-group" role="radiogroup" aria-labelledby="${q.id}-label"></div>
      </div>
    `;

    const group = card.querySelector(".options-group");
    ["yes", "sometimes", "no"].forEach((value) => {
      const id = `${q.id}-${value}`;
      const label = document.createElement("label");
      label.className = "option-label";
      label.innerHTML = `
        <input type="radio" name="${q.id}" id="${id}" value="${value}" ${saved[q.id] === value ? "checked" : ""}>
        <span class="option-pill">${opts[value]}</span>
      `;
      group.appendChild(label);
    });

    els.questionsContainer.appendChild(card);
  });
}

function getSavedAnswers() {
  try {
    return JSON.parse(sessionStorage.getItem("eitpl-answers") || "{}");
  } catch {
    return {};
  }
}

function saveAnswers(answers) {
  sessionStorage.setItem("eitpl-answers", JSON.stringify(answers));
}

/* ── Scoring ── */
function scoreAnswer(weight, value) {
  if (value === "yes") return weight;
  if (value === "sometimes") return Math.ceil(weight / 2);
  return 0;
}

function collectAnswers() {
  const answers = {};
  let allAnswered = true;

  QUESTIONS.forEach((q) => {
    const selected = document.querySelector(`input[name="${q.id}"]:checked`);
    if (!selected) {
      allAnswered = false;
    } else {
      answers[q.id] = selected.value;
    }
  });

  return { answers, allAnswered };
}

function calculateScore(answers) {
  return QUESTIONS.reduce(
    (sum, q) => sum + scoreAnswer(q.weight, answers[q.id] || "no"),
    0
  );
}

function scoreToLevel(score) {
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (score <= THRESHOLDS[i]) return i + 1;
  }
  return 5;
}

/* ── Result ── */
function showResult(score, level) {
  const items = t("levels.items");
  const messages = t("result.messages");
  const actions = t("result.actions");
  const idx = level - 1;

  lastResult = { score, level, name: items[idx].name, message: messages[idx] };

  els.resultCard.dataset.level = level;
  els.resultCard.classList.toggle("shake", level === 5);
  els.resultLevel.innerHTML = `${t("result.levelIntro")} <span>${t("levels.colLevel")} ${level}</span>`;
  els.resultName.textContent = items[idx].name;
  els.resultMessage.textContent = `"${messages[idx]}"`;
  els.resultAction.textContent = actions[idx];
  els.resultScoreValue.textContent = score;

  let cert = els.resultCard.querySelector(".cert-badge");
  if (level === 5) {
    if (!cert) {
      cert = document.createElement("span");
      cert.className = "cert-badge";
      els.resultName.after(cert);
    }
    cert.textContent = t("result.certBadge");
    cert.style.display = "inline-block";
  } else if (cert) {
    cert.style.display = "none";
  }

  els.resultSection.hidden = false;
  els.shareFeedback.hidden = true;

  requestAnimationFrame(() => {
    els.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function hideResult() {
  els.resultSection.hidden = true;
  lastResult = null;
}

/* ── Share ── */
function buildShareText() {
  if (!lastResult) return "";
  const template = t("result.shareTemplate");
  return template
    .replace("{level}", lastResult.level)
    .replace("{name}", lastResult.name)
    .replace("{message}", lastResult.message)
    .replace("{url}", window.location.href.split("#")[0]);
}

async function shareResult() {
  const text = buildShareText();

  if (navigator.share) {
    try {
      await navigator.share({ text, title: t("meta.title") });
      return;
    } catch (err) {
      if (err.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    els.shareFeedback.hidden = false;
  } catch {
    els.shareFeedback.textContent = text;
    els.shareFeedback.hidden = false;
  }
}

/* ── Language switch ── */
function setLanguage(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.body.lang = lang;

  applyStaticI18n();
  renderLevels();
  renderQuestions();

  if (lastResult) {
    showResult(lastResult.score, lastResult.level);
  }
}

/* ── Validation UI ── */
function markInvalidQuestions(answers) {
  $$(".question-card").forEach((card) => {
    const qId = card.dataset.question;
    card.classList.toggle("invalid", !answers[qId]);
    card.classList.toggle("unanswered", !answers[qId]);
  });
}

function clearInvalidMarks() {
  $$(".question-card").forEach((card) => {
    card.classList.remove("invalid", "unanswered");
  });
}

/* ── Event listeners ── */
function scrollToQuiz() {
  $("#quiz").scrollIntoView({ behavior: "smooth" });
}

function scrollToLevels() {
  $("#levels").scrollIntoView({ behavior: "smooth" });
}

function initHeaderScroll() {
  const header = $("#site-header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 50);
  });
}

function bindEvents() {
  $("#btn-start").addEventListener("click", scrollToQuiz);
  $("#btn-start-header")?.addEventListener("click", scrollToQuiz);
  $("#btn-levels")?.addEventListener("click", scrollToLevels);

  $$(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  els.quizForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const { answers, allAnswered } = collectAnswers();

    if (!allAnswered) {
      markInvalidQuestions(answers);
      els.quizHint.hidden = false;
      const firstInvalid = $(".question-card.invalid");
      firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    clearInvalidMarks();
    els.quizHint.hidden = true;
    saveAnswers(answers);

    const score = calculateScore(answers);
    const level = scoreToLevel(score);
    showResult(score, level);
  });

  $("#btn-share").addEventListener("click", shareResult);

  $("#btn-retry").addEventListener("click", () => {
    hideResult();
    sessionStorage.removeItem("eitpl-answers");
    renderQuestions();
    clearInvalidMarks();
    els.quizHint.hidden = true;
    $("#quiz").scrollIntoView({ behavior: "smooth" });
  });

  els.questionsContainer.addEventListener("change", () => {
    const { answers } = collectAnswers();
    saveAnswers(answers);
    markInvalidQuestions(answers);
    if (Object.keys(answers).length === QUESTIONS.length) {
      els.quizHint.hidden = true;
    }
  });
}

/* ── Init ── */
function init() {
  document.body.lang = currentLang;
  applyStaticI18n();
  renderLevels();
  renderQuestions();
  initHeaderScroll();
  bindEvents();
}

init();
