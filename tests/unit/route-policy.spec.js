import { describe, it, expect } from 'vitest'
import {
  ROUTE_POLICY,
  isProtected,
  requiredRoles,
  canAccess,
} from '../../src/config/routePolicy.js'

describe('Política de rutas sensibles', () => {
  it('cubre todos los módulos comerciales listados en la auditoría', () => {
    const required = [
      'registrarventa',
      'procesarventaspendientes',
      'cuentasporcobrar',
      'cierrecaja',
      'notascreditodebito',
      'registrarcompra',
      'configuracionfactura',
    ]
    for (const c of required) expect(isProtected(c)).toBe(true)
  })

  it('cada entrada tiene módulo, write y roles no vacíos', () => {
    for (const [codigo, pol] of Object.entries(ROUTE_POLICY)) {
      expect(pol.module, codigo).toBeTruthy()
      expect(typeof pol.write, codigo).toBe('boolean')
      expect(Array.isArray(pol.roles), codigo).toBe(true)
      expect(pol.roles.length, codigo).toBeGreaterThan(0)
    }
  })

  it('cuentasporcobrar y cierrecaja sólo las opera ADMINISTRADOR', () => {
    expect(requiredRoles('cuentasporcobrar')).toEqual(['ADMINISTRADOR'])
    expect(requiredRoles('cierrecaja')).toEqual(['ADMINISTRADOR'])
  })

  it('canAccess es false para rol no autorizado', () => {
    expect(canAccess('cuentasporcobrar', 'VENTAS')).toBe(false)
    expect(canAccess('registrarventa', 'VENTAS')).toBe(true)
  })

  it('rutas no listadas no son protegidas', () => {
    expect(isProtected('index')).toBe(false)
    expect(canAccess('index', 'VENTAS')).toBe(false)
  })
})
