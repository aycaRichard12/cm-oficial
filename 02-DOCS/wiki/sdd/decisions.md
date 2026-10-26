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
