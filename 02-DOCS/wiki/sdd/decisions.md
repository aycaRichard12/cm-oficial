# sdd — decisiones

Registro append-only de decisiones tomadas durante el ciclo SDD. Las más recientes al final.

## 2026-10-26 — Tema oscuro (`tema-oscuro`)

- Alcance: toda la aplicación (login, layout, dashboard, módulos, formularios, tablas, diálogos).
- Persistencia: por dispositivo (navegador/PWA), no por cuenta; sin cambios de backend.
- Valor inicial: seguir la preferencia del sistema operativo cuando no hay elección guardada.
- Interruptor: icono visible en el header.
- Exportación/impresión: siempre clara, independientemente del tema en pantalla.
- Dirección técnica aprobada: tokens de color centralizados; se descartó confiar solo en el tema nativo y la capa oscura global.
- Ejecución: flujo con parada en cada fase (sin autopilot).

## 2026-10-26 — Clarify de `tema-oscuro`

- El cambio de tema se sincroniza entre pestañas abiertas del mismo dispositivo.
- Gráficos, mapas y tours guiados adaptan su paleta al tema activo (sin excepciones declaradas).
- Supuestos de la spec validados: contraste AA 4.5:1, login/404 tematizados, preferencia aplicada antes del primer pintado, accesibilidad por teclado, persistencia por navegador/PWA.

## 2026-10-26 — Plan de `tema-oscuro`

- Se usa el plugin `Dark` de Quasar como único interruptor, con tokens `--cm-*` encima; se descarta un sistema `data-theme` paralelo.
- La preferencia se guarda en `mistersofts-cm-theme` (`light`/`dark`); clave ausente = seguir al sistema.
- Anti-destello: script inline previo al entry point + reconciliación en `boot/theme.js`.
- Gráficos: helper `chartTheme` y opciones reactivas; mapas/tours: tema por CSS.
- PDF por captura DOM (`html2pdf`): guard temporal `withLightCapture`; jsPDF queda intacto.
- Tests: Vitest unitario con dependencias inyectadas (sin jsdom) + Playwright para login/print; auditoría visual manual para cobertura total.

## 2026-10-26 — Tasks de `tema-oscuro`

- Lista de 32 tareas con done-check ejecutable, trazada a la spec; IDs estables.
- TDD en la base: tests primero para resolver, controlador, chartTheme, withLightCapture, tokens, cableado y accesibilidad.
- Los barridos de módulos son paralelizables, pero T016/T017 (shell + compatibilidad) van antes de fan-out.
- Entrega recomendada: 3 PRs apilados (base, módulos, visuals/PDF/e2e) por superar el budget de revisión.
