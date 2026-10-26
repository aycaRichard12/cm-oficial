// Tabla declarativa de rutas sensibles (INV-P-01).
// Debe coincidir con 02-DOCS/wiki/security/route-policy.md.

export const ROUTE_POLICY = {
  registrarventa: { module: 'sales', write: true, roles: ['ADMINISTRADOR', 'VENTAS'] },
  procesarventaspendientes: {
    module: 'sales',
    write: true,
    roles: ['ADMINISTRADOR', 'VENTAS', 'ALMACEN'],
  },
  cuentasporcobrar: { module: 'accounting', write: true, roles: ['ADMINISTRADOR'] },
  cierrecaja: { module: 'accounting', write: true, roles: ['ADMINISTRADOR'] },
  notascreditodebito: { module: 'accounting', write: true, roles: ['ADMINISTRADOR'] },
  registrarcompra: { module: 'inventory', write: true, roles: ['ADMINISTRADOR', 'ALMACEN'] },
  configuracionfactura: { module: 'admin', write: true, roles: ['ADMINISTRADOR'] },
}

export function isProtected(codigo) {
  return Object.prototype.hasOwnProperty.call(ROUTE_POLICY, codigo)
}

export function requiredRoles(codigo) {
  return ROUTE_POLICY[codigo]?.roles ?? []
}

export function canAccess(codigo, role) {
  return requiredRoles(codigo).includes(role)
}
