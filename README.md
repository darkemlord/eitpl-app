# EITPL — Escala Internacional de Tocada de Pelotas Laboral

Quiz satírico que mide cuánto te están tocando las pelotas en el laburo.
Sitio 100% estático (vanilla JS + ES modules, sin build step).

**Demo en vivo:** https://darkemlord.github.io/eitpl-app/

## Correr en local

Requiere Python 3 (para el servidor estático) y Node.js (para tests).

```bash
npm install    # instala devDependencies (Playwright, jsdom)
npm run serve  # sirve el sitio en http://localhost:8765
```

Abrí [http://localhost:8765](http://localhost:8765) en el navegador. No hay
paso de compilación: lo que edites en `index.html`, `js/` o `styles.css` se
recarga tal cual con un refresh de la página.

## Tests

```bash
npm run test:unit   # unit tests (node --test): ScoringEngine, QuizValidator, ResultUrlService
npm run test:e2e    # Playwright: flujo completo en navegador (requiere Chrome instalado)
npm test            # unit + e2e
```

`test:e2e` levanta el servidor estático automáticamente si no hay uno
corriendo en el puerto 8765 (ver `playwright.config.js`).

## Estructura del proyecto

```
index.html              # markup + metadata OG/Twitter
styles.css              # estilos (dark theme, mobile-first)
js/
  config/               # constantes, i18n (ES/EN/JA) y pool de 100 preguntas
  services/             # lógica de negocio y wrappers de plataforma (storage, share, stats...)
  ui/                    # renderers y binders que tocan el DOM
  controllers/           # QuizController: conecta form + validación + scoring
  app/EitplApp.js        # orquestador único (wiring por inyección de dependencias)
e2e/                    # tests Playwright
test/                   # unit tests (node --test)
data/stats.json         # stats "en vivo" — hoy es un snapshot estático
scripts/stats-ingest.gs # Google Apps Script opcional para ingestar stats reales
assets/og/              # imágenes Open Graph por nivel
```

## Cómo funciona el quiz

- Pool de 100 preguntas (`js/config/pool/meta.js`), cada una con peso 1/2/3.
- Cada sesión toma 10 preguntas al azar, sin IDs fijos, respetando una mezcla de
  severidad de 4 graves + 4 moderadas + 2 leves (siempre suma 22). Esto garantiza
  que el puntaje máximo sea siempre **22** y que ninguna sesión sea "más fácil"
  que otra, sin importar qué preguntas random te toquen.
- El resultado (mensaje + acción recomendada) también varía: cada nivel tiene
  varias versiones y se elige una al azar en cada diagnóstico, para que no te
  salga siempre el mismo chiste.
- El resultado es compartible por URL (`?l=&s=&lang=&m=`), por WhatsApp o como
  certificado PNG descargable — el link compartido reproduce el mismo chiste
  que vio la persona que lo mandó.

## Deploy

Push o merge a `main` → GitHub Pages redeploya solo (~1–3 min). No hay entorno
de staging.

## Para contribuir

Ver [CLAUDE.md](CLAUDE.md) para la convención de commits y más contexto de
arquitectura pensado para trabajar con Claude Code.
