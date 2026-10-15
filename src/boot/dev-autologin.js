/**
 * Boot: dev-autologin
 * Solo activo en desarrollo (import.meta.env.DEV).
 * Inyecta automáticamente la sesión del primer usuario de credenciales.js
 * en el localStorage, con el mismo formato que produce LoginPage.vue.
 *
 * Para "cerrar sesión" en dev: borrar localStorage desde DevTools y recargar.
 */
import { mockAuthResponse, guardarSesionUsuario } from 'src/data/mockAuthResponse'

export default async function devAutologin() {
  const env = import.meta.env.VITE_APP_ENV || process.env.VITE_APP_ENV

  if (env === 'local') {
    try {
      const usuarioActual = JSON.parse(localStorage.getItem('mistersofts-cm') || '[]')
      if (
        localStorage.getItem('puedeIniciarsesion') &&
        usuarioActual[0]?.idusuario === mockAuthResponse[0]?.idusuario
      ) {
        return
      }
      guardarSesionUsuario(mockAuthResponse)
    } catch {
      guardarSesionUsuario(mockAuthResponse)
    }
    return
  }

  if (env !== 'pruebas') return
  if (localStorage.getItem('puedeIniciarsesion')) return
  // Prevent auto-login if the user just logged out
  if (sessionStorage.getItem('logoutIntencional')) return

  try {
    const { USUARIOS } = await import('src/credenciales.js')
    const entrada = USUARIOS[0]
    if (!entrada) return

    const usuarioDatos = entrada.usuario[0]
    // menurichard50 = [{ modulo, menu:[...] }] → los ítems reales están en [0].menu
    const menuRaw = entrada.menu[0]?.menu ?? []

    const userData = [{ ...usuarioDatos }]
    const idusuario = usuarioDatos.idusuario || ''

    const menuTransformado = menuRaw.map((item) => ({
      usuario: idusuario,
      titulo: item.titulo,
      codigo: item.codigo,
      submenu: (item.submenu || []).map((sub) => ({
        ...sub,
        codigo: sub.codigo ? `${sub.codigo.split('-')[0]}-${idusuario}` : sub.codigo,
      })),
    }))

    const userMenu = [{ modulo: 'cm', menu: menuTransformado }]

    localStorage.setItem('mistersofts-cm', JSON.stringify(userData))
    localStorage.setItem('mistersofts-cmmenu', JSON.stringify(userMenu))
    localStorage.setItem('puedeIniciarsesion', 'true')

    //console.log('[DEV] Auto-login como:', usuarioDatos.usuario)
  } catch (e) {
    console.warn('[DEV] Auto-login fallido:', e)
  }
}
