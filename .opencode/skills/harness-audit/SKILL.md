---
name: harness-audit
description: Re-ejecuta la auditoría del arnés SDD/OpenCode y detecta regresiones de gobernanza (constitución, guards, tests, contrato, rutas, skills nativas).
---

# Harness audit (cm-oficial)

Esta skill reproduce la auditoría `session-ses_e8a0` y verifica que las 9 brechas sigan cerradas.

## Checklist rápido

1. **Constitución ratificada** — `02-DOCS/wiki/sdd/constitution.md` debe tener `status: ratified` y `version >= 1.0.0`.
2. **Invariantes comerciales** — existen las secciones §3.1-§3.4 con códigos INV-*.
3. **Contrato PHP** — `npm test` ejecuta `tests/contract/php-api.contract.spec.js` y no hay fallos.
4. **Guards peligrosos** — `opencode.json` contiene `deny` para `git reset --hard`, `git clean -fdx`, `mysql * DROP *`.
5. **Suite real** — `npm test` no termina con "No test files found".
6. **Rutas protegidas** — `src/config/routePolicy.js` existe y `tests/unit/route-policy.spec.js` pasa.
7. **config.yaml** — `02-DOCS/wiki/sdd/config.yaml` existe con `test_bar`, `reviewers_required`, `sensitive_modules`.
8. **index.md** — `02-DOCS/wiki/index.md` enlaza constitution, config y route-policy.
9. **Skills nativas** — existen `.opencode/skills/*/SKILL.md` con frontmatter `name`/`description`.

## Cómo usar

Ejecuta los comandos de verificación y reporta cada punto con PASS/FAIL. Si algo falla,
apunta al archivo y línea exactos y propone el parche mínimo.
