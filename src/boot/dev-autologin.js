/**
 * Boot: dev-autologin
 * Solo activo en desarrollo (import.meta.env.DEV).
 * Inyecta automáticamente la sesión del primer usuario de credenciales.js
 * en el localStorage, con el mismo formato que produce LoginPage.vue.
 *
 * Para "cerrar sesión" en dev: borrar localStorage desde DevTools y recargar.
 */
export default async function devAutologin() {
  if (import.meta.env.VITE_APP_ENV !== 'pruebas') return
  if (localStorage.getItem('puedeIniciarsesion')) return

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
      submenu: item.submenu || [],
    }))

    const userMenu = [{ modulo: 'cm', menu: menuTransformado }]

    localStorage.setItem('mistersofts-cm', JSON.stringify(userData))
    localStorage.setItem('mistersofts-cmmenu', JSON.stringify(userMenu))
    localStorage.setItem('puedeIniciarsesion', 'true')

    console.log('[DEV] Auto-login como:', usuarioDatos.usuario)
  } catch (e) {
    console.warn('[DEV] Auto-login fallido:', e)
  }
}
