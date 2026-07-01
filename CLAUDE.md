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

### Pool de preguntas (importante para no romper el scoring)

- 100 preguntas en `QUESTION_POOL` (`js/config/pool/meta.js`), cada una con `weight` 1/2/3.
- Cada sesión usa 10: 4 "anclas" fijas (`ANCHOR_IDS`, suman peso 11) + 6 random
  elegidas por `QuestionPoolService` respetando slots de peso `[3,2,2,2,1,1]`
  (suman 11). Esto garantiza que el score máximo sea **siempre 22**
  (`MAX_SCORE`/`THRESHOLDS` en `constants.js`) sin importar qué random toque.
- Si tocás el pool o los slots, verificá que la distribución de pesos no-ancla
  siga teniendo stock suficiente para los slots (hoy: 30×peso1, 44×peso2, 22×peso3).
- Los textos de las 100 preguntas deben existir en `texts.es.js`, `texts.en.js`
  y `texts.ja.js` — sin huecos. Mismo criterio para las claves de `i18n.js`.

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
