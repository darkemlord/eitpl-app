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
- Cada sesión usa 10 preguntas **sin ningún ID fijo**: `QuestionPoolService` arma
  la sesión respetando slots de severidad `SESSION_SLOTS = [3,3,3,3,2,2,2,2,1,1]`
  (4 graves + 4 moderadas + 2 leves, suman 22). Esto garantiza que el score
  máximo sea **siempre 22** (`MAX_SCORE`/`THRESHOLDS` en `constants.js`) y que
  la severidad esté balanceada, sin repetir nunca las mismas preguntas por ID.
- Si tocás el pool o los slots, verificá que la distribución de pesos completa
  siga teniendo stock suficiente para los slots (hoy: 30×peso1, 45×peso2, 25×peso3).
- Los textos de las 100 preguntas deben existir en `texts.es.js`, `texts.en.js`
  y `texts.ja.js` — sin huecos. Mismo criterio para las claves de `i18n.js`.
- `result.messages`/`result.actions` en `i18n.js` son arrays de variantes por
  nivel (no un string único): `ResultView.show()` elige una al azar y la
  persiste en la URL compartida (`?m=`) para que el link reproduzca el mismo chiste.

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
