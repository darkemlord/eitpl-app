# EITPL — Guía para Claude

Escala Internacional de Tocada de Pelotas Laboral: quiz satírico que mide cuánto
"te tocan las pelotas" en el laburo. Sitio estático, sin backend, deployado en
GitHub Pages: https://darkemlord.github.io/eitpl-app/

## Arquitectura

Vanilla JS con ES modules (sin bundler, sin build step) siguiendo SOLID:

- `js/config/` — constantes, i18n (`i18n.js`, ES/EN/JA) y el pool de preguntas
  (`pool/meta.js` con metadata + peso, `pool/texts.<lang>.js` con los textos).
- `js/services/` — lógica sin DOM cuando es posible (`ScoringEngine`,
  `ResultUrlService`) y wrappers de plataforma (`StorageService`, `StatsService`,
  `ShareService`, `CertificateService`, `MetaTagService`, `QuestionPoolService`).
- `js/ui/` — renderers y binders que sí tocan el DOM.
- `js/controllers/` — `QuizController` conecta validación + scoring + eventos del form.
- `js/app/EitplApp.js` — orquestador único, wiring por inyección de dependencias
  en el constructor (DIP). Es el punto de entrada real; `js/main.js` solo lo instancia.

### Pool de preguntas y modos (importante para no romper el scoring)

- 100 preguntas en `QUESTION_POOL` (`js/config/pool/meta.js`), cada una con `weight` 1/2/3.
- Tres modos en `QUIZ_MODES` (`js/config/pool/meta.js`): **Express** (10
  preguntas), **Normal** (20), **Detallado** (30). El usuario elige uno en el
  `ModePicker` antes de empezar; no hay modo por defecto sin elegir.
- Ninguna pregunta está anclada por ID en ningún modo: `QuestionPoolService`
  arma cada sesión con `buildSeverityMix(length)`, que escala la proporción
  4 graves + 4 moderadas + 2 leves (cada 10 preguntas) según el modo. El score
  máximo teórico escala igual (22/44/66) — por eso el resultado se muestra
  **en porcentaje**, no en puntaje crudo, así es comparable entre modos.
- `ScoringEngine.evaluate(answers)` es el único punto de entrada de scoring:
  devuelve `{ score, maxScore, percentage, level }` en un solo llamado, para
  que ningún caller calcule score/percentage por separado y se desincronicen.
  `PERCENT_THRESHOLDS = [20, 40, 60, 80, 100]` en `constants.js` define los niveles.
- Si tocás el pool o la mezcla de severidad, verificá que la distribución de
  pesos completa siga teniendo stock suficiente (hoy: 30×peso1, 45×peso2,
  25×peso3 — detallado ya usa 12/12/6, el modo más exigente).
- Los textos de las 100 preguntas deben existir en `texts.es.js`, `texts.en.js`
  y `texts.ja.js` — sin huecos. Mismo criterio para las claves de `i18n.js`.
- `result.messages`/`result.actions` en `i18n.js` son arrays de variantes por
  nivel (no un string único): `ResultView.show()` elige una al azar y la
  persiste en la URL compartida (`?m=`) para que el link reproduzca el mismo chiste.

### Carrusel de preguntas

- El quiz ya no muestra todas las preguntas en una lista scrolleable: `QuizCarousel`
  pagina la sesión en pasos (1 pregunta por paso en mobile, 3 en desktop — mismo
  breakpoint que ya usa `styles.css`, 769px) y delega el dibujo de cada tarjeta
  al `QuizRenderer` existente (reuso, no reescritura).
- El tamaño de página se calcula **una sola vez** al elegir el modo (no hay
  recálculo en resize) y al recargar la página a mitad de test siempre se
  retoma en el paso 1 (simplificaciones deliberadas, ver el plan si hace falta
  más contexto).
- `QuizValidator.collectFromDom(subset)` ahora acepta un subconjunto opcional
  de preguntas, para validar solo el paso visible en vez de toda la sesión.
- `[hidden] { display: none !important; }` en `styles.css` es necesario porque
  `.btn` define su propio `display`, que si no gana por ser regla de autor
  sobre la regla `[hidden]` del user-agent stylesheet.

## Comandos

```bash
npm run serve      # sirve el sitio estático en :8765 (python3 -m http.server)
npm run test:unit  # node --test (unit tests puros, sin browser)
npm run test:e2e   # playwright (levanta el server solo si no hay uno corriendo)
npm run test       # unit + e2e
```

No hay paso de build: lo que está en `index.html`/`js/`/`styles.css` es lo que
se sirve tal cual en producción.

## Deploy

Push/merge a `main` → GitHub Pages redeploya solo (~1–3 min). No hay staging.

## Convención de commits

Formato obligatorio: `refs: <tipo> <descripción>` (ej: `refs: fix corrige favicon faltante`).
Tipos usuales: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`.

**Nunca** agregar línea `Co-Authored-By: Claude` ni similar — los commits se
firman como humanos, sin mención de coautoría de IA.

## Roadmap

El roadmap vive en `ROADMAP.local.md`, que está en `.gitignore` a propósito
(no se sube al repo). Si no lo encontrás en un checkout limpio, es esperado —
preguntale al usuario o pedile que lo comparta.
