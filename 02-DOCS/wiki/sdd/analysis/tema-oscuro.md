---
type: analysis
title: Análisis de consistencia — tema oscuro
description: Gate pre-implementación de constitución, spec, plan y tareas para `tema-oscuro`.
tags: [sdd, analysis]
timestamp: 2026-10-26T14:00:00Z
topic: sdd
slug: tema-oscuro
status: blocked
---

# Análisis de consistencia — `tema-oscuro`

> Gate pre-implementación · 2026-10-26 · Regla: reportar, no resolver.

## Veredicto

**GATE: BLOCKED** — 1 CRITICAL, 5 HIGH, 4 MEDIUM, 4 LOW.

No hay violación de la constitución. El bloqueo viene de cobertura incompleta de "toda la app", una verificación de accesibilidad sin tarea, y contradicciones de orden/paralelización en las tareas.

## Mapa de cobertura

| REQ-ID | Requisito (spec) | Plan | Tareas | Estado |
| --- | --- | --- | --- | --- |
| R1 | AC#1 sin pref + SO oscuro → oscuro en primer render | §2, §4, §5 | T001, T002, T011, T012, T029 | covered |
| R2 | AC#2 sin pref + SO claro → claro | §2, §4, §5 | T001, T002, T011, T012, T029 | covered |
| R3 | AC#3 alternar a oscuro sin recargar | §3, §4 | T003, T004, T014, T015 | covered |
| R4 | AC#4 alternar de vuelta a claro | §3, §4 | T003, T004, T014, T015 | covered |
| R5 | AC#5 elección oscuro persiste al reabrir | §3, §4 | T003, T004, T014 | covered |
| R6 | AC#6 claro gana sobre SO oscuro | §3, §4 | T003, T004, T014 | covered |
| R7 | AC#7 todas las pantallas sin paneles claros + AA 4.5:1 | §2, §6 | T016–T022, T031 | **GAP** (cobertura parcial; contraste sin check) |
| R8 | AC#8 gráficos, mapas y tours tematizados | §2, §3, §6 | T023–T026 | covered |
| R9 | AC#9 sincronización entre pestañas | §3, §4 | T003, T004, T014 | covered |
| R10 | AC#10 print/PDF siempre claro | §3, §6 | T007, T008, T027, T028, T030 | covered (con caveat de skip) |
| R11 | AC#11 teclado + estado anunciado | §3, §5 | T013, T015 | **AMBIGUOUS** (solo atributos estáticos) |
| R12 | AC#12 preferencia corrupta → sistema | §3 | T001, T002 | covered |
| R13 | AC#13 sin destello al recargar | §2, §4, §5 | T011, T012, T029 | covered |
| G1 | Login y pantallas de error tematizados | §1, §6 paso 2 | T016 (solo login) | **GAP** (404/error sin tarea) |
| G2 | "Toda la app" incluye todos los módulos | §6 pasos 4–5 | T018–T022 | **GAP** (inventario de archivos incompleto) |
| B1 | Cambio del SO en vivo si no hay elección manual | §3 | T003, T004 | covered |
| B2 | Fallo al guardar no bloquea | §3 | T003, T004 | covered |
| B3 | Imágenes/logos legibles en oscuro | §7 (riesgo) | T031 (auditoría) | **AMBIGUOUS** (sin criterio ni tarea de activos) |

## Hallazgos

| # | Severidad | Tipo | Artefacto A (loc) | Artefacto B (loc) | Conflicto | Resolver en |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | CRITICAL | Coverage GAP | spec §Goals, §Acceptance #7 | plan §6 pasos 4–5; tareas T018–T022 | "Toda la app" no se cubre: faltan páginas y componentes (p. ej. `src/pages/devoluciones`, `src/pages/pedidos`, `src/pages/proveedor`, `src/pages/movimiento`, `src/components/almacen`, `src/components/anulaciones`, `src/components/Modals`, `src/components/pedidos`, `src/components/proveedor`, `src/components/welcome`) | tasks |
| F2 | HIGH | Coverage GAP | spec §Goals (login y error) | plan §6 paso 2; tarea T016 | La spec exige tematizar pantallas de error/404; ni el plan ni T016 las incluyen | plan + tasks |
| F3 | HIGH | Coverage GAP | plan §5 (e2e para #11) | tareas T013, T015 | AC#11 exige operar por teclado y anunciar estado; solo hay test estático de atributos, no de comportamiento | tasks |
| F4 | HIGH | Contradicción de orden | tareas T016, T018–T022 (done-check usa `theme-guard.spec.js`) | tarea T031 (crea ese test) | El done-check de siete tareas exige un archivo que se crea en una tarea posterior | tasks |
| F5 | HIGH | Contradicción de paralelización | tarea T021 `[P]` | tarea T023 `[P]` | Comparten archivos (`src/components/reporte`, `src/components/dasboardVendedor`); un falso `[P]` provoca colisiones de merge | tasks |
| F6 | HIGH | Ambiguity / carrier | plan §0 (solo `--cm-*` como ejemplo) | tareas T016, T018–T022 | Un implementador aislado no conoce los nombres exactos de tokens ni la lista de literales prohibidos del guard | plan |
| F7 | MEDIUM | Ambiguity | spec §Acceptance #7 (AA 4.5:1) | plan §5; tarea T031 | "Contraste AA" y "checklist de auditoría" no tienen medición ejecutable ni artefacto durable | tasks |
| F8 | MEDIUM | Ambiguity | spec §Acceptance #10 | tarea T030 ("o skip documentado") | La aceptación puede pasar sin ejecutar el e2e de impresión | tasks |
| F9 | MEDIUM | Coverage GAP | constitution §2 (70%) y §8 (bundle/FCP) | plan §5; tarea T032 | No hay tarea que mida cobertura de líneas ni presupuesto de bundle/FCP | tasks |
| F10 | MEDIUM | Ambiguity | tarea T025 ("observación: captura") | tarea T031 ("checklist completado en la sesión") | Done-checks manuales sin comando ni artefacto que los pruebe | tasks |
| F11 | LOW | Trazabilidad | tarea T031 (`Depends-on: T018–T022`) | tarea T032 (`Depends-on: all`) | No son IDs literales; rompen la resolución automática de dependencias | tasks |
| F12 | LOW | Constitución §7 | constitution §7 ("toda mutación da feedback") | plan §3 (toggle) | No se declara si el cambio visual cuenta como feedback o hace falta toast | plan |
| F13 | LOW | Ambiguity | spec §Goals ("cualquier pantalla autenticada") | plan §2 (toggle en `HeaderLayout`) | No se confirma que todo layout autenticado monte el header | plan |
| F14 | LOW | Verificación débil | tarea T023 (`grep "background: white"`) | spec §Acceptance #7 | El grep solo detecta una variante; otras (`#fff`, `#f5f7fa`, `background-color`) quedan fuera | tasks |

### Por qué importa (CRITICAL/HIGH)

- **F1** — Si se implementa con el mapa actual, quedan pantallas claras en oscuro; incumple el criterio #7 y la promesa central de la feature. Es el fallo más caro y el más visible.
- **F2** — El login sí está, pero una pantalla de error clara rompe la coherencia justo cuando el usuario ya está en un estado de fallo.
- **F3** — La accesibilidad puede fallar en producción (teclado/lector) sin que ninguna prueba lo detecte; el test estático solo comprueba que los atributos existen, no que funcionan.
- **F4** — Siete tareas no se pueden marcar como done hasta el final; el flujo TDD se rompe y el implementador puede saltarse el guard.
- **F5** — Dos workers paralelos editan los mismos archivos; el resultado es un conflicto de merge o una pérdida de cambios.
- **F6** — Un worker aislado inventará nombres de tokens y una lista de prohibidos distinta; el barrido se vuelve inconsistente.

## Routing recomendado

- **tasks** (F1, F3, F4, F5, F7, F8, F9, F10, F11, F14): crear el guard de literales antes del primer barrido, ampliar el inventario de archivos a toda la app, añadir una tarea de e2e de accesibilidad, quitar el `[P]` de T023 o secuenciarlo tras T021, añadir medición de cobertura y bundle, y hacer durables los done-checks manuales.
- **plan** (F2, F6, F12, F13): añadir el inventario completo de superficies (incluidas 404/error), subir la lista exacta de tokens y literales prohibidos a §0 o a Interfaces, y declarar el criterio de feedback/header.
- **spec**: no requiere cambios; el gate detectó huecos de derivación, no de intención.

## Nota de alcance

El informe es de solo lectura: no se editó la spec, el plan ni las tareas. Las decisiones de corrección corresponden a las fases `tasks` y `plan`.
