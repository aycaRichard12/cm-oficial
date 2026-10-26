---
type: plan
title: Plan — Tema oscuro con preferencia guardada
description: Structure-level plan for a light/dark theme with persisted, system-aware preference.
tags: [sdd, plan]
timestamp: 2026-10-26T13:00:00Z
topic: sdd
slug: tema-oscuro
status: approved
---

# Plan — Tema oscuro con preferencia guardada

> Spec: [../specs/tema-oscuro.md](../specs/tema-oscuro.md) · Constitution: [../constitution.md](../constitution.md) · Status: approved
> Last updated: 2026-10-26

## 0. Global Constraints

- **Framework canon:** Quasar 2 + Vue 3 (`<script setup>`), Vite 5. No new UI framework.
- **Testing:** Vitest for unit/contract; Playwright for e2e against the real app (never `playwright.dev`).
- **Coverage:** ≥ 70% lines in touched modules; 100% on constitution §3 invariants (none touched by this feature).
- **Lint:** `npm run lint` with ESLint flat config; zero errors at merge.
- **Toggle accessibility:** accessible name, keyboard operable, state announced; icon-only buttons carry `aria-label` (constitution §7).
- **Contrast:** normal text ≥ 4.5:1 (WCAG AA) on its background in both themes.
- **Preference storage key:** `mistersofts-cm-theme`; value exactly `light` or `dark`; key absent means "follow system".
- **Theme switch:** Quasar `Dark` plugin is the single switch; dark state is `body.body--dark`.
- **Token namespace:** CSS custom properties prefixed `--cm-` (e.g. `--cm-bg`, `--cm-surface`, `--cm-text`).
- **Print/export:** always light regardless of active theme.
- **Naming:** files `kebab-case`; Vue components `PascalCase`; commits Conventional Commits.
- **Branching:** feature branch → PR; `main`/`develop` protected (`config.yaml`).
- **Performance:** initial bundle ≤ 1.5 MB gzip; FCP ≤ 2.5 s on 3G.
- **No secrets** in repo or logs.

## 1. Context & constraints

- Acceptance criteria shaping the design: spec §Acceptance #1 (first render), #3–#4 (instant toggle), #5–#6 (persistence), #7 (all screens), #8 (charts/maps/tours), #9 (multi-tab), #10 (print), #11 (a11y), #12 (invalid stored value), #13 (no flash).
- Clarified decisions: multi-tab sync; charts/maps/tours adapt; AA 4.5:1; login/404 themed; preference applied before first paint.
- Constitution rules in play: stack canon §1, quality bar §2, conventions §4, security §6, UX/a11y §7, performance §8.
- Existing reality: 337 hardcoded light-colour occurrences across 120 files; chart options are plain objects; one Leaflet map with Google satellite tiles; PDFs split between jsPDF (white by construction) and `html2pdf` DOM capture.
- Out of scope (must not creep in): cross-device sync, per-tenant themes, theme picker > 2, custom colours, scheduling, exported/printed dark documents, visual redesign.

## 2. Architecture

```text
index.html inline pre-paint script ──> <body class="body--dark"> + <html data-theme>
                                                │
                                                ▼
src/boot/theme.js ──> stores/theme.js (Pinia) ──> Quasar Dark.set()
        │                     │                        │
        │                     ├── storage (key mistersofts-cm-theme)
        │                     ├── matchMedia('(prefers-color-scheme: dark)')
        │                     └── window 'storage' event (multi-tab)
        │
        ├──> components/ThemeToggle.vue (HeaderLayout)
        ├──> composables/useChartTheme.js (ApexCharts options)
        └──> utils/with-light-capture.js (html2pdf guard)

src/css/theme.scss ──> :root tokens (light) + body.body--dark tokens (dark)
                   ──> compatibility overrides (.bg-white, .text-grey-9, tables, forms)
                   ──> @media print light guard
```

- **Pre-paint script** (internal) — reads the stored key and `prefers-color-scheme`, then sets the body/html classes before the app bundle executes. Single responsibility: eliminate the first-paint flash.
- **Theme store** (internal) — owns `mode` (`light|dark`), `source` (`manual|system`), reads/writes storage, applies via Quasar `Dark`, listens to OS and multi-tab changes.
- **Theme resolver** (internal, pure) — turns `(storedValue, systemPrefersDark)` into `{mode, source}`; rejects unknown stored values. Testable without a DOM.
- **Token layer** (internal) — light and dark values for app surfaces/text/borders, plus a compatibility layer for legacy Quasar utility classes and hardcoded patterns.
- **Theme toggle** (internal) — one icon button in the header; reads/writes the store; carries `aria-label`/`aria-pressed`.
- **Chart theme helper** (internal) — maps theme to ApexCharts `foreColor`/grid/legend/palette.
- **Light-capture guard** (internal) — temporarily forces light styles on a DOM subtree around `html2pdf` capture.
- **Leaflet map / driver.js tours** (external) — third-party visuals themed through CSS and, for charts, options.
- **Quasar Dark plugin** (external) — supplies built-in dark variants for Quasar components.
- **jsPDF generators** (external) — draw on white internally; stay untouched.

**Top architectural decision:** use **Quasar's `Dark` plugin as the only switch**, layered with a `--cm-*` token system, instead of a parallel custom `data-theme` system. It is chosen because Quasar already ships dark variants for its components; duplicating that with a custom attribute would double maintenance and leave components behind. The cost is fighting specificity in the compatibility layer, which is contained under `body.body--dark` and audited per screen.

*Alternative considered:* a fully custom `data-theme` system. More control, but it would require re-styling every Quasar component and contradicts the "whole app" scope within the budget. Rejected.

## 3. Interfaces & contracts

```text
resolveTheme(storedValue: string | null, systemPrefersDark: boolean)
  -> { mode: 'light' | 'dark', source: 'manual' | 'system' }
  - storedValue in {'light','dark'} => source 'manual', mode = storedValue
  - storedValue null | '' | any other value => source 'system', mode from systemPrefersDark
  - never throws
```

```text
createThemeController({ storage, media, apply, root })
  -> { getState(), setMode(mode), destroy() }
  - getState() => { mode, source }
  - setMode('light'|'dark') => persists raw value, sets source 'manual', calls apply(mode)
  - storage write failure => keeps in-memory state, does not throw (spec §Behaviour error path)
  - media change observed only while source === 'system'
  - storage event for the key => re-resolves and applies in every tab
  - destroy() removes listeners
  - precondition: apply() is idempotent
```

```text
useThemeStore()
  - state: mode, source, initialized
  - init(): resolves stored/system, applies, subscribes
  - toggle(): setMode(opposite of current)
  - isDark: computed
  - never persists on init (only explicit user choice persists)
```

```text
chartTheme(isDark: boolean)
  -> { foreColor, gridColor, tooltipTheme, legendLabelColor, palette }
  - both themes return a contrast-checked palette
```

```text
withLightCapture(element, capture: () => Promise<void>) -> Promise<void>
  - adds a light-capture class to element, awaits capture, always removes it
  - guarantees removal on rejection (finally)
  - does not mutate the persisted theme
```

```text
ThemeToggle.vue
  props: none
  emits: none
  - renders sun in light, moon in dark
  - aria-label: "Cambiar a modo oscuro" / "Cambiar a modo claro"
  - aria-pressed reflects dark state
  - <q-tooltip> with the same text
```

## 4. Data model & flow

**Entities**

- **Theme preference** — one scalar record: key `mistersofts-cm-theme`, value `light|dark`, absent = system. No server model, no migration.
- **Theme state** — in-memory `{ mode, source }`; derived from preference + OS media query.
- **Design tokens** — two token sets (light/dark) under `:root` and `body.body--dark`:

| Token | Light | Dark |
| --- | --- | --- |
| `--cm-bg` | `#eeebe2` | `#121212` |
| `--cm-surface` | `#ffffff` | `#1e1e1e` |
| `--cm-surface-2` | `#fafafa` | `#252525` |
| `--cm-text` | `#1f2937` | `#e5e7eb` |
| `--cm-text-muted` | `#6b7280` | `#9ca3af` |
| `--cm-border` | `#e0e0e0` | `#3a3a3a` |
| `--cm-header` | `#eeebe2` | `#181818` |

**Primary flow** (toggle)

1. Pre-paint script sets `body--dark` if the stored value is `dark`, or if absent and the OS prefers dark.
2. `boot/theme.js` initialises the store, which re-resolves and calls Quasar `Dark.set(mode === 'dark')`.
3. User presses `ThemeToggle` → store `toggle()` → `setMode` persists `mistersofts-cm-theme` and applies.
4. The `storage` event reaches other tabs → each re-resolves and applies without persisting.

- Consistency boundaries: storage write + in-memory state are best-effort, not transactional; applying the visual theme is synchronous.
- Migration impact: none. Existing users have no key → system preference applies on first load; users who already use OS dark will start dark (accepted in spec).
- Logout impact: `MainLayout.irdashboard` only removes session keys; the theme key survives by design.

## 5. Testing strategy

| Acceptance criterion | Level | Asserts | Fakes / mocks |
| --- | --- | --- | --- |
| #1 no pref + OS dark → dark first render | unit + e2e | resolver returns dark/system; login page body has `body--dark` on load | fake media `matches: true`; e2e emulates `colorScheme: 'dark'` |
| #2 no pref + OS light → light | unit + e2e | resolver returns light/system; body has no dark class | fake media `matches: false`; e2e `colorScheme: 'light'` |
| #3 toggle → dark without reload | unit + e2e | `toggle()` applies dark and persists `dark` | fake storage/apply; e2e logged-in page |
| #4 toggle back → light | unit + e2e | `toggle()` applies light and persists `light` | same |
| #5 chose dark → reopen dark | unit | controller reads stored `dark` and applies it | fake storage preloaded |
| #6 chose light while OS dark → reopen light | unit | stored `light` wins over system | fake media `matches: true` |
| #7 all screens no light panels, AA | static + manual audit | token guard test forbids legacy light literals in touched files; audit checklist per screen group | static scan test |
| #8 charts/maps/tours themed | unit + manual | `chartTheme(true)` returns dark palette; map/tour visual audit | pure helper |
| #9 two tabs sync | unit | `storage` event re-resolves and applies | fake event target |
| #10 print/PDF light | unit + e2e | `withLightCapture` adds/removes class even on failure; print emulation keeps white background | fake DOM element; e2e `page.emulateMedia({media:'print'})` |
| #11 keyboard + announced state | e2e | toggle reachable by Tab, Enter/Space toggles, `aria-pressed` flips | e2e |
| #12 corrupt stored value → system | unit | resolver ignores invalid value, returns system | fake storage `'blue'` |
| #13 no flash on reload | e2e | dark class present before app mount; no light frame in screenshot sequence | e2e with stored `dark` |

- **Unit** runs in Vitest `node`; no jsdom added. Pure resolver and controller are injected with fake `storage`, `media`, `apply`, and event targets.
- **E2E** runs in Playwright against the real app via `webServer` (`npm run dev`). Login-page checks need no credentials; authenticated checks need a test user or a session fixture — see open decisions.
- **Visual coverage** of every module is a manual audit checklist (the automated line cannot prove "no light panel" across 120 files); the static token guard plus spot screenshots narrow the gap.
- **Real dependency required:** the e2e must hit the real Quasar app and real CSS, not a mock; storage and media emulation are the only fakes.

## 6. Sequencing & dependencies

1. **Foundation** — `theme.scss` tokens + compatibility layer skeleton, add `Dark` plugin, theme resolver, controller, Pinia store, `boot/theme.js`, inline pre-paint script, `ThemeToggle.vue` in header. Depends on: none. **Serial.**
2. **Global shell theme** — `App.vue`, `MainLayout.vue`, `HeaderLayout.vue`, `LoginPage.vue`, base rules in `app.scss`. Depends on #1. **Serial.**
3. **Shared surfaces** — tables, forms, dialogs, menus, notifications, empty states, `.responsive-qtable-container`, `label`, `thead` overrides. Depends on #1. **Serial.**
4. **Module page sweep** — group A ventas/cotización, B compras/inventario, C cuentas/caja, D reportes/dashboard, E configuración/auth. Depends on #2, #3. **Parallelizable across groups.**
5. **Third-party visuals** — `useChartTheme` + refactor 12 chart files; Leaflet controls/attribution; driver.js popover theme. Depends on #1. **Parallel with #4.**
6. **Print/PDF guard** — `withLightCapture` around the two `html2pdf` pages; global `@media print` light rules. Depends on #1. **Parallel with #4/#5.**
7. **Audit & regression guard** — screen-by-screen contrast audit, static token guard test, e2e suite. Depends on #4, #5, #6. **Serial.**
8. **Verify** — `npm run lint`, `npm test`, e2e; record evidence. Depends on #7. **Serial.**

- Parallel candidates: #4 groups, #5, #6 (disjoint files; #5 and #6 do not touch page shells).
- Hard ordering: #1 before everything (tokens/store/toggle); #7 after all visual changes so the audit sees the final state.

## 7. Risks & open decisions

**Risks**

| Risk | Trigger | Impact | Mitigation / spike to retire it |
| --- | --- | --- | --- |
| Inconsistent coverage across 120 files | hardcoded colours missed in sweep | visible light panels in dark mode | token layer + compatibility overrides first, then per-module audit checklist; static guard test lists offenders |
| Specificity wars with `!important` | overriding inline styles/utility classes | some components stay light or break | prefer token replacement in source; restrict overrides under `body.body--dark`; document exceptions |
| Flash of wrong theme | inline script missing/blocked | violates AC #13 | inline script before entry point; e2e asserts class before mount |
| `html2pdf` captures dark DOM | exporting while dark | dark PDF, violates AC #10 | `withLightCapture` with `finally`; e2e print emulation |
| ApexCharts options are non-reactive objects | theme change without re-render | charts keep light palette | convert options to `computed`/theme-aware helper and force update on theme change |
| Leaflet satellite tiles stay bright | imagery is not theme-aware | map looks out of place | theme controls/attribution; evaluate a dark filter on the tile pane; accept imagery if contrast is fine |
| driver.js version mismatch | v1 package vs legacy API in `useDriver` | tours already fragile; theming may not apply | theme via CSS on popover classes; do not refactor the tour API in this feature |
| Logo/assets invisible on dark | `nombre.png`/`fondo.jpeg` with light/transparent pixels | broken branding | audit assets; add a dark-safe background or variant, not a redesign |
| e2e cannot authenticate | no test user/fixture | authenticated checks unproven | open decision below; fall back to manual audit + unit proof |
| Bundle growth | tokens + helper code | stays under budget | CSS variables only; no new runtime dependency |

**Open decisions**

- **How to authenticate Playwright for the toggle checks** — closes when a test user or a session fixture (`mistersofts-cm`) is provided. Until then, e2e covers the login page and print emulation; toggle/persistence are proven at unit level and by manual audit.
- **Whether the Leaflet imagery needs a dark filter** — closes after the visual spike on the single map screen; if the satellite layer reads acceptably dark, no filter is added.

## Tasks
<!-- generated by tasks on 2026-10-26; IDs are stable, do not renumber -->

| ID | [P] | Task | Done-check | Depends-on | Trace |
| --- | --- | --- | --- | --- | --- |
| T001 | [P] | Escribir tests que fallen del resolver de tema | `npx vitest run tests/unit/theme-resolver.spec.js` falla porque el módulo no existe | — | spec §Acceptance #1, #2, #12 |
| T002 |  | Implementar `src/utils/theme-resolver.js` | T001 en verde | T001 | spec §Acceptance #1, #2, #12 |
| T003 | [P] | Escribir tests que fallen del controlador de tema | `npx vitest run tests/unit/theme-controller.spec.js` falla porque el módulo no existe | — | spec §Acceptance #5, #6, #9 y §Behaviour error path |
| T004 |  | Implementar `src/utils/theme-controller.js` | T003 en verde | T002, T003 | spec §Acceptance #5, #6, #9 |
| T005 | [P] | Escribir test que falle de `chartTheme` | `npx vitest run tests/unit/chart-theme.spec.js` falla porque el módulo no existe | — | spec §Acceptance #8 |
| T006 |  | Implementar `src/composables/useChartTheme.js` | T005 en verde | T005 | spec §Acceptance #8 |
| T007 | [P] | Escribir test que falle de `withLightCapture` | `npx vitest run tests/unit/with-light-capture.spec.js` falla porque el módulo no existe | — | spec §Acceptance #10 |
| T008 |  | Implementar `src/utils/with-light-capture.js` | T007 en verde; la clase se retira también cuando la captura rechaza | T007 | spec §Acceptance #10 |
| T009 | [P] | Escribir test estático que falle de tokens CSS y print | `npx vitest run tests/unit/theme-css.spec.js` falla: faltan `--cm-bg`, `body--dark` y el bloque `@media print` | — | spec §Acceptance #7, #10 |
| T010 |  | Crear `src/css/theme.scss` e importarlo desde `app.scss` | T009 en verde; `npm run lint` sin errores | T009 | spec §Acceptance #7, #10 |
| T011 | [P] | Escribir test estático que falle del cableado del tema | `npx vitest run tests/unit/theme-wiring.spec.js` falla: faltan plugin `Dark`, boot `theme` y script anti-destello | — | spec §Acceptance #1, #13 |
| T012 |  | Cablear plugin `Dark`, `boot/theme.js`, boot en `quasar.config.js` y script inline en `index.html` | T011 en verde; `npm run lint` sin errores | T011 | spec §Acceptance #1, #13 |
| T013 | [P] | Escribir test estático que falle del interruptor accesible | `npx vitest run tests/unit/theme-toggle.spec.js` falla: no existe `ThemeToggle.vue` ni su uso en el header | — | spec §Acceptance #11 |
| T014 |  | Crear store Pinia `src/stores/theme.js` sobre el controlador | `npm run lint` sin errores; el store expone `mode`, `source`, `init`, `toggle`, `isDark` | T004, T012 | spec §Acceptance #3–#6, #9 |
| T015 |  | Crear `src/components/ThemeToggle.vue` y colocarlo en `HeaderLayout.vue` | T013 en verde; `npm run lint` sin errores | T013, T014 | spec §Acceptance #3, #11 |
| T016 |  | Sustituir colores fijos por tokens en `App.vue`, `MainLayout.vue`, `HeaderLayout.vue` y `LoginPage.vue` | `npx vitest run tests/unit/theme-guard.spec.js` no reporta literales prohibidos en esos archivos; `npm run lint` sin errores | T010, T014, T015 | spec §Acceptance #7 |
| T017 |  | Añadir overrides de compatibilidad para tablas, formularios, diálogos, menús y utilidades en `theme.scss` | `npx vitest run tests/unit/theme-css.spec.js` en verde con los selectores exigidos; `npm run lint` sin errores | T010 | spec §Acceptance #7 |
| T018 | [P] | Barrer módulo ventas/cotización a tokens | `npx vitest run tests/unit/theme-guard.spec.js` sin literales prohibidos en `src/pages/Venta`, `src/pages/cotizacion`, `src/components/venta`, `src/components/cotizacion`; lint verde | T016, T017 | spec §Acceptance #7 |
| T019 | [P] | Barrer módulo compras/inventario a tokens | `npx vitest run tests/unit/theme-guard.spec.js` sin literales prohibidos en `src/pages/compra`, `src/pages/producto`, `src/pages/inventario`, `src/components/compra`, `src/components/producto`; lint verde | T016, T017 | spec §Acceptance #7 |
| T020 | [P] | Barrer módulo cuentas/caja a tokens | `npx vitest run tests/unit/theme-guard.spec.js` sin literales prohibidos en `src/pages/cuentasxcobrar`, `src/pages/cierrecaja`, `src/components/cuentasxCobrar`; lint verde | T016, T017 | spec §Acceptance #7 |
| T021 | [P] | Barrer módulo reportes/dashboard a tokens | `npx vitest run tests/unit/theme-guard.spec.js` sin literales prohibidos en `src/pages/dashboard`, `src/pages/reportes`, `src/components/reporte`, `src/components/dasboardVendedor`; lint verde | T016, T017 | spec §Acceptance #7 |
| T022 | [P] | Barrer configuración/auth/quick-consult a tokens | `npx vitest run tests/unit/theme-guard.spec.js` sin literales prohibidos en `src/pages/config`, `src/pages/auth`, `src/modules/quick-consult`, `src/components/actualizaciones`; lint verde | T016, T017 | spec §Acceptance #7 |
| T023 | [P] | Hacer reactivas las opciones de ApexCharts con `chartTheme` en dashboard y reportes | `npx vitest run tests/unit/chart-theme.spec.js` en verde; `grep -rIn "background: white" src/components/reporte src/components/dasboardVendedor` sin resultados; lint verde | T006, T021 | spec §Acceptance #8 |
| T024 | [P] | Hacer reactivas las opciones de ApexCharts en `ReportesUtilidades` | `npx vitest run tests/unit/chart-theme.spec.js` en verde; sin fondos claros fijos en `src/modules/ReportesUtilidades`; lint verde | T006, T021 | spec §Acceptance #8 |
| T025 |  | Tematizar controles/atribución de Leaflet y decidir el filtro de tiles | Observación: captura del mapa en oscuro sin controles ilegibles; decisión del filtro registrada en `decisions.md`; lint verde | T010 | spec §Acceptance #8 |
| T026 |  | Tematizar popovers de driver.js en `theme.scss` | `npx vitest run tests/unit/theme-css.spec.js` en verde con selectores de tour exigidos; lint verde | T010 | spec §Acceptance #8 |
| T027 |  | Envolver las dos capturas `html2pdf` con `withLightCapture` | `grep -rIn "withLightCapture" src/pages/reportes/reportedeindicederotacionPage.vue src/pages/reportes/rotacionGlobalPage.vue` devuelve una llamada por archivo; lint verde | T008, T017 | spec §Acceptance #10 |
| T028 |  | Añadir reglas globales de impresión clara en `theme.scss` | `npx vitest run tests/unit/theme-css.spec.js` en verde con el bloque print forzando fondo claro; lint verde | T010, T027 | spec §Acceptance #10 |
| T029 |  | Escribir e2e Playwright del tema en login y del no-destello | `npx playwright test tests/e2e/theme-login.spec.js` en verde con `webServer` configurado | T012, T015 | spec §Acceptance #1, #2, #13 |
| T030 |  | Escribir e2e Playwright de impresión clara | `npx playwright test tests/e2e/theme-print.spec.js` en verde o skip documentado si falta fixture de sesión | T027, T028 | spec §Acceptance #10 |
| T031 |  | Añadir guard estático de literales prohibidos y auditoría de pantallas | `npx vitest run tests/unit/theme-guard.spec.js` en verde; checklist de auditoría completado en la sesión | T018–T022, T025, T026 | spec §Acceptance #7, #8 |
| T032 |  | Regresión final y handoff a verify | `npm run lint` y `npm test` exit 0; `npx playwright test` exit 0 o skips documentados | all | spec §Acceptance (todas) |

**T002 — Interfaces**
- Consumes: nada.
- Produces: `resolveTheme(storedValue: string|null, systemPrefersDark: boolean) -> {mode:'light'|'dark', source:'manual'|'system'}`; never throws; invalid/absent → system.

**T004 — Interfaces**
- Consumes: `resolveTheme` (T002).
- Produces: `createThemeController({storage, media, apply, eventTarget, storageKey}) -> {getState(), setMode(mode), destroy()}`; `getState() -> {mode, source}`; storage write failure must not throw; `storage` event re-applies.

**T006 — Interfaces**
- Consumes: nothing.
- Produces: `chartTheme(isDark: boolean) -> {foreColor, gridColor, tooltipTheme, legendLabelColor, palette}`.

**T008 — Interfaces**
- Consumes: nothing.
- Produces: `withLightCapture(element, capture: () => Promise<void>) -> Promise<void>`; adds the light-capture class, always removes it in `finally`.

**T012 — Interfaces**
- Consumes: `resolveTheme` (T002), key `mistersofts-cm-theme`.
- Produces: `body.body--dark` set before app entry; `Dark` plugin enabled; boot `theme` registered.

**T014 — Interfaces**
- Consumes: `createThemeController` (T004), `Dark.set` (Quasar).
- Produces: `useThemeStore()` with `mode`, `source`, `initialized`, `isDark`, `init()`, `toggle()`.

**T015 — Interfaces**
- Consumes: `useThemeStore()` (T014).
- Produces: `ThemeToggle.vue` with `aria-label` ("Cambiar a modo oscuro"/"Cambiar a modo claro"), `aria-pressed`, tooltip; imported by `HeaderLayout.vue`.

**T027 — Interfaces**
- Consumes: `withLightCapture` (T008).
- Produces: both `html2pdf` calls wrapped; the persisted theme is not mutated.

## Review Workload Forecast

| Dimension | Forecast | Why |
| --- | --- | --- |
| Estimated changed lines | 1.800–2.800 | 337 literales en 120 archivos + store/controlador/tests/CSS nuevos |
| Files / areas | ~135 archivos: CSS, stores, boot, utils, layouts, 5 grupos de módulos, charts, PDF, tests | barrido transversal de UI |
| Review risk | high | cambio visual masivo y difícil de verificar automáticamente en todas las pantallas |
| Suggested delivery | stacked-prs (3) | supera el budget por defecto de 400 líneas; dividir en: (1) base+tokens+store+toggle, (2) barrido de módulos, (3) charts/mapas/tours/PDF/e2e |

- Estrategia recomendada: 3 PRs apilados sobre `feat/tema-oscuro`, cada uno con su propio verify; el riesgo visual se revisa por grupo de pantallas.
- El trabajo `[P]` se puede abrir en worktrees separados por grupo de módulos, pero el barrido comparte `theme.scss` y el guard test: coordinar T016/T017 antes de fan-out.
