---
status: approved-autopilot
date: 2026-10-29
---

# Spec — Full Internationalization (i18n)

## Problem & why
Mistersofts has partial internationalization support. Many UI elements (buttons, labels, notifications, error messages) are hardcoded in Spanish, preventing a consistent experience for English-speaking users or future markets.

## Cost of not building it
- Inconsistent user experience when switching languages.
- Hardcoded strings make the codebase harder to maintain and scale.
- Limited market reach to only Spanish-speaking regions.

## The cheapest alternative
Continue adding translations manually and ad-hoc. This leads to fragmentation, missing keys, and technical debt. A systematic sweep is more efficient.

## Goals
- 100% of visible frontend text strings externalized to i18n files.
- Full support for Spanish (es-ES) and English (en-US).
- Functional and persistent language selector.
- Zero regressions in business logic or UI layout.

## Non-goals / out of scope
- Translating database content (product names, descriptions stored in DB).
- Modifying Backend API responses (unless mapping error codes in the frontend).
- Adding new languages beyond es-ES and en-US.

## Users & context
- Administrative users who prefer English.
- Developers who need a clean, internationalized codebase.

## Behaviour
- **Language Detection:** The system uses the stored locale in `localStorage` or defaults to `es-ES`.
- **Switching:** When the user changes the language, the entire UI updates immediately without a page reload (Vue-i18n reactivity).
- **Persistence:** The choice is saved in `localStorage` and persists across sessions.
- **Missing Keys:** If a key is missing in one language, it falls back to the default locale.

## Acceptance criteria
- Given the application, When I switch to English, Then all menus, buttons, table headers, and form labels are displayed in English.
- Given a validation error (e.g., "Field required"), When the language is English, Then the error message is displayed in English.
- Given a notification (success/error), When the language is English, Then the notification text is in English.
- Given a page refresh, When a language was previously selected, Then that language is preserved.
- No hardcoded strings remain in `.vue` or `.js` files (except technical IDs/keys).

## Points to clarify
- **suposición tomada** — Seguimos la jerarquía actual por módulos (`configuracion`, `configGeneral`, etc.). *Base:* Estructura existente en `src/i18n/es-ES/index.js`.
- **suposición tomada** — Los mensajes de error del backend se mapearán en el frontend mediante códigos de error si es posible; si el backend envía el string directo, se mantendrá el original (fuera de alcance modificar backend).
- **decisión diferida** — Soporte para RTL (Right-to-Left); fuera de este ciclo.
- **pregunta abierta** — ¿Existen reportes PDF generados en el frontend que necesiten traducción? (Asumimos que sí y los incluiremos si se encuentran).
