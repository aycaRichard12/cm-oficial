---
type: analysis
title: Análisis de consistencia — tema oscuro (re-ejecución)
description: Segundo gate pre-implementación tras corregir plan y tareas.
tags: [sdd, analysis]
timestamp: 2026-10-26T15:00:00Z
topic: sdd
slug: tema-oscuro
status: passed
---

# Análisis de consistencia — `tema-oscuro` (re-ejecución)

> Gate pre-implementación · 2026-10-26 · Regla: reportar, no resolver.

## Veredicto

**GATE: PASS** — 0 CRITICAL, 0 HIGH, 2 MEDIUM, 3 LOW.

Los bloqueos de la primera pasada están cerrados. Quedan dos verificaciones débiles y tres detalles, ninguno impide implementar; el usuario debe aceptarlos conscientemente.

## Correcciones aplicadas desde la primera pasada

| Antes | Corrección |
| --- | --- |
| F1 cobertura parcial de "toda la app" | Guard global en T031 + barridos closers T033/T034 sobre todas las páginas, módulos, componentes y layouts |
| F2 sin pantallas de error | `ErrorNotFound.vue` añadido a plan §6 y T016 |
| F3 accesibilidad sin prueba de comportamiento | T036: test de componente con `@vue/test-utils` + `happy-dom`; plan §5 cambiado de e2e a component |
| F4 guard creado después de usarlo | T031 redefine como creación del guard (rojo) y pasa a ser dependencia de T016/T018–T022 |
| F5 falso `[P]` T021/T023 | `[P]` retirado de T023; dependencias de T034 ampliadas a los tasks visuales |
| F6 tokens y prohibidos invisibles | Lista exacta de tokens y literales en plan §0 + Interfaces de T031 |
| F7 contraste sin medición | T037: test WCAG de pares de tokens; T035 exige artefacto de auditoría |
| F8 e2e de impresión con skip | T030 ahora es pública (login), sin skip; T032 exige Playwright verde |
| F9 sin cobertura ni bundle | T038 (cobertura 70% con `@vitest/coverage-v8`) y T039 (bundle gzip + FCP) |
| F10 done-checks manuales sin artefacto | T025 guarda captura; T035 exige `verifications/tema-oscuro-audit.md` sin pendientes |
| F11 dependencias no literales | T032 y T035 listan IDs uno a uno |
| F12 feedback no declarado | Plan §3: el cambio visual es la confirmación, sin toast |
| F13 header no verificado | Plan §2: `HeaderLayout` solo lo monta `MainLayout` (ruta autenticada) |
| F14 grep débil | T023 usa el guard global en vez del grep puntual |

## Mapa de cobertura

| REQ-ID | Requisito (spec) | Plan | Tareas | Estado |
| --- | --- | --- | --- | --- |
| R1 | AC#1 sin pref + SO oscuro → oscuro en primer render | §2, §4, §5 | T001, T002, T011, T012, T029 | covered |
| R2 | AC#2 sin pref + SO claro → claro | §2, §4, §5 | T001, T002, T011, T012, T029 | covered |
| R3 | AC#3 alternar a oscuro sin recargar | §3, §4, §5 | T003, T004, T014, T015, T036 | covered |
| R4 | AC#4 alternar de vuelta a claro | §3, §4, §5 | T003, T004, T014, T015, T036 | covered |
| R5 | AC#5 elección oscuro persiste al reabrir | §3, §4 | T003, T004, T014 | covered |
| R6 | AC#6 claro gana sobre SO oscuro | §3, §4 | T003, T004, T014 | covered |
| R7 | AC#7 todas las pantallas sin paneles claros + AA | §2, §5, §6 | T016–T022, T031, T033–T035, T037 | covered |
| R8 | AC#8 gráficos, mapas y tours | §2, §3, §6 | T023–T026, T034 | covered |
| R9 | AC#9 sincronización entre pestañas | §3, §4 | T003, T004, T014 | covered |
| R10 | AC#10 print/PDF siempre claro | §3, §6 | T007, T008, T027, T028, T030 | covered |
| R11 | AC#11 teclado + estado anunciado | §3, §5 | T013, T015, T036 | covered |
| R12 | AC#12 preferencia corrupta → sistema | §3 | T001, T002 | covered |
| R13 | AC#13 sin destello al recargar | §2, §4, §5 | T011, T012, T029 | covered |
| G1 | Login y pantallas de error tematizados | §1, §6 | T016 | covered |
| G2 | "Toda la app" incluye todos los módulos | §6 | T033, T034 | covered |
| B1 | Cambio del SO en vivo si no hay elección manual | §3 | T003, T004 | covered |
| B2 | Fallo al guardar no bloquea | §3 | T003, T004 | covered |
| B3 | Imágenes/logos legibles en oscuro | §7 (riesgo) | T035 (auditoría) | **AMBIGUOUS** (sin inventario de activos) |

## Hallazgos restantes

| # | Severidad | Tipo | Artefacto A (loc) | Artefacto B (loc) | Conflicto | Resolver en |
| --- | --- | --- | --- | --- | --- | --- |
| M1 | MEDIUM | Ambiguity | spec §Points to clarify ("área no formulable": imágenes/logos) | plan §7 (riesgo); T035 | La auditoría no enumera qué activos revisar ni el criterio de legibilidad | tasks (ampliar T035) |
| M2 | MEDIUM | Verificación débil | constitution §8 (FCP ≤ 2.5 s) | T039 (registro manual de FCP) | El presupuesto de FCP no tiene medición automatizada; solo se anota | tasks (opcional: Lighthouse o aceptar riesgo) |
| L1 | LOW | Verificación débil | T035 (`sin PENDIENTE`) | — | Un archivo de auditoría superficial podría pasar; la revisión humana de `verify` lo cubre | verify |
| L2 | LOW | Ambiguity | plan §7 (regex exacta del guard) | plan §0 (lista fija) | El patrón concreto se decide en T031; la lista está fijada | tasks (T031) |
| L3 | LOW | Tooling | plan §0 (stack canon) | T036/T038 (nuevas devDependencies) | `@vue/test-utils`, `happy-dom`, `@vitest/coverage-v8` no se nombran en §0; son test tooling compatible | plan (declarar permitido) |

### Por qué importan los MEDIUM

- **M1** — Un logo oscuro sobre fondo oscuro puede quedar invisible sin que el guard lo detecte, porque el color está en un PNG, no en CSS. Aceptarlo es razonable, pero debe quedar explícito en la auditoría.
- **M2** — El FCP es un presupuesto constitucional; si solo se anota a mano, una regresión de rendimiento no se detecta automáticamente. Se puede aceptar para esta feature (el cambio es CSS + un helper) dejando el registro manual.

## Routing recomendado

- **implement**: puede empezar. T031 (guard rojo) antes de cualquier barrido; T033/T034 cierran la cobertura global; T035/T037/T038/T039 cierran la evidencia.
- **tasks** (si se quiere cerrar M1/M2): ampliar T035 con inventario de activos y decidir si se añade Lighthouse a T039.
- **plan** (opcional): añadir las devDependencies de test a §0 para que el implementador aislado sepa que están permitidas.

## Nota

Informe de solo lectura sobre los artefactos; las correcciones se aplicaron en las fases `plan` y `tasks`.
