---
status: approved-autopilot
date: 2026-10-29
---

# Plan — Full Internationalization (i18n)

## Architecture & approach
- Use existing `vue-i18n` setup in `src/i18n/`.
- Expand `src/i18n/es-ES/index.js` and `src/i18n/en-US/index.js` to cover missing modules (Auth, Sales, Inventory, Reports, Customers, Suppliers, etc.).
- Replace hardcoded text in `.vue` files with `$t('...')` or `t('...')`.
- Ensure language selector persists properly.

## Task breakdown
1. **Task 1: Expand i18n dictionary for Auth & Layouts**
   - Translate LoginPage, HeaderLayout, MainLayout, ComandoVoz.
   - Commit: `feat(i18n): add translations for auth and layouts`
2. **Task 2: Expand i18n dictionary for Ventas & Cotizacion**
   - Translate sales pages, carts, invoice forms, quotation modules.
   - Commit: `feat(i18n): add translations for sales and quotations`
3. **Task 3: Expand i18n dictionary for Inventario & Almacén**
   - Translate warehouse types, stock, external inventory, movements.
   - Commit: `feat(i18n): add translations for inventory and warehouse`
4. **Task 4: Expand i18n dictionary for Clientes, Proveedores & Cuentas x Cobrar**
   - Translate customer management, suppliers, accounts receivable/payable.
   - Commit: `feat(i18n): add translations for clients, suppliers and accounts`
5. **Task 5: Expand i18n dictionary for Reportes & Configuración restante**
   - Translate reports, prices, settings, and remaining components.
   - Commit: `feat(i18n): add translations for reports and settings`
6. **Task 6: Global verification & test suite**
   - Run linter, typecheck, and vitest. Ensure no regressions.
   - Commit: `test(i18n): verify internationalization coverage and pass tests`
