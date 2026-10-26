# Route policy — módulos sensibles

Política verificada de protección por rutas. Se implementa en `src/config/routePolicy.js`
y se prueba en `tests/unit/route-policy.spec.js`.

| Código | Módulo | Roles permitidos |
|--------|---------|-------------------|
| registrarventa | sales | ADMINISTRADOR, VENTAS |
| procesarventaspendientes | sales | ADMINISTRADOR, VENTAS, ALMACEN |
| cuentasporcobrar | accounting | ADMINISTRADOR |
| cierrecaja | accounting | ADMINISTRADOR |
| notascreditodebito | accounting | ADMINISTRADOR |
| registrarcompra | inventory | ADMINISTRADOR, ALMACEN |
| configuracionfactura | admin | ADMINISTRADOR |

## Reglas

1. **El backend manda**: el guard del frontend es UX, no seguridad (INV-P-01).
2. Toda ruta protegida debe consultarse vía `canAccess(codigo, role)` antes de emitir `abrir-submenu` o `router.push`.
3. Cambios en esta tabla requieren PR + actualización de `tests/unit/route-policy.spec.js`.

## Próximo paso

Integrar `canAccess` en:
- `src/layouts/MainLayout.vue:288-303` (`selectSubmenu`)
- `src/layouts/NotificacionLayout.vue:162-186` (`markAsRead`)
